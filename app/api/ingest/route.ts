import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin-inline';

async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text || '';
    }
    if (fileType === 'docx') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }
    if (fileType === 'xlsx' || fileType === 'xls') {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buffer);
      return wb.SheetNames.map(n => XLSX.utils.sheet_to_txt(wb.Sheets[n])).join('\n');
    }
    // txt, csv, html, md — plain text
    return buffer.toString('utf-8');
  } catch (err: any) {
    throw new Error('Text extraction failed: ' + err.message);
  }
}

function chunkText(text: string, size = 500, overlap = 50): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    const chunk = words.slice(i, i + size).join(' ');
    if (chunk.trim()) chunks.push(chunk);
  }
  return chunks;
}

async function embedWithOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions: 384,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('OpenAI embedding error: ' + err);
  }

  const data = await res.json();
  return data.data.map((d: any) => d.embedding);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.documentId) {
      return NextResponse.json({ error: 'documentId required' }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // Fetch document record
    const { data: doc, error: docError } = await adminClient
      .from('documents')
      .select('*')
      .eq('id', body.documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Download file from storage
    const { data: fileData, error: fileError } = await adminClient.storage
      .from('documents')
      .download(doc.storage_path);

    if (fileError || !fileData) {
      await adminClient.from('documents').update({ status: 'failed', error_message: 'Could not download file from storage' }).eq('id', doc.id);
      return NextResponse.json({ error: 'Storage download failed' }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Extract text
    let text = '';
    try {
      text = await extractText(buffer, doc.file_type?.toLowerCase() || 'txt');
    } catch (err: any) {
      await adminClient.from('documents').update({ status: 'failed', error_message: err.message }).eq('id', doc.id);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    if (!text.trim()) {
      await adminClient.from('documents').update({ status: 'failed', error_message: 'No text could be extracted' }).eq('id', doc.id);
      return NextResponse.json({ error: 'No text extracted' }, { status: 400 });
    }

    // Chunk text
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      await adminClient.from('documents').update({ status: 'failed', error_message: 'No chunks generated' }).eq('id', doc.id);
      return NextResponse.json({ error: 'No chunks' }, { status: 400 });
    }

    // Generate embeddings via OpenAI
    let embeddings: number[][] = [];
    try {
      // Process in batches of 100
      for (let i = 0; i < chunks.length; i += 100) {
        const batch = chunks.slice(i, i + 100);
        const batchEmbeddings = await embedWithOpenAI(batch);
        embeddings.push(...batchEmbeddings);
      }
    } catch (err: any) {
      await adminClient.from('documents').update({ status: 'failed', error_message: 'Embedding failed: ' + err.message }).eq('id', doc.id);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    // Delete existing chunks
    await adminClient.from('document_chunks').delete().eq('document_id', doc.id);

    // Insert new chunks with embeddings
    const rows = chunks.map((content, i) => ({
      document_id: doc.id,
      content,
      chunk_index: i,
      embedding: JSON.stringify(embeddings[i]),
    }));

    const { error: insertError } = await adminClient.from('document_chunks').insert(rows);

    if (insertError) {
      await adminClient.from('documents').update({ status: 'failed', error_message: 'DB insert failed: ' + insertError.message }).eq('id', doc.id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Mark document as ready
    await adminClient.from('documents').update({ status: 'ready', chunk_count: chunks.length, error_message: null }).eq('id', doc.id);

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (err: any) {
    console.error('Ingest exception:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
