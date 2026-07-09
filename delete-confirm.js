// PulsarIQ — delete-confirm.js
// 1. Adds a proper styled confirmation dialog before deleting documents
// 2. Fixes delete to verify the server actually succeeded (was optimistic-only before,
//    which is likely why "deleted" duplicates were still showing up in Chat)
// Run: node delete-confirm.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const content = `'use client';
import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/topbar';
import { Upload, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

export default function DocumentsPage() {
  const [docs, setDocs]               = useState<any[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [drag, setDrag]               = useState(false);
  const [error, setError]             = useState('');
  const [uploadError, setUploadError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [deleting, setDeleting]       = useState(false);

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
          const msg = data?.error || ('Upload failed with status ' + res.status);
          setUploadError(f.name + ': ' + msg);
          continue;
        }
      } catch (e: any) {
        setUploadError(f.name + ': ' + (e?.message || 'Network error during upload'));
      }
    }

    setUploading(false);
    await fetchDocs();
  };

  // Step 1: user clicks trash icon -> just opens the confirm dialog, no deletion yet
  const requestDelete = (doc: any) => {
    setConfirmTarget(doc);
  };

  // Step 2: user confirms in the dialog -> actually call DELETE and VERIFY it worked
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
        setDeleting(false);
        setConfirmTarget(null);
        return;
      }

      // Only remove from the list AFTER the server confirms success.
      setDocs(prev => prev.filter(d => d.id !== confirmTarget.id));
      setError('');
    } catch (e: any) {
      setError('Delete failed: ' + (e?.message || 'Network error'));
    }
    setDeleting(false);
    setConfirmTarget(null);
    // Re-sync with the server to be absolutely sure the list is accurate.
    fetchDocs();
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
            {uploading
              ? <RefreshCw size={22} color="#22D3EE" style={{ animation: 'spin 1s linear infinite' }} />
              : <Upload size={22} color="#22D3EE" />}
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#E2F8FF', margin: '0 0 4px' }}>
            {uploading ? 'Uploading...' : drag ? 'Drop to upload' : 'Drag & drop files'}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(226,248,255,0.3)', margin: 0 }}>
            PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML &bull; Max 50MB
          </p>
        </div>

        <div style={card}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(34,211,238,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E2F8FF', margin: 0 }}>Knowledge Base</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(34,211,238,0.5)' }}>{docs.length} documents</span>
              <button onClick={fetchDocs} className="btn-icon" style={{ width: '24px', height: '24px', borderRadius: '6px' }}>
                <RefreshCw size={11} color="rgba(34,211,238,0.5)" />
              </button>
            </div>
          </div>
          <div style={{ padding: '10px' }}>
            {docs.length === 0 && !error && (
              <div style={{ textAlign: 'center', padding: '36px', color: 'rgba(226,248,255,0.3)', fontSize: '13px' }}>
                No documents yet. Upload above to get started.
              </div>
            )}
            {docs.map(doc => (
              <div key={doc.id} className="list-row" style={{ marginBottom: '6px', cursor: 'default' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#22D3EE', flexShrink: 0 }}>
                  {(doc.file_type || 'DOC').toUpperCase().slice(0, 3)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', color: '#E2F8FF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename || '(untitled document)'}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', marginTop: '1px' }}>
                    {doc.chunk_count ? doc.chunk_count + ' chunks  \\u00b7  ' : ''}{new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 9px', borderRadius: '9px', fontSize: '9px', fontWeight: 600, background: statusColor(doc.status) + '14', color: statusColor(doc.status), border: '1px solid ' + statusColor(doc.status) + '28', flexShrink: 0 }}>
                  <StatusIcon s={doc.status} />
                  {doc.status}
                </div>
                <button
                  className="btn-danger"
                  style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0 }}
                  onClick={() => requestDelete(doc)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {confirmTarget && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,8,16,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => !deleting && setConfirmTarget(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '380px', maxWidth: '90vw', padding: '24px', borderRadius: '16px', background: 'rgba(5,16,30,0.97)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >
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
              <div style={{ fontSize: '12px', color: '#E2F8FF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {confirmTarget.filename || '(untitled document)'}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', marginTop: '2px' }}>
                Will be permanently removed from storage and the knowledge base.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={deleting}
                className="btn-ghost"
                style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', cursor: deleting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.15s ease' }}
              >
                {deleting ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                {deleting ? 'Deleting...' : 'Delete'}
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
console.log('\n  PulsarIQ \u2014 Delete Confirmation + Verified Delete\n');
console.log('  \u2713 app/(dashboard)/documents/page.tsx \u2014 ' + content.length + ' bytes');
console.log('\n  1. Trash icon now opens a styled confirm dialog (no instant delete)');
console.log('  2. Delete only updates the UI AFTER the server confirms success');
console.log('  3. List re-syncs with server after every delete, so stale/ghost');
console.log('     entries (like the duplicates) get caught and corrected.\n');
console.log('  Run: rmdir /s /q .next && npm run dev');
console.log('  Then delete your 4 duplicate ghost entries again \u2014 this time');
console.log('  it should actually work, and Chat should match Documents after.\n');
