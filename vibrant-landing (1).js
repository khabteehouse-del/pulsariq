// PulsarIQ — vibrant-landing.js
// COMPLETE overwrite of app/page.tsx. No patching, no marker search.
// Same as final-landing.js but with the ORIGINAL vibrant Lorenz attractor look.
// Run: node vibrant-landing.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const content = `'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight } from 'lucide-react';

// ---- CRT Boot ----
function CRTBoot({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const grainRef = useRef<HTMLCanvasElement>(null);
  const grainRaf = useRef<number>(0);
  const cb = useCallback(onDone, []);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 620);
    const t3 = setTimeout(() => setStep(3), 780);
    const t4 = setTimeout(() => { setStep(4); cb(); }, 1060);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [cb]);

  useEffect(() => {
    if (step !== 2 && step !== 3) return;
    const c = grainRef.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let live = true;
    const tick = () => {
      if (!live) return;
      const id = ctx.createImageData(c.width, c.height);
      for (let i = 0; i < id.data.length; i += 4) {
        const v = Math.random() > 0.45 ? Math.floor(Math.random() * 240) : 0;
        id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v;
        id.data[i + 3] = Math.floor(Math.random() * 155);
      }
      ctx.putImageData(id, 0, 0);
      grainRaf.current = requestAnimationFrame(tick);
    };
    tick();
    return () => { live = false; cancelAnimationFrame(grainRaf.current); };
  }, [step]);

  if (step === 4) return null;
  const isDot = step === 0, isScan = step === 1, isBlast = step === 2, isFade = step === 3;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: isFade ? 'none' : 'all',
      background: isBlast ? 'rgba(255,255,255,0.88)' : isFade ? 'transparent' : '#030B14',
      transition: isBlast ? 'background 55ms' : isFade ? 'background 290ms' : 'none',
    }}>
      {!isFade && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          borderRadius: isDot ? '50%' : '0',
          width: isDot ? '10px' : '100vw',
          height: isDot ? '10px' : isScan ? '2px' : '100vh',
          background: isBlast
            ? 'linear-gradient(180deg,rgba(34,211,238,0.25),white,rgba(34,211,238,0.25))'
            : isDot
            ? 'radial-gradient(circle,#fff,#22D3EE,transparent)'
            : 'linear-gradient(90deg,transparent,rgba(34,211,238,0.55),#22D3EE,rgba(34,211,238,0.55),transparent)',
          boxShadow: isDot ? '0 0 22px #22D3EE,0 0 55px rgba(34,211,238,0.6)' : isScan ? '0 0 14px rgba(34,211,238,0.8)' : 'none',
          animation: isDot ? 'crtDot 0.38s ease-in-out infinite' : 'none',
          transition: isScan
            ? 'width 215ms cubic-bezier(0.4,0,0.2,1),height 215ms,border-radius 215ms'
            : isBlast ? 'height 155ms cubic-bezier(0.4,0,1,1)' : 'none',
        }} />
      )}
      {isBlast && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,0,60,0.14)', mixBlendMode: 'multiply' as const, transform: 'translateX(-5px)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,220,0.14)', mixBlendMode: 'multiply' as const, transform: 'translateX(5px)' }} />
        </div>
      )}
      {(isBlast || isFade) && (
        <canvas ref={grainRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isFade ? 0 : 0.42, transition: isFade ? 'opacity 290ms' : 'none', mixBlendMode: 'screen' as const, pointerEvents: 'none' }} />
      )}
    </div>
  );
}

const LS = 10, LR = 28, LB = 8 / 3, LDT = 0.005, LTR = 1300;
const LSEED = [{ x: 0.1, y: 0, z: 0 }, { x: 0.12, y: 0.02, z: 0.1 }, { x: -0.1, y: 0.01, z: 0 }, { x: 0.05, y: -0.05, z: 0.2 }];
const LCOL = ['34,211,238', '99,102,241', '168,85,247', '34,211,238'];

export default function LandingPage() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const fr  = useRef(0);
  const lzPts = useRef(LSEED.map(s => ({ ...s, trail: [] as { px: number; py: number }[] })));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [words, setWords] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const [showBar, setShowBar] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!bootDone) return;
    [0, 140, 270, 390, 510].forEach((d, i) => setTimeout(() => setWords(i + 1), d));
    setTimeout(() => setShowSub(true), 730);
    setTimeout(() => setShowBar(true), 970);
  }, [bootDone]);

  useEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const rsz = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    rsz();
    window.addEventListener('resize', rsz);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let ang = 0;

    const draw = () => {
      fr.current++;
      ang += 0.0018;
      const f = fr.current, W = c.width, H = c.height;
      const cx = W * 0.5, cy = H * 0.52, sc = Math.min(W, H) / 56;
      const pulse = (Math.sin(f * 0.03) + 1) / 2;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createRadialGradient(cx, H * 0.55, 0, cx, H * 0.55, Math.max(W, H));
      bg.addColorStop(0, '#061422'); bg.addColorStop(0.5, '#030B14'); bg.addColorStop(1, '#020810');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      const vy = H * 0.62;
      ctx.globalAlpha = 0.1;
      for (let i = 0; i <= 20; i++) {
        const y = vy + (H - vy) * (i / 20);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y);
        ctx.strokeStyle = '#0D4F6E'; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (let i = -18; i <= 18; i++) {
        const bx = cx + i * (W / 22);
        ctx.beginPath(); ctx.moveTo(cx, vy); ctx.lineTo(bx, H);
        ctx.strokeStyle = '#0D4F6E'; ctx.lineWidth = 0.5; ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const gg = ctx.createRadialGradient(cx, H * 0.74, 0, cx, H * 0.74, W * 0.35);
      gg.addColorStop(0, 'rgba(34,211,238,' + (0.06 + pulse * 0.03) + ')');
      gg.addColorStop(1, 'transparent');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);

      lzPts.current.forEach((a, ai) => {
        const dx = LS * (a.y - a.x), dy = a.x * (LR - a.z) - a.y, dz = a.x * a.y - LB * a.z;
        a.x += dx * LDT; a.y += dy * LDT; a.z += dz * LDT;
        const rx = a.x * Math.cos(ang) - a.y * Math.sin(ang);
        const px = cx + sc * rx, py = cy - sc * (a.z - 25);
        a.trail.push({ px, py });
        if (a.trail.length > LTR) a.trail.shift();
        const [r, g, b] = LCOL[ai].split(',');
        const len = a.trail.length;
        for (let i = 2; i < len; i++) {
          const t = i / len;
          ctx.beginPath();
          ctx.moveTo(a.trail[i - 1].px, a.trail[i - 1].py);
          ctx.lineTo(a.trail[i].px, a.trail[i].py);
          ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (t * t * 0.55).toFixed(3) + ')';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
        // Glowing head dot — brings back the "alive" feeling
        if (len > 0) {
          const last = a.trail[len - 1];
          const grd = ctx.createRadialGradient(last.px, last.py, 0, last.px, last.py, 6);
          grd.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.9)');
          grd.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
          ctx.beginPath(); ctx.arc(last.px, last.py, 6, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
          ctx.beginPath(); ctx.arc(last.px, last.py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
        }
      });

      [180, 110, 65, 32].forEach((rr, i) => {
        const op = [0.04, 0.08, 0.16, 0.42][i] + pulse * [0.02, 0.03, 0.05, 0.1][i];
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        cg.addColorStop(0, 'rgba(34,211,238,' + op + ')');
        cg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fillStyle = cg; ctx.fill();
      });

      const ra = f * 0.014;
      [58, 46, 34, 22, 13].forEach((rr, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        const op = 0.5 + pulse * 0.28 - i * 0.07;
        ctx.strokeStyle = i === 0 ? 'rgba(245,158,11,' + op + ')' : 'rgba(34,211,238,' + op + ')';
        ctx.lineWidth = i === 0 ? 2.5 : 0.8;
        ctx.stroke();
      });
      for (let j = 0; j < 8; j++) {
        const ss = ra + j * (Math.PI / 4);
        ctx.beginPath(); ctx.arc(cx, cy, 58, ss, ss + 0.24);
        ctx.strokeStyle = 'rgba(245,158,11,0.88)'; ctx.lineWidth = 3; ctx.stroke();
      }

      const ic = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10 + pulse * 4);
      ic.addColorStop(0, '#fff'); ic.addColorStop(0.35, '#A5F3FC'); ic.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, 10 + pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = ic; ctx.fill();

      [-0.52, -0.22, 0.22, 0.52].forEach(a => {
        const bx = cx + Math.sin(a) * W * 0.3, by = H * 0.44 - Math.abs(a) * 48;
        const bl = ctx.createLinearGradient(cx, cy, bx, by);
        bl.addColorStop(0, 'rgba(34,211,238,' + (0.28 + pulse * 0.18) + ')');
        bl.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by);
        ctx.strokeStyle = bl; ctx.lineWidth = 0.7; ctx.stroke();
      });

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize', rsz); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else router.push('/dashboard');
  };

  const WORDS = ['Your', 'knowledge,', 'pulsing', 'with', 'intelligence.'];

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#030B14', fontFamily: "'Inter',sans-serif", color: '#E2F8FF', position: 'relative' }}>
      <CRTBoot onDone={() => setBootDone(true)} />
      <canvas ref={cvs} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />

      <div style={{ position: 'absolute', bottom: '-8px', left: 0, right: 0, zIndex: 1, overflow: 'hidden', height: '78px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: 'clamp(54px,8vw,130px)', fontWeight: 900, letterSpacing: '-3px', color: 'rgba(34,211,238,0.04)', userSelect: 'none', whiteSpace: 'nowrap', lineHeight: 1 }}>PULSARIQ</span>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '48%', background: 'linear-gradient(to bottom,rgba(3,11,20,0.94) 0%,rgba(3,11,20,0.5) 55%,transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '34%', background: 'linear-gradient(to top,rgba(3,11,20,0.98) 0%,rgba(3,11,20,0.65) 55%,transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />

      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, border: '1.5px solid #22D3EE', borderRadius: '50%', boxShadow: '0 0 10px rgba(34,211,238,0.5)', animation: 'glowPulse 2.5s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: '5px', border: '1px solid rgba(99,102,241,0.5)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle,#fff,#22D3EE)', boxShadow: '0 0 6px #22D3EE' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '16px', background: 'linear-gradient(90deg,#E2F8FF,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PulsarIQ</span>
        </div>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <div className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer' }}>Features</span>
            <div className="nav-dropdown" style={{ width: '268px' }}>
              <div className="dd-title">CAPABILITIES</div>
              {[
                { icon: '\\u26a1', ic: 'rgba(34,211,238,0.1)', ic2: '#22D3EE', l: 'RAG Pipeline', d: 'Upload once, query forever with exact citations' },
                { icon: '\\ud83d\\udd12', ic: 'rgba(168,85,247,0.1)', ic2: '#A855F7', l: '100% Private AI', d: 'Self-hosted via Ollama, zero data exposure' },
                { icon: '\\ud83d\\udc65', ic: 'rgba(245,158,11,0.1)', ic2: '#F59E0B', l: 'Enterprise RBAC', d: 'Admin, Manager, Viewer roles at scale' },
                { icon: '\\ud83d\\uddc2\\ufe0f', ic: 'rgba(34,197,94,0.1)', ic2: '#22C55E', l: 'Every Format', d: 'PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML' },
              ].map(item => (
                <div key={item.l} className="dd-item">
                  <div className="dd-icon" style={{ background: item.ic, color: item.ic2 }}>{item.icon}</div>
                  <div><div className="dd-label">{item.l}</div><div className="dd-desc">{item.d}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="nav-item">
            <span className="nav-link" style={{ cursor: 'pointer' }}>Docs</span>
            <div className="nav-dropdown" style={{ width: '220px' }}>
              <div className="dd-title">DOCUMENTATION</div>
              {['Getting Started', 'Upload Guide', 'API Reference', 'Vector Search', 'RBAC Setup', 'Deployment Guide'].map(doc => (
                <div key={doc} className="dd-link"><span>{doc}</span><span>&#8594;</span></div>
              ))}
            </div>
          </div>
          <a href="/signup" style={{ color: '#22D3EE', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Create workspace</a>
        </div>
      </nav>

      <div style={{ position: 'absolute', top: '68px', left: 0, right: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px', pointerEvents: 'none' }}>
        <h1 style={{ fontSize: 'clamp(30px,4.2vw,60px)', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-2px', textAlign: 'center', margin: '0 0 16px', paddingBottom: '4px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25em' }}>
          {WORDS.map((w, i) => (
            <span key={w} style={{
              display: 'inline-block',
              opacity: words > i ? 1 : 0,
              filter: words > i ? 'blur(0)' : 'blur(10px)',
              transform: words > i ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.32s ease,filter 0.32s ease,transform 0.32s ease',
              background: i >= 3 ? 'linear-gradient(90deg,#22D3EE,#6366F1)' : 'none',
              WebkitBackgroundClip: i >= 3 ? 'text' : 'unset',
              WebkitTextFillColor: i >= 3 ? 'transparent' : 'unset',
              color: i >= 3 ? 'transparent' : '#E2F8FF',
            }}>{w}</span>
          ))}
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,248,255,0.38)', textAlign: 'center', margin: 0, lineHeight: 1.6, maxWidth: '420px', opacity: showSub ? 1 : 0, transform: showSub ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease,transform 0.4s ease' }}>
          Upload any document. Ask any question. Precise answers with exact citations.
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '82px', left: 0, right: 0, zIndex: 12, display: 'flex', justifyContent: 'center', padding: '0 20px', opacity: showBar ? 1 : 0, transform: showBar ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.45s ease,transform 0.45s ease' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {error && <div style={{ textAlign: 'center', fontSize: '11px', color: '#EF4444', marginBottom: '7px', padding: '5px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
          <form onSubmit={handleLogin} style={{ display: 'flex', alignItems: 'center', padding: '5px 6px', borderRadius: '13px', background: 'rgba(4,14,28,0.94)', border: '1px solid rgba(34,211,238,0.2)', backdropFilter: 'blur(40px)', boxShadow: '0 8px 40px rgba(0,0,0,0.65)' }}>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email" className="inp-field" style={{ flex: 1, border: 'none', background: 'transparent', boxSizing: 'border-box' as const, minWidth: 0 }} />
            <div style={{ width: '1px', height: '22px', background: 'rgba(34,211,238,0.12)', flexShrink: 0 }} />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="inp-field" style={{ flex: '0 0 148px', border: 'none', background: 'transparent', boxSizing: 'border-box' as const, minWidth: 0 }} />
            <button type="submit" disabled={loading} className="btn-glass" style={{ flexShrink: 0, padding: '9px 20px', borderRadius: '9px', fontSize: '13px', whiteSpace: 'nowrap' }}>
              {loading ? 'Signing in...' : 'Sign In'}&nbsp;{!loading && <ArrowRight size={13} />}
            </button>
            <div style={{ width: '1px', height: '22px', background: 'rgba(34,211,238,0.08)', flexShrink: 0, margin: '0 2px' }} />
            <a href="/signup" style={{ flexShrink: 0, padding: '9px 12px', color: 'rgba(34,211,238,0.6)', fontSize: '12px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Create workspace</a>
          </form>
          <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(226,248,255,0.16)', marginTop: '7px' }}>Self-hosted &middot; Zero data exposure &middot; Enterprise RBAC</p>
        </div>
      </div>
    </div>
  );
}
`;

const outPath = path.join(root, 'app', 'page.tsx');
fs.writeFileSync(outPath, content, 'utf8');
console.log('\n  PulsarIQ \u2014 Vibrant Landing (complete overwrite)\n');
console.log('  \u2713 app/page.tsx written fresh \u2014 ' + content.length + ' bytes');
console.log('  Lorenz trails restored to original vibrant look (brighter, longer, glowing heads).\n');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
