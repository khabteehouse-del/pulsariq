// PulsarIQ — Phase 4: Dashboard UI + RAG Chat
// Run from C:\pulsariq: node phase4.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(filePath, content) {
  const full = path.join(root, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  \u2713', filePath);
}

console.log('\n  PulsarIQ \u2014 Phase 4: Dashboard UI + RAG\n');

[
  'app/(dashboard)/documents',
  'app/(dashboard)/chat',
  'app/(dashboard)/analytics',
  'app/(dashboard)/settings',
  'app/api/chat',
].forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }));
console.log('  \u2713 Directories\n');

// ── 1. Documents Page ─────────────────────────────────────────
write('app/(dashboard)/documents/page.tsx', String.raw`
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, RefreshCw, FileText } from 'lucide-react';
import Topbar from '@/components/layout/topbar';
import { formatFileSize, timeAgo, getDocType } from '@/lib/utils';
import type { Document } from '@/types/database';

const STATUS: Record<string, { color: string; label: string }> = {
  pending:    { color: '#94A3B8', label: 'Pending'   },
  processing: { color: '#6366F1', label: 'Processing'},
  chunking:   { color: '#6366F1', label: 'Chunking'  },
  embedding:  { color: '#A855F7', label: 'Embedding' },
  ready:      { color: '#22C55E', label: 'Ready'     },
  failed:     { color: '#EF4444', label: 'Failed'    },
};

const TYPE_COLOR: Record<string, string> = {
  PDF: '#EF4444', DOC: '#3B82F6', XLS: '#22C55E',
  PPT: '#F97316', CSV: '#A855F7', TXT: '#94A3B8', HTML: '#F59E0B',
};

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'text/html': ['.html'],
};

export default function DocumentsPage() {
  const [docs, setDocs]           = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  const fetchDocs = useCallback(async () => {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const d = await res.json() as { documents: Document[] };
      setDocs(d.documents ?? []);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    const iv = setInterval(fetchDocs, 3000);
    return () => clearInterval(iv);
  }, [fetchDocs]);

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    setError('');
    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/documents', { method: 'POST', body: form });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? 'Upload failed');
      }
    }
    setUploading(false);
    fetchDocs();
  }, [fetchDocs]);

  const deleteDoc = async (id: string) => {
    if (!window.confirm('Delete this document and all its data?')) return;
    await fetch('/api/documents/' + id, { method: 'DELETE' });
    fetchDocs();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPT, maxSize: 52428800,
  });

  return (
    <>
      <Topbar title="Documents" subtitle={docs.length + ' documents in your knowledge base'} />
      <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Upload Zone */}
        <div {...getRootProps()} style={{
          padding: '36px 24px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
          border: '2px dashed ' + (isDragActive ? '#6366F1' : 'rgba(99,102,241,0.2)'),
          background: isDragActive ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
        }}>
          <input {...getInputProps()} />
          <Upload size={30} color={isDragActive ? '#6366F1' : '#64748B'} style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>
            {uploading ? 'Uploading...' : isDragActive ? 'Drop to upload' : 'Drag & drop or click to upload'}
          </p>
          <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>
            PDF · DOCX · XLSX · PPTX · CSV · TXT · HTML — max 50 MB
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Document list */}
        {docs.length > 0 && (
          <div style={{ borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>All Documents</span>
              <button onClick={fetchDocs} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
                <RefreshCw size={13} />
              </button>
            </div>
            {docs.map((doc, i) => {
              const type  = getDocType(doc.name);
              const sc    = STATUS[doc.status] ?? STATUS.pending;
              const tc    = TYPE_COLOR[type] ?? '#94A3B8';
              return (
                <div key={doc.id} style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < docs.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: tc + '14', border: '1px solid ' + tc + '28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: tc, flexShrink: 0, letterSpacing: '0.5px' }}>
                    {type}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {formatFileSize(doc.file_size)}
                      {doc.chunk_count > 0 ? ' \u00B7 ' + doc.chunk_count + ' chunks' : ''}
                      {' \u00B7 ' + timeAgo(doc.created_at)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: sc.color + '12', border: '1px solid ' + sc.color + '25', flexShrink: 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color }} />
                    <span style={{ fontSize: 10, color: sc.color, fontWeight: 600 }}>{sc.label}</span>
                  </div>
                  <button onClick={() => deleteDoc(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4, flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {docs.length === 0 && !uploading && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748B', fontSize: 14 }}>
            <FileText size={36} color="#334155" style={{ display: 'block', margin: '0 auto 12px' }} />
            No documents yet. Upload your first file above.
          </div>
        )}
      </main>
    </>
  );
}
`);

// ── 2. Chat API Route (RAG) ───────────────────────────────────
write('app/api/chat/route.ts', String.raw`
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import ollama from 'ollama';

const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'all-minilm';
const CHAT_MODEL  = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    question:    string;
    documentIds?: string[];
    sessionId?:  string;
  };

  const { question, documentIds, sessionId } = body;
  if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ error: 'No organisation' }, { status: 400 });

  try {
    // 1. Embed the question
    const embedRes = await ollama.embed({ model: EMBED_MODEL, input: question });
    const embedding = embedRes.embeddings[0];

    // 2. Search vector store
    const { data: chunks, error: searchErr } = await supabase.rpc('match_chunks', {
      query_embedding:    embedding,
      match_org_id:       profile.org_id,
      match_document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
      match_threshold:    0.45,
      match_count:        6,
    });

    if (searchErr) throw new Error('Vector search failed: ' + searchErr.message);

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        answer: 'I could not find relevant information in your documents for this question. Try uploading more relevant documents or rephrasing your question.',
        citations: [],
      });
    }

    // 3. Build context from chunks
    const context = (chunks as { id: string; document_id: string; content: string; similarity: number }[])
      .map((c, i) => '[Source ' + (i + 1) + ']\n' + c.content)
      .join('\n\n---\n\n');

    // 4. Call Ollama chat
    const systemPrompt = 'You are PulsarIQ, a precise enterprise AI assistant. Answer questions ONLY using the provided document context. Cite sources using [Source N] notation. Be concise and professional. If the context does not contain the answer, say so clearly.';

    const userPrompt = 'DOCUMENT CONTEXT:\n\n' + context + '\n\n---\n\nQUESTION: ' + question + '\n\nProvide a precise answer with source citations:';

    const chatRes = await ollama.chat({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      stream: false,
    });

    const answer = chatRes.message.content;

    // 5. Save to session if provided
    if (sessionId) {
      await supabase.from('messages').insert([
        { session_id: sessionId, org_id: profile.org_id, role: 'user',      content: question, citations: [] },
        { session_id: sessionId, org_id: profile.org_id, role: 'assistant', content: answer,   citations: [] },
      ]);
    }

    // 6. Log analytics
    await supabase.from('analytics_logs').insert({
      org_id: profile.org_id, user_id: user.id, event_type: 'query',
      metadata: { question: question.slice(0, 100), chunk_count: chunks.length },
    });

    const citations = (chunks as { id: string; document_id: string; content: string; similarity: number }[]).map((c, i) => ({
      source:      i + 1,
      chunk_id:    c.id,
      doc_id:      c.document_id,
      excerpt:     c.content.slice(0, 200) + (c.content.length > 200 ? '...' : ''),
      similarity:  Math.round(c.similarity * 100),
    }));

    return NextResponse.json({ answer, citations });

  } catch (err) {
    console.error('[chat] error:', err);
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
      return NextResponse.json({ error: 'Ollama is not running. Start it with: ollama serve' }, { status: 503 });
    }
    return NextResponse.json({ error: 'AI error: ' + msg }, { status: 500 });
  }
}
`);

// ── 3. Chat Page ──────────────────────────────────────────────
write('app/(dashboard)/chat/page.tsx', String.raw`
'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, FileText, AlertCircle } from 'lucide-react';
import Topbar from '@/components/layout/topbar';
import type { Document } from '@/types/database';
import { getDocType } from '@/lib/utils';

interface ChatMessage {
  role:      'user' | 'assistant';
  content:   string;
  citations?: { source: number; excerpt: string; similarity: number }[];
}

export default function ChatPage() {
  const [docs, setDocs]           = useState<Document[]>([]);
  const [selectedIds, setSelected]= useState<string[]>([]);
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [question, setQuestion]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then((d: { documents?: Document[] }) => {
        const ready = (d.documents ?? []).filter(doc => doc.status === 'ready');
        setDocs(ready);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleDoc = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const sendMessage = async () => {
    if (!question.trim() || loading) return;
    setError('');
    const q = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: q, documentIds: selectedIds.length > 0 ? selectedIds : undefined }),
      });

      const data = await res.json() as { answer?: string; citations?: { source: number; excerpt: string; similarity: number }[]; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer ?? '', citations: data.citations }]);
      }
    } catch (err) {
      setError('Network error: ' + String(err));
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const TYPE_COLOR: Record<string, string> = {
    PDF: '#EF4444', DOC: '#3B82F6', XLS: '#22C55E',
    PPT: '#F97316', CSV: '#A855F7', TXT: '#94A3B8',
  };

  return (
    <>
      <Topbar title="AI Chat" subtitle="Ask questions across your documents" />
      <div style={{ display: 'flex', height: 'calc(100vh - 58px)' }}>

        {/* Left: Document Selector */}
        <div style={{ width: 240, borderRight: '1px solid rgba(99,102,241,0.12)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>
            {selectedIds.length === 0 ? 'All Docs' : selectedIds.length + ' selected'}
          </p>
          {docs.length === 0 && (
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              No ready documents. Upload and wait for processing.
            </p>
          )}
          {docs.map(doc => {
            const type     = getDocType(doc.name);
            const tc       = TYPE_COLOR[type] ?? '#94A3B8';
            const selected = selectedIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: selected ? 'rgba(99,102,241,0.1)' : 'transparent', border: '1px solid ' + (selected ? 'rgba(99,102,241,0.25)' : 'transparent'), transition: 'all 0.15s' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, background: tc + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: tc, flexShrink: 0 }}>{type}</div>
                <span style={{ fontSize: 12, color: selected ? '#F1F5F9' : '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
              </div>
            );
          })}
        </div>

        {/* Right: Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', color: '#475569' }}>
                <Bot size={40} color="#334155" style={{ display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14, margin: 0 }}>Ask anything about your documents</p>
                <p style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                  {selectedIds.length === 0 ? 'Searching all documents' : 'Searching ' + selectedIds.length + ' selected document' + (selectedIds.length > 1 ? 's' : '')}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg,#6366F1,#22D3EE)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {msg.role === 'user' ? <User size={13} color="#fff" /> : <Bot size={13} color="#6366F1" />}
                  </div>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg,#6366F1,#22D3EE)' : 'rgba(255,255,255,0.04)', border: msg.role === 'assistant' ? '1px solid rgba(99,102,241,0.15)' : 'none', fontSize: 13, lineHeight: 1.6, color: '#F1F5F9', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 36 }}>
                    {msg.citations.slice(0, 3).map(c => (
                      <div key={c.source} style={{ fontSize: 10, color: '#22D3EE', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(34,211,238,0.2)', background: 'rgba(34,211,238,0.06)' }}>
                        {'Source ' + c.source + ' \u00B7 ' + c.similarity + '% match'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={13} color="#6366F1" />
                </div>
                <div style={{ padding: '10px 16px', borderRadius: '14px 14px 14px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366F1', opacity: 0.6 }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 13 }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 24px 20px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
            <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '10px 14px', alignItems: 'flex-end' }}>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about your documents..."
                rows={1}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none', color: '#F1F5F9', fontSize: 13, lineHeight: 1.5, maxHeight: 120, fontFamily: 'Inter, sans-serif' }}
              />
              <button
                onClick={sendMessage}
                disabled={!question.trim() || loading || docs.length === 0}
                style={{ width: 32, height: 32, borderRadius: 8, background: question.trim() && !loading && docs.length > 0 ? 'linear-gradient(135deg,#6366F1,#22D3EE)' : 'rgba(255,255,255,0.06)', border: 'none', cursor: question.trim() && !loading && docs.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Send size={14} color={question.trim() && !loading && docs.length > 0 ? '#fff' : '#475569'} />
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 8 }}>
              Powered by Ollama · llama3.2:3b · Runs privately on your machine
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
`);

// ── 4. Analytics Page ─────────────────────────────────────────
write('app/(dashboard)/analytics/page.tsx', String.raw`
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Topbar from '@/components/layout/topbar';
import { FileText, MessageSquare, Database, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  const orgId = profile?.org_id ?? '';

  const [
    { count: totalDocs },
    { count: readyDocs },
    { count: totalChunks },
    { count: totalQueries },
  ] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'ready'),
    supabase.from('document_chunks').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('analytics_logs').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('event_type', 'query'),
  ]);

  const { data: recentQueries } = await supabase
    .from('analytics_logs')
    .select('metadata, created_at')
    .eq('org_id', orgId)
    .eq('event_type', 'query')
    .order('created_at', { ascending: false })
    .limit(10);

  const stats = [
    { label: 'Total Documents', value: String(totalDocs ?? 0),    sub: String(readyDocs ?? 0) + ' ready',          icon: FileText,      color: '#6366F1' },
    { label: 'Vector Chunks',   value: String(totalChunks ?? 0),   sub: 'Indexed & searchable',                     icon: Database,      color: '#22D3EE' },
    { label: 'Total Queries',   value: String(totalQueries ?? 0),  sub: 'AI questions answered',                    icon: MessageSquare, color: '#A855F7' },
    { label: 'Avg Chunks/Doc',  value: totalDocs ? String(Math.round((totalChunks ?? 0) / (totalDocs || 1))) : '0', sub: 'Per document', icon: TrendingUp, color: '#F59E0B' },
  ];

  return (
    <>
      <Topbar title="Analytics" subtitle="Usage and performance overview" />
      <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {stats.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: color + '14', border: '1px solid ' + color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>{label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#F1F5F9', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {recentQueries && recentQueries.length > 0 && (
          <div style={{ borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.12)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Recent Queries</span>
            </div>
            {recentQueries.map((q, i) => {
              const meta = q.metadata as { question?: string; chunk_count?: number };
              return (
                <div key={i} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < recentQueries.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageSquare size={12} color="#6366F1" />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {meta.question ?? 'Query'}
                  </span>
                  <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>
                    {meta.chunk_count ?? 0} sources
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
`);

// ── 5. Settings Page ──────────────────────────────────────────
write('app/(dashboard)/settings/page.tsx', String.raw`
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Topbar from '@/components/layout/topbar';
import { User, Building2, Save } from 'lucide-react';
import type { Profile, Organization } from '@/types/database';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [org, setOrg]         = useState<Organization | null>(null);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) { setProfile(p); setName(p.full_name ?? ''); }
      if (p?.org_id) {
        const { data: o } = await supabase.from('organizations').select('*').eq('id', p.org_id).single();
        setOrg(o);
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: name }).eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 8, color: '#F1F5F9', fontSize: 14,
    outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'Inter, sans-serif',
  };

  const cardStyle = {
    borderRadius: 14, background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(99,102,241,0.12)', padding: 24,
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your profile and workspace" />
      <main style={{ padding: 24, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Profile */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <User size={16} color="#6366F1" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>Profile</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ color: '#94A3B8', fontSize: 12, display: 'block', marginBottom: 6 }}>Email</label>
              <input value={profile?.email ?? ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ color: '#94A3B8', fontSize: 12, display: 'block', marginBottom: 6 }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#94A3B8', fontSize: 12, display: 'block', marginBottom: 6 }}>Role</label>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22D3EE' }} />
                <span style={{ fontSize: 12, color: '#22D3EE', fontWeight: 600, textTransform: 'uppercase' }}>{profile?.role ?? 'viewer'}</span>
              </div>
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9, background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#6366F1,#22D3EE)', border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none', color: saved ? '#22C55E' : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', width: 'fit-content' }}
            >
              <Save size={14} />
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Organisation */}
        {org && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Building2 size={16} color="#22D3EE" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9' }}>Organisation</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: '#94A3B8', fontSize: 12, display: 'block', marginBottom: 6 }}>Name</label>
                <input value={org.name} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ color: '#94A3B8', fontSize: 12, display: 'block', marginBottom: 6 }}>Slug</label>
                <input value={org.slug} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
`);

console.log('\n  \u2705 Phase 4 complete!\n');
console.log('  Stop server \u2192 npm run dev \u2192 test:\n');
console.log('  /documents  \u2014 upload files, watch status update');
console.log('  /chat       \u2014 select docs, ask questions');
console.log('  /analytics  \u2014 usage stats');
console.log('  /settings   \u2014 profile\n');
console.log('  Make sure Ollama is running: ollama serve\n');
