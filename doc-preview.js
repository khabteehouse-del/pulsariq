// PulsarIQ — doc-preview.js
// Adds a Preview button per document that shows extracted text content,
// so the end user knows what they're actually addressing, not just a filename.
// Reuses the already-working GET /api/documents/[id] endpoint (returns chunks).
// Run: node doc-preview.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const content = `'use client';
import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/topbar';
import { Upload, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, AlertTriangle, XCircle, Eye, FileText } from 'lucide-react';

export default function DocumentsPage() {
  const [docs, setDocs]               = useState<any[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [drag, setDrag]               = useState(false);
  const [error, setError]             = useState('');
  const [uploadError, setUploadError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [confirmAll, setConfirmAll]   = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [previewDoc, setPreviewDoc]   = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    try {
      const r = await fetch('/api/documents');
      const text = await r.text();
      if (!text || text.trim() === '' || text.trim() === 'null') {
        setDocs([]); setError(''); return;
      }
      let data: any;
      try { data = JSON.parse(text); } catch { setError('Server error'); return; }
      const arr = Array.isArray(data) ? data
                : Array.isArray(data?.data) ? data.data
                : [];
      setDocs(arr);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Network error');
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    const t = setInterval(() => {
      setDocs(prev => {
        const hasActive = prev.some(d => d.status === 'processing' || d.status === 'embedding');
        if (hasActive) fetchDocs();
        return prev;
      });
    }, 3000);
    return () => clearInterval(t);
  }, [fetchDocs]);

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setUploadError('');
    for (const f of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/documents', { method: 'POST', body: fd });
        const text = await res.text();
        let data: any = null;
        try { data = text ? JSON.parse(text) : null; } catch {
          setUploadError('Upload failed: server returned an invalid response (' + res.status + ')');
          continue;
        }
        if (!res.ok) {
          setUploadError(f.name + ': ' + (data?.error || ('status ' + res.status)));
          continue;
        }
      } catch (e: any) {
        setUploadError(f.name + ': ' + (e?.message || 'Network error during upload'));
      }
    }
    setUploading(false);
    await fetchDocs();
  };

  const requestDelete = (doc: any) => setConfirmTarget(doc);

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/documents/' + confirmTarget.id, { method: 'DELETE' });
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        setError('Delete failed: ' + (data?.error || ('status ' + res.status)));
        setDeleting(false); setConfirmTarget(null); return;
      }
      setDocs(prev => prev.filter(d => d.id !== confirmTarget.id));
      setError('');
    } catch (e: any) {
      setError('Delete failed: ' + (e?.message || 'Network error'));
    }
    setDeleting(false);
    setConfirmTarget(null);
    fetchDocs();
  };

  const confirmClearAll = async () => {
    setDeleting(true);
    const targets = [...docs];
    for (const doc of targets) {
      try { await fetch('/api/documents/' + doc.id, { method: 'DELETE' }); } catch {}
    }
    setDeleting(false);
    setConfirmAll(false);
    await fetchDocs();
  };

  // Open preview — fetch the doc detail + extracted chunks.
  const openPreview = async (doc: any) => {
    setPreviewDoc(doc);
    setPreviewData(null);
    setPreviewLoading(true);
    try {
      const res = await fetch('/api/documents/' + doc.id);
      const data = await res.json();
      setPreviewData(data);
    } catch {
      setPreviewData({ error: true });
    }
    setPreviewLoading(false);
  };

  const statusColor = (s: string) => s === 'ready' ? '#22C55E' : s === 'failed' ? '#EF4444' : '#22D3EE';
  const StatusIcon  = ({ s }: { s: string }) => s === 'ready' ? <CheckCircle size={10} /> : s === 'failed' ? <AlertCircle size={10} /> : <Clock size={10} />;

  const card: React.CSSProperties = {
    background: 'rgba(5,18,35,0.9)',
    border: '1px solid rgba(34,211,238,0.12)',
    borderRadius: '14px',
    backdropFilter: 'blur(20px)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Topbar title="Documents" />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#EF4444', fontSize: '13px' }}>
            {error} &mdash; <button onClick={fetchDocs} style={{ color: '#22D3EE', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
          </div>
        )}
        {uploadError && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#EF4444', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Upload failed: {uploadError}</span>
            <button onClick={() => setUploadError('')} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 4px' }}>&times;</button>
          </div>
        )}

        <div
          className={'upload-zone' + (drag ? ' dragover' : '')}
          style={{ padding: '36px' }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          onClick={() => {
            const inp = document.createElement('input');
            inp.type = 'file'; inp.multiple = true;
            inp.accept = '.pdf,.docx,.xlsx,.pptx,.csv,.txt,.html';
            inp.onchange = ev => upload((ev.target as HTMLInputElement).files);
            inp.click();
          }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '13px', background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {uploading ? <RefreshCw size={22} color="#22D3EE" style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={22} color="#22D3EE" />}
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#E2F8FF', margin: '0 0 4px' }}>{uploading ? 'Uploading...' : drag ? 'Drop to upload' : 'Drag & drop files'}</p>
          <p style={{ fontSize: '12px', color: 'rgba(226,248,255,0.3)', margin: 0 }}>PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML &bull; Max 50MB</p>
        </div>

        <div style={card}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(34,211,238,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E2F8FF', margin: 0 }}>Knowledge Base</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(34,211,238,0.5)' }}>{docs.length} documents</span>
              <button onClick={fetchDocs} className="btn-icon" style={{ width: '24px', height: '24px', borderRadius: '6px' }}>
                <RefreshCw size={11} color="rgba(34,211,238,0.5)" />
              </button>
              {docs.length > 0 && (
                <button onClick={() => setConfirmAll(true)} className="btn-danger" style={{ padding: '4px 10px', borderRadius: '7px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={11} /> Clear All
                </button>
              )}
            </div>
          </div>
          <div style={{ padding: '10px' }}>
            {docs.length === 0 && !error && (
              <div style={{ textAlign: 'center', padding: '36px', color: 'rgba(226,248,255,0.3)', fontSize: '13px' }}>No documents yet. Upload above to get started.</div>
            )}
            {docs.map(doc => (
              <div key={doc.id} className="list-row" style={{ marginBottom: '6px', cursor: 'pointer' }} onClick={() => openPreview(doc)}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#22D3EE', flexShrink: 0 }}>
                  {(doc.file_type || 'DOC').toUpperCase().slice(0, 3)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', color: doc.filename ? '#E2F8FF' : '#F59E0B', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: doc.filename ? 'normal' : 'italic' }}>
                    {doc.filename || '(untitled \u2014 corrupted upload, safe to delete)'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', marginTop: '1px' }}>
                    {doc.chunk_count ? doc.chunk_count + ' chunks  \\u00b7  ' : ''}{new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="btn-icon"
                  style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0 }}
                  onClick={e => { e.stopPropagation(); openPreview(doc); }}
                  title="Preview content"
                >
                  <Eye size={12} color="rgba(34,211,238,0.6)" />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 9px', borderRadius: '9px', fontSize: '9px', fontWeight: 600, background: statusColor(doc.status) + '14', color: statusColor(doc.status), border: '1px solid ' + statusColor(doc.status) + '28', flexShrink: 0 }}>
                  <StatusIcon s={doc.status} />{doc.status}
                </div>
                <button className="btn-danger" style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0 }} onClick={e => { e.stopPropagation(); requestDelete(doc); }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,8,16,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setPreviewDoc(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '560px', maxWidth: '92vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', background: 'rgba(5,16,30,0.98)', border: '1px solid rgba(34,211,238,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={17} color="#22D3EE" />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#E2F8FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewDoc.filename || '(untitled)'}</div>
                <div style={{ fontSize: '11px', color: 'rgba(226,248,255,0.4)', marginTop: '2px' }}>
                  {(previewDoc.file_type || '').toUpperCase()} &middot; {previewDoc.file_size ? (previewDoc.file_size / 1024).toFixed(0) + ' KB' : ''} &middot; {previewDoc.status}
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', color: 'rgba(226,248,255,0.4)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {previewLoading && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(226,248,255,0.4)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <RefreshCw size={20} color="#22D3EE" style={{ animation: 'spin 1s linear infinite' }} />
                  Loading preview...
                </div>
              )}
              {!previewLoading && previewData?.error && (
                <div style={{ textAlign: 'center', padding: '30px', color: '#EF4444', fontSize: '13px' }}>Couldn't load preview content.</div>
              )}
              {!previewLoading && previewData && !previewData.error && (
                <>
                  {(!previewData.chunks || previewData.chunks.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(226,248,255,0.4)', fontSize: '13px' }}>
                      {previewDoc.status === 'ready'
                        ? 'No extracted content available for this document.'
                        : 'This document is still processing \u2014 preview will be available once ready.'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(34,211,238,0.5)', fontWeight: 700, letterSpacing: '0.5px' }}>
                        EXTRACTED CONTENT PREVIEW (first {previewData.chunks.length} sections)
                      </div>
                      {previewData.chunks.map((chunk: string, i: number) => (
                        <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.08)' }}>
                          <div style={{ fontSize: '9px', color: 'rgba(34,211,238,0.4)', fontWeight: 600, marginBottom: '6px' }}>SECTION {i + 1}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(226,248,255,0.75)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{String(chunk).slice(0, 500)}{String(chunk).length > 500 ? '...' : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,8,16,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => !deleting && setConfirmTarget(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '380px', maxWidth: '90vw', padding: '24px', borderRadius: '16px', background: 'rgba(5,16,30,0.97)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} color="#EF4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#E2F8FF', margin: '0 0 2px' }}>Delete document?</h3>
                <p style={{ fontSize: '12px', color: 'rgba(226,248,255,0.4)', margin: 0 }}>This action cannot be undone.</p>
              </div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: '9px', background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.1)', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#E2F8FF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{confirmTarget.filename || '(untitled document)'}</div>
              <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', marginTop: '2px' }}>Will be permanently removed from storage and the knowledge base.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmTarget(null)} disabled={deleting} className="btn-ghost" style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', cursor: deleting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {deleting ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAll && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,8,16,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => !deleting && setConfirmAll(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '400px', maxWidth: '90vw', padding: '24px', borderRadius: '16px', background: 'rgba(5,16,30,0.97)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} color="#EF4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#E2F8FF', margin: '0 0 2px' }}>Clear all {docs.length} documents?</h3>
                <p style={{ fontSize: '12px', color: 'rgba(226,248,255,0.4)', margin: 0 }}>Every document will be permanently deleted.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmAll(false)} disabled={deleting} className="btn-ghost" style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px' }}>Cancel</button>
              <button onClick={confirmClearAll} disabled={deleting} style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', cursor: deleting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {deleting ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={13} />}
                {deleting ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

const outPath = path.join(root, 'app', '(dashboard)', 'documents', 'page.tsx');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log('\n  PulsarIQ \u2014 Document Preview\n');
console.log('  \u2713 app/(dashboard)/documents/page.tsx \u2014 ' + content.length + ' bytes');
console.log('\n  Click any document row (or the eye icon) to preview its');
console.log('  actual extracted text content \u2014 not just the filename.\n');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
