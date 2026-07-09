'use client';
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
      if (!res.ok) {
        setMsgs(m => [...m, { role: 'assistant', content: '⚠️ ' + (data.error || ('Request failed with status ' + res.status)) }]);
      } else {
        setMsgs(m => [...m, { role: 'assistant', content: data.answer || 'No response.', citations: data.citations }]);
      }
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
    w.document.write('<html><head><title>PulsarIQ Export</title><style>body{font-family:sans-serif;max-width:700px;margin:32px auto}.u{background:#f0f4ff;padding:12px;border-radius:10px;margin:10px 0}.a{background:#f8f8f8;padding:12px;border-radius:10px;margin:10px 0;border-left:3px solid #22D3EE}</style></head><body><h2>PulsarIQ Chat — ' + new Date().toLocaleString() + '</h2>' + rows + '</body></html>');
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
