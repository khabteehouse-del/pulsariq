// PulsarIQ — harden-data.js
// 1. Chat page: skip documents with no filename entirely (never show blank radio buttons)
// 2. Documents page: adds a "Clear All" button with confirmation, so bad/ghost
//    data can always be wiped directly from the UI without needing SQL again
// Run: node harden-data.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Harden Data Display\n');

write('app/(dashboard)/chat/page.tsx', `'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Topbar from '@/components/layout/topbar';
import { Send, FileText, Zap, Printer, CheckCircle } from 'lucide-react';

const card: React.CSSProperties = {
  background: 'rgba(5,18,35,0.9)',
  border: '1px solid rgba(34,211,238,0.12)',
  borderRadius: '14px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

function ReactorCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const fr  = useRef(0);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ctx = c.getContext('2d'); if (!ctx) return;

    const draw = () => {
      fr.current++;
      const f = fr.current;
      const W = c.width, H = c.height;
      const cx = W / 2, cy = H / 2;
      const pulse = (Math.sin(f * (active ? 0.08 : 0.03)) + 1) / 2;
      const speed = active ? 1.8 : 1;

      ctx.clearRect(0, 0, W, H);

      const ambient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.9);
      ambient.addColorStop(0, 'rgba(34,211,238,' + (0.04 + pulse * 0.04) + ')');
      ambient.addColorStop(1, 'transparent');
      ctx.fillStyle = ambient; ctx.fillRect(0, 0, W, H);

      [cx*0.65, cx*0.45, cx*0.28].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const op = 0.12 + pulse * 0.08 * (i === 0 ? 1 : 0.5);
        ctx.strokeStyle = i === 0 ? 'rgba(245,158,11,' + op + ')' : 'rgba(34,211,238,' + op + ')';
        ctx.lineWidth = i === 0 ? 1.5 : 0.8; ctx.stroke();
      });

      const ra = f * 0.018 * speed;
      for (let j = 0; j < 6; j++) {
        const ss = ra + j * (Math.PI / 3);
        ctx.beginPath(); ctx.arc(cx, cy, cx * 0.65, ss, ss + 0.3);
        ctx.strokeStyle = 'rgba(245,158,11,' + (0.5 + pulse * 0.4) + ')';
        ctx.lineWidth = 2; ctx.stroke();
      }

      const rb = f * -0.025 * speed;
      for (let j = 0; j < 8; j++) {
        const ss = rb + j * (Math.PI / 4);
        ctx.beginPath(); ctx.arc(cx, cy, cx * 0.45, ss, ss + 0.18);
        ctx.strokeStyle = 'rgba(34,211,238,' + (0.4 + pulse * 0.3) + ')';
        ctx.lineWidth = 1.2; ctx.stroke();
      }

      if (active) {
        for (let j = 0; j < 4; j++) {
          const pa = f * 0.04 + j * (Math.PI / 2);
          const px = cx + Math.cos(pa) * cx * 0.65;
          const py = cy + Math.sin(pa) * cx * 0.65;
          const pg = ctx.createRadialGradient(px, py, 0, px, py, 4);
          pg.addColorStop(0, 'rgba(34,211,238,0.9)'); pg.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();
        }
      }

      if (active) {
        for (let j = 0; j < 3; j++) {
          const la = f * 0.02 + j * (Math.PI * 2 / 3);
          const lx1 = cx + Math.cos(la) * cx * 0.28;
          const ly1 = cy + Math.sin(la) * cx * 0.28;
          const lx2 = cx + Math.cos(la) * cx * 0.62;
          const ly2 = cy + Math.sin(la) * cx * 0.62;
          const lg = ctx.createLinearGradient(lx1, ly1, lx2, ly2);
          lg.addColorStop(0, 'rgba(34,211,238,0.6)'); lg.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.moveTo(lx1, ly1); ctx.lineTo(lx2, ly2);
          ctx.strokeStyle = lg; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      [cx*0.18, cx*0.11, cx*0.06].forEach((r, i) => {
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + pulse * 3);
        const op = [0.5, 0.7, 1][i] * (active ? 1 : 0.7);
        cg.addColorStop(0, 'rgba(34,211,238,' + op + ')'); cg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, r + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = cg; ctx.fill();
      });

      const cd = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.06 + pulse * 3);
      cd.addColorStop(0, '#fff'); cd.addColorStop(0.4, '#A5F3FC'); cd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, cx * 0.06 + pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = cd; ctx.fill();

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

export default function ChatPage() {
  const [docs, setDocs]         = useState<any[]>([]);
  const [sel, setSel]           = useState<string[]>([]);
  const [msgs, setMsgs]         = useState<{role:string;content:string;citations?:any[]}[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [steps, setSteps]       = useState<{text:string;done:boolean}[]>([]);
  const [showAgent, setShowAgent] = useState(false);
  const [agentDone, setAgentDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timers    = useRef<NodeJS.Timeout[]>([]);
  const supabase  = createClient();

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(raw => {
        const arr = !raw ? [] : Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        // Skip ghost/bad rows with no filename entirely — never show blank radio buttons.
        setDocs(arr.filter((x: any) => x.status === 'ready' && x.filename));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, steps]);

  const runAgent = useCallback((docNames: string[]) => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
    const agentSteps = [
      { text: 'Initializing query engine...', pct: 10 },
      { text: 'Vectorizing input (384D)...', pct: 25 },
      { text: docNames.length > 0 ? 'Searching: ' + docNames.slice(0, 2).join(', ') + (docNames.length > 2 ? ' +' + (docNames.length - 2) + ' more...' : '...') : 'Searching knowledge base...', pct: 45 },
      { text: 'Ranking semantic similarity...', pct: 62 },
      { text: 'Extracting relevant passages...', pct: 78 },
      { text: 'Grounding response with citations...', pct: 92 },
    ];
    setSteps([]); setShowAgent(true); setAgentDone(false); setProgress(0);
    agentSteps.forEach(({ text, pct }, i) => {
      const t = setTimeout(() => {
        setSteps(prev => [...prev, { text, done: false }]);
        if (i > 0) setSteps(prev => prev.map((s, idx) => idx < i ? { ...s, done: true } : s));
        setProgress(pct);
      }, i * 480);
      timers.current.push(t);
    });
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMsgs(m => [...m, userMsg]);
    setInput(''); setLoading(true);
    const docNames = sel.map(id => docs.find(d => d.id === id)?.filename || id);
    runAgent(docNames);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, documentIds: sel, history: msgs }),
      });
      const data = await res.json();
      timers.current.forEach(t => clearTimeout(t));
      setProgress(100); setAgentDone(true);
      setSteps(prev => prev.map(s => ({ ...s, done: true })));
      setTimeout(() => setShowAgent(false), 1400);
      setMsgs(m => [...m, { role: 'assistant', content: data.answer || 'No response.', citations: data.citations }]);
    } catch {
      setShowAgent(false);
      setMsgs(m => [...m, { role: 'assistant', content: 'Error getting response.' }]);
    }
    setLoading(false);
  };

  const printChat = () => {
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) return;
    const rows = msgs.map(m => '<div class="' + (m.role === 'user' ? 'u' : 'a') + '"><b>' + (m.role === 'user' ? 'YOU' : 'AI') + '</b><br>' + m.content + '</div>').join('');
    w.document.write('<html><head><title>PulsarIQ Export</title><style>body{font-family:sans-serif;max-width:700px;margin:32px auto}.u{background:#f0f4ff;padding:12px;border-radius:10px;margin:10px 0}.a{background:#f8f8f8;padding:12px;border-radius:10px;margin:10px 0;border-left:3px solid #22D3EE}</style></head><body><h2>PulsarIQ Chat \u2014 ' + new Date().toLocaleString() + '</h2>' + rows + '</body></html>');
    w.document.close(); w.print();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <Topbar title="AI Chat" />
      <div className="chat-layout" style={{ flex: 1, overflow: 'hidden', padding: '16px', gap: '14px' }}>

        <div className="doc-sidebar" style={{ ...card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(34,211,238,0.07)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#E2F8FF', margin: '0 0 2px' }}>Sources</h3>
            <p style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', margin: 0 }}>{sel.length} selected</p>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            {docs.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: 'rgba(226,248,255,0.3)' }}>
                No ready docs.<br />
                <a href="/documents" style={{ color: '#22D3EE', textDecoration: 'none' }}>Upload first &#8594;</a>
              </div>
            ) : docs.map(doc => {
              const active = sel.includes(doc.id);
              return (
                <div key={doc.id} onClick={() => setSel(s => active ? s.filter(x => x !== doc.id) : [...s, doc.id])} className={'doc-item' + (active ? ' selected' : '')}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid ' + (active ? '#22D3EE' : 'rgba(226,248,255,0.2)'), background: active ? 'rgba(34,211,238,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {active && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22D3EE' }} />}
                  </div>
                  <span style={{ fontSize: '11px', color: active ? '#E2F8FF' : 'rgba(226,248,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{doc.filename}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(34,211,238,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'rgba(226,248,255,0.35)' }}>{msgs.length} messages &middot; {sel.length} sources</span>
            {msgs.length > 0 && (
              <button className="btn-ghost no-mobile" onClick={printChat} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', fontSize: '11px' }}>
                <Printer size={12} /> Print
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            {msgs.length === 0 && !showAgent && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '300px' }}>
                <div style={{ width: '220px', height: '220px', position: 'relative', marginBottom: '24px' }}>
                  <ReactorCanvas active={false} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#E2F8FF', margin: '0 0 6px', textAlign: 'center' }}>Ask your documents anything</p>
                <p style={{ fontSize: '12px', color: 'rgba(226,248,255,0.35)', margin: 0, textAlign: 'center' }}>Select sources on the left, then ask a question.</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '82%' }}>
                  {m.role === 'assistant' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg,#22D3EE,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={9} color="#fff" /></div>
                      <span style={{ fontSize: '10px', color: 'rgba(34,211,238,0.6)', fontWeight: 600 }}>PulsarIQ</span>
                    </div>
                  )}
                  <div style={{ padding: '11px 14px', borderRadius: m.role === 'user' ? '13px 13px 3px 13px' : '3px 13px 13px 13px', background: m.role === 'user' ? 'rgba(34,211,238,0.09)' : 'rgba(34,211,238,0.04)', border: '1px solid ' + (m.role === 'user' ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.08)'), fontSize: '13px', color: '#E2F8FF', lineHeight: 1.6 }}>
                    {m.content}
                  </div>
                  {m.citations && m.citations.length > 0 && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '7px' }}>
                      {m.citations.slice(0, 4).map((c: any, ci: number) => (
                        <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '9px', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.14)', fontSize: '9px', color: '#22D3EE' }}>
                          <FileText size={8} />{String(c.source || '').split('/').pop()?.slice(0, 22) || 'Source'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {showAgent && (
              <div style={{ borderRadius: '12px', background: 'rgba(4,14,28,0.96)', border: '1px solid rgba(34,211,238,0.2)', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '90px', height: '90px', flexShrink: 0 }}>
                  <ReactorCanvas active={true} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: agentDone ? '#22C55E' : '#22D3EE', letterSpacing: '0.5px' }}>{agentDone ? 'COMPLETE' : 'PROCESSING...'}</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(34,211,238,0.1)', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg,#6366F1,#22D3EE)', borderRadius: '2px', transition: 'width 0.45s ease', boxShadow: '0 0 6px rgba(34,211,238,0.5)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {steps.map((step, si2) => (
                      <div key={si2} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.done ? 'rgba(34,211,238,0.12)' : 'rgba(245,158,11,0.1)', border: '1px solid ' + (step.done ? 'rgba(34,211,238,0.3)' : 'rgba(245,158,11,0.3)') }}>
                          {step.done ? <CheckCircle size={8} color="#22D3EE" /> : <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F59E0B', animation: 'glowPulse 0.7s ease-in-out infinite' }} />}
                        </div>
                        <span style={{ fontSize: '11px', color: step.done ? 'rgba(226,248,255,0.38)' : '#E2F8FF', transition: 'color 0.3s' }}>{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(34,211,238,0.07)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={sel.length === 0 ? 'Select documents first...' : 'Ask anything about your documents...'}
                disabled={sel.length === 0 || loading}
                className="inp-field"
                style={{ flex: 1, boxSizing: 'border-box' as const }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading || sel.length === 0}
                className={'send-btn ' + (input.trim() && !loading && sel.length > 0 ? 'active' : 'inactive')}
              >
                <Send size={15} color={input.trim() && !loading && sel.length > 0 ? '#fff' : 'rgba(34,211,238,0.4)'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

write('app/(dashboard)/documents/page.tsx', `'use client';
import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/topbar';
import { Upload, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';

export default function DocumentsPage() {
  const [docs, setDocs]               = useState<any[]>([]);
  const [uploading, setUploading]     = useState(false);
  const [drag, setDrag]               = useState(false);
  const [error, setError]             = useState('');
  const [uploadError, setUploadError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [confirmAll, setConfirmAll]   = useState(false);
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
      try {
        await fetch('/api/documents/' + doc.id, { method: 'DELETE' });
      } catch {}
    }
    setDeleting(false);
    setConfirmAll(false);
    await fetchDocs();
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
              <div key={doc.id} className="list-row" style={{ marginBottom: '6px', cursor: 'default' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 9px', borderRadius: '9px', fontSize: '9px', fontWeight: 600, background: statusColor(doc.status) + '14', color: statusColor(doc.status), border: '1px solid ' + statusColor(doc.status) + '28', flexShrink: 0 }}>
                  <StatusIcon s={doc.status} />{doc.status}
                </div>
                <button className="btn-danger" style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0 }} onClick={() => requestDelete(doc)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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
`);

console.log('\n  \u2705 Hardened!\n');
console.log('  \u2713 Chat now SKIPS any document with no filename entirely');
console.log('    \u2014 ghost/bad rows can never appear as blank radio buttons again.');
console.log('  \u2713 Documents page flags bad rows clearly in gold/italic text');
console.log('    instead of generic "untitled document".');
console.log('  \u2713 New "Clear All" button \u2014 wipe everything in one click,');
console.log('    no more deleting one-by-one or needing SQL Editor.\n');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
