import { adminClient } from '@/lib/supabase/admin';
import { parsePDF }  from './parsers/pdf';
import { parseDOCX } from './parsers/docx';
import { parseXLSX } from './parsers/xlsx';
import { parsePPTX } from './parsers/pptx';
import { parseTXT, parseCSV, parseHTML } from './parsers/text';
import { chunkText } from '@/lib/utils';
import ollama from 'ollama';

const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'all-minilm';
const BATCH = 10;

async function embed(text: string): Promise<number[]> {
  const res = await ollama.embed({ model: EMBED_MODEL, input: text });
  return res.embeddings[0];
}

async function setStatus(
  id: string,
  status: string,
  extra: Record<string, unknown> = {}
) {
  await adminClient
    .from('documents')
    .update({ status, ...extra })
    .eq('id', id);
}

export async function processDocument(documentId: string): Promise<void> {
  try {
    await setStatus(documentId, 'processing');

    // Load document record
    const { data: doc, error: docErr } = await adminClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docErr || !doc) throw new Error('Document not found');

    // Download file from storage
    const { data: file, error: dlErr } = await adminClient.storage
      .from('documents')
      .download(doc.storage_path);

    if (dlErr || !file) throw new Error('Download failed: ' + (dlErr?.message ?? 'no file'));

    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse
    await setStatus(documentId, 'chunking');
    let text = '';
    let meta: Record<string, unknown> = {};

    switch (doc.file_type.toLowerCase()) {
      case 'pdf': {
        const r = await parsePDF(buffer);
        text = r.text;
        meta = { page_count: r.pageCount };
        break;
      }
      case 'docx': {
        const r = await parseDOCX(buffer);
        text = r.text;
        break;
      }
      case 'xlsx':
      case 'xls': {
        const r = parseXLSX(buffer);
        text = r.text;
        meta = { sheet_names: r.sheetNames };
        break;
      }
      case 'pptx': {
        const r = await parsePPTX(buffer);
        text = r.text;
        meta = { slide_count: r.slideCount };
        break;
      }
      case 'csv':
        text = parseCSV(buffer);
        break;
      case 'html':
      case 'htm':
        text = parseHTML(buffer);
        break;
      default:
        text = parseTXT(buffer);
    }

    if (!text.trim()) throw new Error('No text could be extracted');

    // Chunk
    // Strip control characters that break pgvector
    const cleaned = text
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
      .replace(/\uFFFD/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const chunks = chunkText(cleaned, 512, 64);

    // Embed + store in batches
    await setStatus(documentId, 'embedding');

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);
      const records = [];

      for (let j = 0; j < batch.length; j++) {
        const embedding = await embed(batch[j]);
        records.push({
          document_id: documentId,
          org_id:      doc.org_id,
          content:     batch[j],
          embedding,
          chunk_index: i + j,
          metadata:    meta,
        });
      }

      const { error: insErr } = await adminClient
        .from('document_chunks')
        .insert(records);

      if (insErr) throw new Error('Insert failed: ' + insErr.message);
    }

    // Mark ready
    await setStatus(documentId, 'ready', {
      chunk_count: chunks.length,
      metadata: meta,
    });

  } catch (err) {
    await setStatus(documentId, 'failed', {
      error_message: String(err),
    });
    console.error('[ingestion] error:', err);
    throw err;
  }
}
