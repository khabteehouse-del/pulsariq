// PulsarIQ — Phase 1: Document Ingestion Pipeline
// Run from C:\pulsariq: node phase1.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(filePath, content) {
  const full = path.join(root, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  \u2713', filePath);
}

console.log('\n  PulsarIQ \u2014 Phase 1: Ingestion Pipeline\n');

// Ensure dirs
['lib/ingestion/parsers', 'app/api/ingest'].forEach(d =>
  fs.mkdirSync(path.join(root, d), { recursive: true })
);
fs.mkdirSync(path.join(root, 'app', 'api', 'documents', '[id]'), { recursive: true });
console.log('  \u2713 Directories\n');

// ── 1. PDF Parser ─────────────────────────────────────────────
write('lib/ingestion/parsers/pdf.ts', String.raw`
import pdfParse from 'pdf-parse';

export interface PDFResult {
  text: string;
  pageCount: number;
}

export async function parsePDF(buffer: Buffer): Promise<PDFResult> {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text.trim(),
      pageCount: data.numpages,
    };
  } catch (err) {
    throw new Error('PDF parse failed: ' + String(err));
  }
}
`);

// ── 2. DOCX Parser ────────────────────────────────────────────
write('lib/ingestion/parsers/docx.ts', String.raw`
import mammoth from 'mammoth';

export interface DOCXResult {
  text: string;
}

export async function parseDOCX(buffer: Buffer): Promise<DOCXResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value.trim() };
  } catch (err) {
    throw new Error('DOCX parse failed: ' + String(err));
  }
}
`);

// ── 3. XLSX Parser ────────────────────────────────────────────
write('lib/ingestion/parsers/xlsx.ts', String.raw`
import * as XLSX from 'xlsx';

export interface XLSXResult {
  text: string;
  sheetNames: string[];
}

export function parseXLSX(buffer: Buffer): XLSXResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const parts: string[] = [];

    for (const name of sheetNames) {
      const sheet = workbook.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      parts.push('Sheet: ' + name + '\n' + csv);
    }

    return { text: parts.join('\n\n'), sheetNames };
  } catch (err) {
    throw new Error('XLSX parse failed: ' + String(err));
  }
}
`);

// ── 4. Text/CSV/HTML Parser ───────────────────────────────────
write('lib/ingestion/parsers/text.ts', String.raw`
import * as cheerio from 'cheerio';
import Papa from 'papaparse';

export function parseTXT(buffer: Buffer): string {
  return buffer.toString('utf-8').trim();
}

export function parseCSV(buffer: Buffer): string {
  try {
    const raw = buffer.toString('utf-8');
    const result = Papa.parse(raw, { header: true, skipEmptyLines: true });
    return (result.data as unknown[]).map(r => JSON.stringify(r)).join('\n');
  } catch {
    return buffer.toString('utf-8').trim();
  }
}

export function parseHTML(buffer: Buffer): string {
  try {
    const $ = cheerio.load(buffer.toString('utf-8'));
    $('script, style, nav, footer, head').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  } catch {
    return buffer.toString('utf-8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
`);

// ── 5. PPTX Parser (via JSZip) ───────────────────────────────
write('lib/ingestion/parsers/pptx.ts', String.raw`
import JSZip from 'jszip';

export interface PPTXResult {
  text: string;
  slideCount: number;
}

export async function parsePPTX(buffer: Buffer): Promise<PPTXResult> {
  try {
    const zip = await JSZip.loadAsync(buffer);

    const slideFiles = Object.keys(zip.files)
      .filter(n => n.startsWith('ppt/slides/slide') && n.endsWith('.xml'))
      .sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, ''), 10);
        const nb = parseInt(b.replace(/\D/g, ''), 10);
        return na - nb;
      });

    const slides: string[] = [];
    for (const file of slideFiles) {
      const xml = await zip.files[file].async('string');
      // Pull text from <a:t> tags
      const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? [];
      const text = matches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) slides.push(text);
    }

    return { text: slides.join('\n\n'), slideCount: slideFiles.length };
  } catch (err) {
    throw new Error('PPTX parse failed: ' + String(err));
  }
}
`);

// ── 6. Ingestion Orchestrator ─────────────────────────────────
write('lib/ingestion/index.ts', String.raw`
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
    const chunks = chunkText(text, 512, 64);

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
`);

// ── 7. GET + POST /api/documents ──────────────────────────────
write('app/api/documents/route.ts', String.raw`
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient }  from '@/lib/supabase/admin';
import { processDocument } from '@/lib/ingestion';

// GET /api/documents — list org documents
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile?.org_id)
    return NextResponse.json({ error: 'No organisation' }, { status: 400 });

  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ documents });
}

// POST /api/documents — upload + trigger ingestion
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.org_id)
    return NextResponse.json({ error: 'No organisation' }, { status: 400 });

  if (!['admin', 'manager'].includes(profile.role))
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

  const form = await request.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'txt';
  const storagePath = profile.org_id + '/' + Date.now() + '-' + file.name;

  // Upload to Supabase Storage
  const { error: upErr } = await adminClient.storage
    .from('documents')
    .upload(storagePath, await file.arrayBuffer(), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (upErr)
    return NextResponse.json({ error: 'Upload failed: ' + upErr.message }, { status: 500 });

  // Create document record
  const { data: document, error: dbErr } = await adminClient
    .from('documents')
    .insert({
      org_id:       profile.org_id,
      uploaded_by:  user.id,
      name:         file.name,
      file_type:    ext,
      file_size:    file.size,
      storage_path: storagePath,
      status:       'pending',
    })
    .select()
    .single();

  if (dbErr || !document)
    return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });

  // Kick off ingestion in background (non-blocking)
  processDocument(document.id).catch(console.error);

  return NextResponse.json({ document }, { status: 201 });
}
`);

// ── 8. GET + DELETE /api/documents/[id] ──────────────────────
write('app/api/documents/[id]/route.ts', String.raw`
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient }  from '@/lib/supabase/admin';

type Params = { params: { id: string } };

// GET /api/documents/:id
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !document)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ document });
}

// DELETE /api/documents/:id  (admin only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Admins only' }, { status: 403 });

  // Remove from storage
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', params.id)
    .single();

  if (doc?.storage_path) {
    await adminClient.storage.from('documents').remove([doc.storage_path]);
  }

  // Delete record (cascades to chunks)
  const { error } = await adminClient
    .from('documents')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
`);

// ── 9. POST /api/ingest — manual retry ───────────────────────
write('app/api/ingest/route.ts', String.raw`
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processDocument } from '@/lib/ingestion';

// POST /api/ingest  body: { documentId: string }
// Re-trigger ingestion (useful for retrying failed documents)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!['admin', 'manager'].includes(profile?.role ?? ''))
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

  const body = await request.json() as { documentId?: string };
  if (!body.documentId)
    return NextResponse.json({ error: 'documentId required' }, { status: 400 });

  // Fire and forget
  processDocument(body.documentId).catch(console.error);

  return NextResponse.json({ message: 'Ingestion started', documentId: body.documentId });
}
`);

console.log('\n  \u2705 Phase 1 complete!\n');
console.log('  Required steps before testing:');
console.log('  1. Add to .env.local:  OLLAMA_EMBED_MODEL=all-minilm');
console.log('  2. Pull embed model:   ollama pull all-minilm');
console.log('  3. npm run dev\n');
console.log('  API endpoints ready:');
console.log('  POST   /api/documents        upload a file');
console.log('  GET    /api/documents        list documents');
console.log('  GET    /api/documents/:id    get one document');
console.log('  DELETE /api/documents/:id    delete document');
console.log('  POST   /api/ingest           retry failed ingestion\n');
