// PulsarIQ — build.js: Complete system rebuild
// All fixes, full theme, agent animation, access page, mobile responsive
// Run: node build.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

const L = (lines) => lines.join('\n');

console.log('\n  PulsarIQ \u2014 Complete Build\n');

// ─────────────────────────────────────────────────────────────
// 1. GLOBALS CSS
// ─────────────────────────────────────────────────────────────
write('app/globals.css', `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #030B14;
  --bg1:      #040D18;
  --panel:    rgba(5,18,35,0.9);
  --border:   rgba(34,211,238,0.12);
  --cyan:     #22D3EE;
  --gold:     #F59E0B;
  --indigo:   #6366F1;
  --green:    #22C55E;
  --red:      #EF4444;
  --t1:       #E2F8FF;
  --t2:       rgba(226,248,255,0.5);
  --t3:       rgba(226,248,255,0.22);
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--t1);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

::selection { background: rgba(34,211,238,0.2); color: var(--t1); }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 4px; }

/* Animations */
@keyframes corePulse   { 0%,100%{transform:scale(1);opacity:0.85} 50%{transform:scale(1.1);opacity:1} }
@keyframes ringSpinCW  { from{transform:rotateX(72deg) rotateZ(0deg)} to{transform:rotateX(72deg) rotateZ(360deg)} }
@keyframes ringSpinCCW { from{transform:rotateX(55deg) rotateZ(0deg)} to{transform:rotateX(55deg) rotateZ(-360deg)} }
@keyframes scanLine    { 0%{top:0%} 100%{top:100%} }
@keyframes floatY      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes glowPulse   { 0%,100%{opacity:0.5} 50%{opacity:1} }
@keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes fadeUp      { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes stepReveal  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
@keyframes blink       { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes marquee     { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* Responsive layout helpers */
.dash-layout   { display:flex; min-height:100vh; }
.sidebar-wrap  { width:220px; flex-shrink:0; }
.main-content  { flex:1; overflow:auto; min-height:100vh; }
.mobile-nav    { display:none; }
.no-mobile     { display:flex; }
.stat-grid     { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.feature-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.chat-layout   { display:flex; gap:16px; height:calc(100vh - 58px); overflow:hidden; }
.doc-sidebar   { width:240px; flex-shrink:0; }

@media print {
  .no-print { display:none !important; }
  body { background:#fff; color:#000; }
  .print-area { background:#fff; color:#000; padding:20px; }
  .chat-msg-user { background:#f0f0f0 !important; }
  .chat-msg-ai   { background:#f8f8f8 !important; }
}

@media (max-width: 768px) {
  .sidebar-wrap  { display:none; }
  .mobile-nav    { display:flex; position:fixed; bottom:0; left:0; right:0; z-index:100; }
  .no-mobile     { display:none !important; }
  .main-content  { padding-bottom:64px; }
  .stat-grid     { grid-template-columns:repeat(2,1fr); gap:10px; }
  .feature-grid  { grid-template-columns:1fr; }
  .chat-layout   { flex-direction:column; height:auto; }
  .doc-sidebar   { width:100%; }
  .hero-layout   { flex-direction:column; padding:0 16px; }
  .hero-left     { max-width:100%; text-align:center; }
  .hero-right    { width:100%; right:0; position:relative; margin-top:16px; }
  .hero-h1       { font-size:32px !important; letter-spacing:-1px !important; }
  .panel-scene   { display:none; }
}
`);

// ─────────────────────────────────────────────────────────────
// 2. LANDING PAGE — fixed z-index, no overlapping
// ─────────────────────────────────────────────────────────────
const landing = [];
const lp = s => landing.push(s);
lp("'use client';");
lp("import { useEffect, useRef, useState } from 'react';");
lp("import { useRouter } from 'next/navigation';");
lp("import { createClient } from '@/lib/supabase/client';");
lp("import { ArrowRight } from 'lucide-react';");
lp("");
lp("export default function LandingPage() {");
lp("  const canvasRef = useRef<HTMLCanvasElement>(null);");
lp("  const animRef   = useRef<number>(0);");
lp("  const fRef      = useRef(0);");
lp("  const [email, setEmail]       = useState('');");
lp("  const [password, setPassword] = useState('');");
lp("  const [error, setError]       = useState('');");
lp("  const [loading, setLoading]   = useState(false);");
lp("  const router   = useRouter();");
lp("  const supabase = createClient();");
lp("");
lp("  useEffect(() => {");
lp("    const canvas = canvasRef.current; if (!canvas) return;");
lp("    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };");
lp("    resize(); window.addEventListener('resize', resize);");
lp("    const ctx = canvas.getContext('2d'); if (!ctx) return;");
lp("    // particles");
lp("    const pts = Array.from({length:70}, () => ({");
lp("      angle: Math.random()*Math.PI*2,");
lp("      speed: (Math.random()*0.008+0.003) * (Math.random()>0.5?1:-1),");
lp("      r: 80+Math.random()*220,");
lp("      size: Math.random()*1.4+0.3,");
lp("      col: Math.random()>0.55 ? '34,211,238' : '99,102,241',");
lp("    }));");
lp("    const draw = () => {");
lp("      fRef.current++;");
lp("      const f=fRef.current, W=canvas.width, H=canvas.height;");
lp("      const cx=W/2, cy=H/2, pulse=(Math.sin(f*0.035)+1)/2;");
lp("      ctx.clearRect(0,0,W,H);");
lp("      // BG gradient");
lp("      const bg=ctx.createRadialGradient(cx,H*0.55,0,cx,H*0.55,Math.max(W,H));");
lp("      bg.addColorStop(0,'#051220'); bg.addColorStop(0.6,'#030B14'); bg.addColorStop(1,'#020810');");
lp("      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);");
lp("      // Grid");
lp("      const vy=H*0.58; ctx.globalAlpha=0.14;");
lp("      for(let i=0;i<=16;i++){const y=vy+(H-vy)*(i/16);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.strokeStyle='#0D4F6E';ctx.lineWidth=0.5;ctx.stroke();}");
lp("      for(let i=-14;i<=14;i++){const bx=cx+i*(W/18);ctx.beginPath();ctx.moveTo(cx,vy);ctx.lineTo(bx,H);ctx.strokeStyle='#0D4F6E';ctx.lineWidth=0.5;ctx.stroke();}");
lp("      ctx.globalAlpha=1;");
lp("      // Ground glow");
lp("      const gg=ctx.createRadialGradient(cx,H*0.72,0,cx,H*0.72,W*0.38);");
lp("      gg.addColorStop(0,'rgba(34,211,238,'+(0.07+pulse*0.04)+')');gg.addColorStop(1,'rgba(34,211,238,0)');");
lp("      ctx.fillStyle=gg;ctx.fillRect(0,0,W,H);");
lp("      // Core glow");
lp("      const ccy=H*0.52;");
lp("      [170,110,65,32].forEach((r,i)=>{");
lp("        const op=[0.05,0.09,0.18,0.45][i]+pulse*[0.02,0.03,0.06,0.1][i];");
lp("        const cg=ctx.createRadialGradient(cx,ccy,0,cx,ccy,r);");
lp("        cg.addColorStop(0,'rgba(34,211,238,'+op+')');cg.addColorStop(1,'rgba(34,211,238,0)');");
lp("        ctx.beginPath();ctx.arc(cx,ccy,r,0,Math.PI*2);ctx.fillStyle=cg;ctx.fill();");
lp("      });");
lp("      // Tech rings");
lp("      const ra=f*0.016;");
lp("      [58,46,34,22,13].forEach((r,i)=>{");
lp("        ctx.beginPath();ctx.arc(cx,ccy,r,0,Math.PI*2);");
lp("        const op=0.55+pulse*0.3-i*0.07;");
lp("        ctx.strokeStyle=i===0?'rgba(245,158,11,'+op+')':'rgba(34,211,238,'+op+')';");
lp("        ctx.lineWidth=i===0?2.5:1;ctx.stroke();");
lp("      });");
lp("      for(let j=0;j<8;j++){const s=ra+j*(Math.PI/4);ctx.beginPath();ctx.arc(cx,ccy,58,s,s+0.28);ctx.strokeStyle='rgba(245,158,11,0.85)';ctx.lineWidth=3;ctx.stroke();}");
lp("      // Particles");
lp("      pts.forEach(p=>{");
lp("        p.angle+=p.speed;");
lp("        const px=cx+Math.cos(p.angle)*p.r, py=ccy+Math.sin(p.angle)*p.r*0.33;");
lp("        const pg=ctx.createRadialGradient(px,py,0,px,py,p.size*3);");
lp("        pg.addColorStop(0,'rgba('+p.col+',0.8)');pg.addColorStop(1,'rgba('+p.col+',0)');");
lp("        ctx.beginPath();ctx.arc(px,py,p.size*3,0,Math.PI*2);ctx.fillStyle=pg;ctx.fill();");
lp("        ctx.beginPath();ctx.arc(px,py,p.size,0,Math.PI*2);ctx.fillStyle='rgba('+p.col+',0.9)';ctx.fill();");
lp("      });");
lp("      // Inner core dot");
lp("      const ic=ctx.createRadialGradient(cx,ccy,0,cx,ccy,11+pulse*4);");
lp("      ic.addColorStop(0,'#fff');ic.addColorStop(0.4,'#A5F3FC');ic.addColorStop(1,'rgba(34,211,238,0)');");
lp("      ctx.beginPath();ctx.arc(cx,ccy,11+pulse*4,0,Math.PI*2);ctx.fillStyle=ic;ctx.fill();");
lp("      animRef.current=requestAnimationFrame(draw);");
lp("    };");
lp("    draw();");
lp("    return ()=>{cancelAnimationFrame(animRef.current);window.removeEventListener('resize',resize);};");
lp("  }, []);");
lp("");
lp("  const handleLogin = async (e: React.FormEvent) => {");
lp("    e.preventDefault(); setLoading(true); setError('');");
lp("    const { error:err } = await supabase.auth.signInWithPassword({ email, password });");
lp("    if (err) { setError(err.message); setLoading(false); }");
lp("    else router.push('/dashboard');");
lp("  };");
lp("");
lp("  const inp: React.CSSProperties = {");
lp("    padding:'10px 13px', background:'rgba(34,211,238,0.05)',");
lp("    border:'1px solid rgba(34,211,238,0.2)', borderRadius:'9px',");
lp("    color:'#E2F8FF', fontSize:'13px', outline:'none',");
lp("    fontFamily:'Inter,sans-serif', width:'100%', boxSizing:'border-box' as const,");
lp("  };");
lp("");
lp("  // Holographic arc panels");
lp("  const panels = [");
lp("    { tx:-410, rotY:-36, col:'#22D3EE', title:'AI Assistant',         sub:'Processing Knowledge',    stat:'Live inference' },");
lp("    { tx:-190, rotY:-16, col:'#6366F1', title:'Document Intelligence', sub:'847 chunks indexed',      stat:'1.2M vectors' },");
lp("    { tx: 190, rotY: 16, col:'#22D3EE', title:'Vector Analytics',      sub:'3,419 queries today',     stat:'187ms avg' },");
lp("    { tx: 410, rotY: 36, col:'#F59E0B', title:'Citations & Trace',     sub:'Source verified',         stat:'94.2% accuracy' },");
lp("  ];");
lp("");
lp("  return (");
lp("    <div style={{ width:'100%', height:'100vh', overflow:'hidden', background:'#030B14', fontFamily:\"'Inter',sans-serif\", position:'relative' }}>");
lp("      {/* Layer 0: Canvas */}");
lp("      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:0 }} />");
lp("");
lp("      {/* Layer 1: PULSARIQ text - behind everything */}");
lp("      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:1, overflow:'hidden', height:'90px', display:'flex', alignItems:'flex-end', justifyContent:'center', pointerEvents:'none' }}>");
lp("        <span style={{ fontSize:'clamp(60px,9vw,140px)', fontWeight:900, letterSpacing:'-3px', color:'rgba(34,211,238,0.05)', userSelect:'none', whiteSpace:'nowrap', lineHeight:1 }}>PULSARIQ</span>");
lp("      </div>");
lp("");
lp("      {/* Layer 2: Side gradients - keep left/right readable */}");
lp("      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'40%', background:'linear-gradient(to right,rgba(3,11,20,0.95),rgba(3,11,20,0.6),transparent)', zIndex:2, pointerEvents:'none' }} />");
lp("      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'36%', background:'linear-gradient(to left,rgba(3,11,20,0.92),rgba(3,11,20,0.55),transparent)', zIndex:2, pointerEvents:'none' }} />");
lp("      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'140px', background:'linear-gradient(to bottom,transparent,rgba(3,11,20,0.9))', zIndex:2, pointerEvents:'none' }} />");
lp("");
lp("      {/* Layer 3: 3D Holographic panels */}");
lp("      <div className='panel-scene' style={{ position:'absolute', inset:0, zIndex:3, perspective:'1000px', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>");
lp("        <div style={{ position:'relative', width:0, height:0, transformStyle:'preserve-3d', marginTop:'40px' }}>");
lp("          {/* Orbital rings */}");
lp("          {[{s:480,a:'ringSpinCW',d:'18s'},{s:380,a:'ringSpinCCW',d:'12s'}].map((r,i)=>(");
lp("            <div key={i} style={{ position:'absolute', width:r.s+'px', height:r.s+'px', marginLeft:-(r.s/2)+'px', marginTop:-(r.s/2)+'px', border:'1px solid rgba(34,211,238,0.07)', borderRadius:'50%', animation:r.a+' '+r.d+' linear infinite' }} />");
lp("          ))}");
lp("          {/* Core glow */}");
lp("          <div style={{ position:'absolute', width:'30px', height:'30px', marginLeft:'-15px', marginTop:'-15px', borderRadius:'50%', background:'radial-gradient(circle,#fff 0%,#A5F3FC 30%,rgba(34,211,238,0.2) 70%,transparent 100%)', boxShadow:'0 0 40px rgba(34,211,238,0.8)', animation:'corePulse 2.2s ease-in-out infinite' }} />");
lp("          {/* Panels */}");
lp("          {panels.map((p,i)=>(");
lp("            <div key={i} style={{ position:'absolute', left:p.tx+'px', top:'-90px', width:'175px', marginLeft:'-87px', transform:'rotateY('+p.rotY+'deg)', animation:'floatY '+(4+i*0.6)+'s ease-in-out '+(i*0.7)+'s infinite' }}>");
lp("              <div style={{ padding:'13px', borderRadius:'12px', background:'rgba(5,18,35,0.88)', border:'1px solid '+p.col+'30', backdropFilter:'blur(20px)', boxShadow:'0 0 24px '+p.col+'18, 0 16px 40px rgba(0,0,0,0.5)', position:'relative', overflow:'hidden' }}>");
lp("                <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'8px' }}>");
lp("                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:p.col, boxShadow:'0 0 6px '+p.col, animation:'glowPulse 2s ease-in-out '+(i*0.4)+'s infinite' }} />");
lp("                  <span style={{ fontSize:'10px', fontWeight:700, color:p.col }}>{p.title}</span>");
lp("                </div>");
lp("                <div style={{ fontSize:'10px', color:'rgba(226,248,255,0.4)', marginBottom:'6px' }}>{p.sub}</div>");
lp("                <div style={{ fontSize:'12px', fontWeight:700, color:p.col }}>{p.stat}</div>");
lp("                <div style={{ position:'absolute', left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,'+p.col+'50,transparent)', animation:'scanLine 2.5s linear '+(i*0.6)+'s infinite', top:0 }} />");
lp("              </div>");
lp("            </div>");
lp("          ))}");
lp("        </div>");
lp("      </div>");
lp("");
lp("      {/* Layer 4: Nav */}");
lp("      <nav style={{ position:'absolute', top:0, left:0, right:0, zIndex:20, height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 36px' }}>");
lp("        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>");
lp("          <div style={{ width:'30px', height:'30px', position:'relative' }}>");
lp("            <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.5)', animation:'glowPulse 2.5s ease-in-out infinite' }} />");
lp("            <div style={{ position:'absolute', inset:'5px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />");
lp("            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'7px', height:'7px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 6px #22D3EE' }} />");
lp("          </div>");
lp("          <span style={{ fontWeight:800, fontSize:'16px', background:'linear-gradient(90deg,#E2F8FF,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PulsarIQ</span>");
lp("        </div>");
lp("        <div style={{ display:'flex', gap:'24px', fontSize:'13px' }}>");
lp("          <a href='#' style={{ color:'rgba(226,248,255,0.4)', textDecoration:'none' }}>Features</a>");
lp("          <a href='#' style={{ color:'rgba(226,248,255,0.4)', textDecoration:'none' }}>Docs</a>");
lp("          <a href='/signup' style={{ color:'#22D3EE', textDecoration:'none', fontWeight:600 }}>Create workspace</a>");
lp("        </div>");
lp("      </nav>");
lp("");
lp("      {/* Layer 5: Left — Headline */}");
lp("      <div className='hero-left' style={{ position:'absolute', left:0, top:'58px', bottom:'100px', zIndex:10, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 0 0 44px', maxWidth:'40%' }}>");
lp("        <h1 className='hero-h1' style={{ fontSize:'clamp(38px,3.8vw,60px)', fontWeight:900, lineHeight:1.06, margin:'0 0 16px', letterSpacing:'-2px' }}>");
lp("          Your knowledge,<br />");
lp("          <span style={{ background:'linear-gradient(90deg,#22D3EE,#6366F1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>pulsing with intelligence.</span>");
lp("        </h1>");
lp("        <p style={{ fontSize:'15px', color:'rgba(226,248,255,0.5)', lineHeight:1.7, margin:'0 0 24px', maxWidth:'340px' }}>");
lp("          Upload any document. Ask any question. Precise answers with exact citations.");
lp("        </p>");
lp("        {[");
lp("          {d:'#22D3EE', t:'Self-hosted — zero data exposure'},");
lp("          {d:'#6366F1', t:'pgvector semantic search (384D)'},");
lp("          {d:'#F59E0B', t:'Enterprise RBAC multi-tenancy'},");
lp("        ].map(({d,t})=>(");
lp("          <div key={t} style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'8px' }}>");
lp("            <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:d, boxShadow:'0 0 6px '+d, flexShrink:0 }} />");
lp("            <span style={{ fontSize:'13px', color:'rgba(226,248,255,0.4)' }}>{t}</span>");
lp("          </div>");
lp("        ))}");
lp("      </div>");
lp("");
lp("      {/* Layer 5: Right — Login form */}");
lp("      <div className='hero-right' style={{ position:'absolute', right:44, top:0, bottom:0, zIndex:10, display:'flex', flexDirection:'column', justifyContent:'center', width:'320px' }}>");
lp("        <div style={{ padding:'28px', borderRadius:'16px', background:'rgba(5,18,35,0.92)', border:'1px solid rgba(34,211,238,0.18)', backdropFilter:'blur(40px)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>");
lp("          <h2 style={{ fontSize:'18px', fontWeight:800, margin:'0 0 4px', color:'#E2F8FF' }}>Sign in to PulsarIQ</h2>");
lp("          <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.4)', margin:'0 0 20px' }}>Access your enterprise knowledge base</p>");
lp("          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>");
lp("            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.4)', display:'block', marginBottom:'5px' }}>Work Email</label><input type='email' required value={email} onChange={e=>setEmail(e.target.value)} placeholder='you@company.com' style={inp} /></div>");
lp("            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.4)', display:'block', marginBottom:'5px' }}>Password</label><input type='password' required value={password} onChange={e=>setPassword(e.target.value)} placeholder='••••••••' style={inp} /></div>");
lp("            {error && <div style={{ fontSize:'11px', color:'#EF4444', padding:'7px 10px', background:'rgba(239,68,68,0.08)', borderRadius:'7px', border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}");
lp("            <button type='submit' disabled={loading} style={{ padding:'11px', borderRadius:'9px', background:'linear-gradient(135deg,#22D3EE,#6366F1)', border:'none', color:'#fff', fontSize:'13px', fontWeight:700, cursor:loading?'wait':'pointer', opacity:loading?0.7:1, boxShadow:'0 4px 20px rgba(34,211,238,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px' }}>");
lp("              {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={14} />}");
lp("            </button>");
lp("          </form>");
lp("          <div style={{ marginTop:'16px', paddingTop:'16px', borderTop:'1px solid rgba(34,211,238,0.08)', textAlign:'center' }}>");
lp("            <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.3)', margin:'0 0 8px' }}>New to PulsarIQ?</p>");
lp("            <a href='/signup' style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'8px 16px', borderRadius:'8px', border:'1px solid rgba(34,211,238,0.2)', color:'#22D3EE', fontSize:'12px', fontWeight:600, textDecoration:'none', background:'rgba(34,211,238,0.05)' }}>Create workspace <ArrowRight size={12} /></a>");
lp("          </div>");
lp("        </div>");
lp("        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(226,248,255,0.2)', marginTop:'10px' }}>SOC2 Ready &#183; On-Premise &#183; Zero Exposure</p>");
lp("      </div>");
lp("    </div>");
lp("  );");
lp("}");
write('app/page.tsx', landing.join('\n'));

// ─────────────────────────────────────────────────────────────
// 3. LOGO MARK component (reusable)
// ─────────────────────────────────────────────────────────────
write('components/ui/logo-mark.tsx', L([
  "'use client';",
  "export default function LogoMark({ size=32 }: { size?:number }) {",
  "  return (",
  "    <div style={{ width:size+'px', height:size+'px', position:'relative', flexShrink:0 }}>",
  "      <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.4)', animation:'glowPulse 2.5s ease-in-out infinite' }} />",
  "      <div style={{ position:'absolute', inset: (size*0.16)+'px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />",
  "      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:(size*0.26)+'px', height:(size*0.26)+'px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 8px #22D3EE' }} />",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 4. SIDEBAR
// ─────────────────────────────────────────────────────────────
write('components/layout/sidebar.tsx', L([
  "'use client';",
  "import Link from 'next/link';",
  "import { usePathname } from 'next/navigation';",
  "import { createClient } from '@/lib/supabase/client';",
  "import { useRouter } from 'next/navigation';",
  "import { BarChart2, FileText, MessageSquare, Settings, LogOut, Search, Shield } from 'lucide-react';",
  "import LogoMark from '@/components/ui/logo-mark';",
  "",
  "const nav = [",
  "  { href:'/dashboard', icon:BarChart2,     label:'Dashboard' },",
  "  { href:'/documents', icon:FileText,      label:'Documents'  },",
  "  { href:'/chat',      icon:MessageSquare, label:'AI Chat'    },",
  "  { href:'/access',    icon:Shield,        label:'Access'     },",
  "  { href:'/analytics', icon:BarChart2,     label:'Analytics'  },",
  "  { href:'/settings',  icon:Settings,      label:'Settings'   },",
  "];",
  "",
  "export default function Sidebar({ onSearch }: { onSearch?:()=>void }) {",
  "  const path=usePathname(), router=useRouter(), supabase=createClient();",
  "  const logout = async () => { await supabase.auth.signOut(); router.push('/'); };",
  "  return (",
  "    <aside style={{ width:'220px', height:'100vh', display:'flex', flexDirection:'column', background:'rgba(3,8,18,0.97)', borderRight:'1px solid rgba(34,211,238,0.08)', position:'sticky', top:0, backdropFilter:'blur(20px)' }}>",
  "      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(34,211,238,0.06)' }}>",
  "        <Link href='/dashboard' style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>",
  "          <LogoMark size={30} />",
  "          <div><div style={{ fontWeight:800, fontSize:'15px', color:'#E2F8FF', lineHeight:1 }}>PulsarIQ</div><div style={{ fontSize:'9px', color:'rgba(34,211,238,0.45)', letterSpacing:'1.5px', marginTop:'2px' }}>ENTERPRISE AI</div></div>",
  "        </Link>",
  "      </div>",
  "      <div style={{ padding:'10px 10px 6px' }}>",
  "        <button onClick={onSearch} style={{ width:'100%', display:'flex', alignItems:'center', gap:'7px', padding:'7px 9px', borderRadius:'8px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.1)', color:'rgba(226,248,255,0.3)', fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>",
  "          <Search size={12} color='rgba(34,211,238,0.5)' /><span style={{ flex:1, textAlign:'left' }}>Search...</span><span style={{ fontSize:'10px', color:'rgba(34,211,238,0.3)', background:'rgba(34,211,238,0.06)', padding:'1px 5px', borderRadius:'4px' }}>\\u2318K</span>",
  "        </button>",
  "      </div>",
  "      <nav style={{ flex:1, padding:'4px 10px', display:'flex', flexDirection:'column', gap:'1px' }}>",
  "        <div style={{ fontSize:'9px', color:'rgba(34,211,238,0.3)', letterSpacing:'1.5px', padding:'8px 4px 4px', fontWeight:600 }}>NAVIGATION</div>",
  "        {nav.map(({ href, icon:Icon, label }) => {",
  "          const active = path===href || path.startsWith(href+'/');",
  "          return (",
  "            <Link key={href} href={href} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 9px', borderRadius:'8px', textDecoration:'none', background:active?'rgba(34,211,238,0.08)':'transparent', border:active?'1px solid rgba(34,211,238,0.14)':'1px solid transparent', transition:'all 0.15s' }}>",
  "              <Icon size={14} color={active?'#22D3EE':'rgba(226,248,255,0.28)'} />",
  "              <span style={{ fontSize:'13px', fontWeight:active?600:400, color:active?'#E2F8FF':'rgba(226,248,255,0.38)' }}>{label}</span>",
  "              {active && <div style={{ marginLeft:'auto', width:'4px', height:'4px', borderRadius:'50%', background:'#22D3EE', boxShadow:'0 0 6px #22D3EE' }} />}",
  "            </Link>",
  "          );",
  "        })}",
  "      </nav>",
  "      <div style={{ padding:'10px', borderTop:'1px solid rgba(34,211,238,0.06)' }}>",
  "        <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', gap:'7px', padding:'7px 9px', borderRadius:'8px', background:'transparent', border:'1px solid rgba(34,211,238,0.08)', color:'rgba(226,248,255,0.3)', fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>",
  "          <LogOut size={13} /><span>Sign out</span>",
  "        </button>",
  "      </div>",
  "    </aside>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 5. MOBILE NAV
// ─────────────────────────────────────────────────────────────
write('components/layout/mobile-nav.tsx', L([
  "'use client';",
  "import Link from 'next/link';",
  "import { usePathname } from 'next/navigation';",
  "import { BarChart2, FileText, MessageSquare, Shield, Settings } from 'lucide-react';",
  "",
  "const tabs = [",
  "  { href:'/dashboard', icon:BarChart2,     label:'Home'    },",
  "  { href:'/documents', icon:FileText,      label:'Docs'    },",
  "  { href:'/chat',      icon:MessageSquare, label:'Chat'    },",
  "  { href:'/access',    icon:Shield,        label:'Access'  },",
  "  { href:'/settings',  icon:Settings,      label:'Settings'},",
  "];",
  "",
  "export default function MobileNav() {",
  "  const path = usePathname();",
  "  return (",
  "    <div className='mobile-nav' style={{ height:'64px', background:'rgba(3,8,18,0.97)', borderTop:'1px solid rgba(34,211,238,0.1)', backdropFilter:'blur(20px)', alignItems:'center', justifyContent:'space-around', padding:'0 4px' }}>",
  "      {tabs.map(({ href, icon:Icon, label }) => {",
  "        const active = path===href || path.startsWith(href+'/');",
  "        return (",
  "          <Link key={href} href={href} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', padding:'6px 12px', borderRadius:'10px', textDecoration:'none', background:active?'rgba(34,211,238,0.08)':'transparent', flex:1 }}>",
  "            <Icon size={18} color={active?'#22D3EE':'rgba(226,248,255,0.3)'} />",
  "            <span style={{ fontSize:'9px', fontWeight:active?700:400, color:active?'#22D3EE':'rgba(226,248,255,0.3)', letterSpacing:'0.3px' }}>{label}</span>",
  "          </Link>",
  "        );",
  "      })}",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 6. TOPBAR
// ─────────────────────────────────────────────────────────────
write('components/layout/topbar.tsx', L([
  "'use client';",
  "import { useEffect, useState } from 'react';",
  "import { createClient } from '@/lib/supabase/client';",
  "import { Bell } from 'lucide-react';",
  "",
  "export default function Topbar({ title }: { title:string }) {",
  "  const [user, setUser] = useState<any>(null);",
  "  const supabase = createClient();",
  "  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);",
  "  return (",
  "    <header style={{ height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', borderBottom:'1px solid rgba(34,211,238,0.07)', background:'rgba(3,8,18,0.85)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:40 }}>",
  "      <div>",
  "        <h1 style={{ fontSize:'15px', fontWeight:700, color:'#E2F8FF', letterSpacing:'-0.3px', lineHeight:1 }}>{title}</h1>",
  "        <p style={{ fontSize:'10px', color:'rgba(34,211,238,0.4)', marginTop:'2px' }}>PulsarIQ Enterprise</p>",
  "      </div>",
  "      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>",
  "        <button style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(34,211,238,0.05)', border:'1px solid rgba(34,211,238,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>",
  "          <Bell size={13} color='rgba(34,211,238,0.5)' />",
  "        </button>",
  "        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#22D3EE,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', boxShadow:'0 0 10px rgba(34,211,238,0.3)' }}>",
  "          {user?.email?.[0]?.toUpperCase() || 'U'}",
  "        </div>",
  "      </div>",
  "    </header>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 7. DASHBOARD LAYOUT
// ─────────────────────────────────────────────────────────────
write('app/(dashboard)/layout.tsx', L([
  "'use client';",
  "import Sidebar from '@/components/layout/sidebar';",
  "import MobileNav from '@/components/layout/mobile-nav';",
  "import CommandPalette from '@/components/layout/command-palette';",
  "import { useState } from 'react';",
  "",
  "export default function DashboardLayout({ children }: { children:React.ReactNode }) {",
  "  const [cmd, setCmd] = useState(false);",
  "  return (",
  "    <div className='dash-layout' style={{ background:'#030B14' }}>",
  "      <CommandPalette open={cmd} onClose={() => setCmd(false)} />",
  "      <div className='sidebar-wrap'><Sidebar onSearch={() => setCmd(true)} /></div>",
  "      <main className='main-content'>{children}</main>",
  "      <MobileNav />",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 8. DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────
write('app/(dashboard)/dashboard/page.tsx', L([
  "'use client';",
  "import { useEffect, useState } from 'react';",
  "import { createClient } from '@/lib/supabase/client';",
  "import Topbar from '@/components/layout/topbar';",
  "import { FileText, MessageSquare, Database, TrendingUp, ArrowUpRight } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.9)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };",
  "",
  "export default function DashboardPage() {",
  "  const [profile, setProfile] = useState<any>(null);",
  "  const [docs, setDocs] = useState<any[]>([]);",
  "  const supabase = createClient();",
  "  useEffect(() => {",
  "    supabase.auth.getUser().then(async ({ data:{user} }) => {",
  "      if (!user) return;",
  "      const { data:p } = await supabase.from('profiles').select('*').eq('id',user.id).single();",
  "      setProfile(p);",
  "      const { data:d } = await supabase.from('documents').select('*').order('created_at',{ascending:false}).limit(5);",
  "      setDocs(d||[]);",
  "    });",
  "  }, []);",
  "  const stats = [",
  "    { icon:FileText,      l:'Documents',   v:String(docs.length), c:'#22D3EE', g:'rgba(34,211,238,0.18)' },",
  "    { icon:Database,      l:'Chunks',      v:'—',                 c:'#F59E0B', g:'rgba(245,158,11,0.18)' },",
  "    { icon:MessageSquare, l:'AI Queries',  v:'—',                 c:'#6366F1', g:'rgba(99,102,241,0.18)' },",
  "    { icon:TrendingUp,    l:'Accuracy',    v:'94.2%',             c:'#22C55E', g:'rgba(34,197,94,0.18)'  },",
  "  ];",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14' }}>",
  "      <Topbar title='Dashboard' />",
  "      <div style={{ padding:'24px' }}>",
  "        <div style={{ ...C, padding:'22px 24px', marginBottom:'18px', background:'linear-gradient(135deg,rgba(34,211,238,0.06),rgba(5,18,35,0.95))', border:'1px solid rgba(34,211,238,0.14)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>",
  "          <div>",
  "            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>",
  "              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 8px #22C55E', animation:'glowPulse 2s ease-in-out infinite' }} />",
  "              <span style={{ fontSize:'10px', color:'rgba(34,211,238,0.6)', fontWeight:600, letterSpacing:'1px' }}>SYSTEM ONLINE</span>",
  "            </div>",
  "            <h2 style={{ fontSize:'20px', fontWeight:800, color:'#E2F8FF', letterSpacing:'-0.5px', margin:'0 0 4px' }}>Welcome back{profile?.full_name ? ', '+profile.full_name : ''}.</h2>",
  "            <p style={{ fontSize:'13px', color:'rgba(226,248,255,0.4)', margin:0 }}>Your enterprise knowledge base is ready.</p>",
  "          </div>",
  "          {profile?.role && <div style={{ padding:'4px 12px', borderRadius:'20px', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.2)', fontSize:'11px', color:'#22D3EE', fontWeight:700 }}>{profile.role.toUpperCase()}</div>}",
  "        </div>",
  "        <div className='stat-grid' style={{ marginBottom:'18px' }}>",
  "          {stats.map(({ icon:Icon, l, v, c, g }) => (",
  "            <div key={l} style={{ ...C, padding:'18px', position:'relative', overflow:'hidden' }}>",
  "              <div style={{ position:'absolute', top:'-16px', right:'-16px', width:'70px', height:'70px', borderRadius:'50%', background:'radial-gradient(circle,'+g+',transparent)', pointerEvents:'none' }} />",
  "              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:c+'14', border:'1px solid '+c+'22', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px' }}><Icon size={16} color={c} /></div>",
  "              <div style={{ fontSize:'24px', fontWeight:900, color:c, letterSpacing:'-1px', lineHeight:1, marginBottom:'3px' }}>{v}</div>",
  "              <div style={{ fontSize:'12px', fontWeight:600, color:'#E2F8FF' }}>{l}</div>",
  "            </div>",
  "          ))}",
  "        </div>",
  "        <div style={{ ...C, padding:'20px' }}>",
  "          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>",
  "            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Recent Documents</h3>",
  "            <a href='/documents' style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#22D3EE', textDecoration:'none' }}>View all <ArrowUpRight size={11} /></a>",
  "          </div>",
  "          {docs.length === 0 ? (",
  "            <div style={{ textAlign:'center', padding:'32px', color:'rgba(226,248,255,0.3)', fontSize:'13px' }}>No documents yet. <a href='/documents' style={{ color:'#22D3EE', textDecoration:'none' }}>Upload your first →</a></div>",
  "          ) : docs.map(d => (",
  "            <div key={d.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'9px', marginBottom:'6px', background:'rgba(34,211,238,0.02)', border:'1px solid rgba(34,211,238,0.06)' }}>",
  "              <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:'rgba(34,211,238,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:800, color:'#22D3EE', flexShrink:0 }}>{d.file_type?.toUpperCase()?.slice(0,3)||'DOC'}</div>",
  "              <div style={{ flex:1, overflow:'hidden' }}><div style={{ fontSize:'12px', color:'#E2F8FF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.filename}</div><div style={{ fontSize:'10px', color:'rgba(226,248,255,0.3)', marginTop:'1px' }}>{new Date(d.created_at).toLocaleDateString()}</div></div>",
  "              <div style={{ padding:'2px 8px', borderRadius:'10px', fontSize:'9px', fontWeight:600, background:d.status==='ready'?'rgba(34,197,94,0.1)':'rgba(34,211,238,0.1)', color:d.status==='ready'?'#22C55E':'#22D3EE', border:'1px solid '+(d.status==='ready'?'rgba(34,197,94,0.2)':'rgba(34,211,238,0.2)'), flexShrink:0 }}>{d.status}</div>",
  "            </div>",
  "          ))}",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 9. DOCUMENTS PAGE
// ─────────────────────────────────────────────────────────────
write('app/(dashboard)/documents/page.tsx', L([
  "'use client';",
  "import { useEffect, useState, useCallback } from 'react';",
  "import Topbar from '@/components/layout/topbar';",
  "import { Upload, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.9)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };",
  "",
  "export default function DocumentsPage() {",
  "  const [docs, setDocs]       = useState<any[]>([]);",
  "  const [uploading, setUploading] = useState(false);",
  "  const [drag, setDrag]       = useState(false);",
  "  const [expanded, setExpanded] = useState<string|null>(null);",
  "  const [chunks, setChunks]   = useState<{[id:string]:string[]}>({});",
  "",
  "  const fetch_ = useCallback(async () => {",
  "    const r = await fetch('/api/documents');",
  "    if (r.ok) { const d = await r.json(); setDocs(d); }",
  "  }, []);",
  "",
  "  useEffect(() => {",
  "    fetch_();",
  "    const t = setInterval(() => setDocs(prev => { if (prev.some(d => d.status==='processing'||d.status==='embedding')) fetch_(); return prev; }), 3000);",
  "    return () => clearInterval(t);",
  "  }, [fetch_]);",
  "",
  "  const upload = async (files: FileList|null) => {",
  "    if (!files||!files.length) return;",
  "    setUploading(true);",
  "    for (const f of Array.from(files)) { const fd=new FormData(); fd.append('file',f); await fetch('/api/documents',{method:'POST',body:fd}); }",
  "    setUploading(false); fetch_();",
  "  };",
  "",
  "  const remove = async (id:string) => { await fetch('/api/documents/'+id,{method:'DELETE'}); fetch_(); };",
  "",
  "  const loadChunks = async (docId:string, filename:string) => {",
  "    if (expanded===docId) { setExpanded(null); return; }",
  "    setExpanded(docId);",
  "    if (chunks[docId]) return;",
  "    // Fetch chunks from supabase via the documents API",
  "    try {",
  "      const r = await fetch('/api/documents/'+docId);",
  "      if (r.ok) {",
  "        const d = await r.json();",
  "        setChunks(prev => ({ ...prev, [docId]: d.chunks || [] }));",
  "      }",
  "    } catch { setChunks(prev => ({ ...prev, [docId]: [] })); }",
  "  };",
  "",
  "  const sCol = (s:string) => s==='ready'?'#22C55E':s==='failed'?'#EF4444':'#22D3EE';",
  "  const sIcon = (s:string) => s==='ready'?<CheckCircle size={11} />:s==='failed'?<AlertCircle size={11} />:<Clock size={11} />;",
  "",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14' }}>",
  "      <Topbar title='Documents' />",
  "      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'18px' }}>",
  "        {/* Upload */}",
  "        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);upload(e.dataTransfer.files);}} onClick={()=>{const i=document.createElement('input');i.type='file';i.multiple=true;i.accept='.pdf,.docx,.xlsx,.pptx,.csv,.txt,.html';i.onchange=e=>upload((e.target as HTMLInputElement).files);i.click();}} style={{ ...C, padding:'36px', textAlign:'center', cursor:'pointer', border:'1px dashed '+(drag?'#22D3EE':'rgba(34,211,238,0.2)'), background:drag?'rgba(34,211,238,0.05)':'rgba(5,18,35,0.5)', transition:'all 0.2s' }}>",
  "          <div style={{ width:'52px', height:'52px', borderRadius:'13px', background:drag?'rgba(34,211,238,0.14)':'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', transition:'all 0.2s' }}>",
  "            {uploading ? <RefreshCw size={22} color='#22D3EE' style={{ animation:'spin 1s linear infinite' }} /> : <Upload size={22} color='#22D3EE' />}",
  "          </div>",
  "          <p style={{ fontSize:'14px', fontWeight:600, color:'#E2F8FF', margin:'0 0 4px' }}>{uploading?'Uploading...':drag?'Drop to upload':'Drag & drop files'}</p>",
  "          <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.3)', margin:0 }}>PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML · Max 50MB</p>",
  "        </div>",
  "        {/* Doc list */}",
  "        <div style={C}>",
  "          <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(34,211,238,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>",
  "            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Knowledge Base</h3>",
  "            <span style={{ fontSize:'11px', color:'rgba(34,211,238,0.5)' }}>{docs.length} documents</span>",
  "          </div>",
  "          <div style={{ padding:'10px' }}>",
  "            {docs.length===0 ? (",
  "              <div style={{ textAlign:'center', padding:'36px', color:'rgba(226,248,255,0.3)', fontSize:'13px' }}>No documents yet. Upload above to get started.</div>",
  "            ) : docs.map(doc => (",
  "              <div key={doc.id} style={{ marginBottom:'6px', borderRadius:'10px', border:'1px solid rgba(34,211,238,0.07)', overflow:'hidden' }}>",
  "                <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', background:'rgba(34,211,238,0.02)', cursor:'pointer' }} onClick={()=>loadChunks(doc.id, doc.filename)}>",
  "                  <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:'rgba(34,211,238,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:800, color:'#22D3EE', flexShrink:0 }}>{doc.file_type?.toUpperCase()?.slice(0,3)||'DOC'}</div>",
  "                  <div style={{ flex:1, overflow:'hidden' }}>",
  "                    <div style={{ fontSize:'12px', color:'#E2F8FF', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.filename}</div>",
  "                    <div style={{ fontSize:'10px', color:'rgba(226,248,255,0.3)', marginTop:'1px' }}>{doc.chunk_count?doc.chunk_count+' chunks · ':''}{new Date(doc.created_at).toLocaleDateString()}</div>",
  "                  </div>",
  "                  <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'2px 8px', borderRadius:'10px', fontSize:'9px', fontWeight:600, background:sCol(doc.status)+'14', color:sCol(doc.status), border:'1px solid '+sCol(doc.status)+'28', flexShrink:0 }}>{sIcon(doc.status)}{doc.status}</div>",
  "                  <div style={{ flexShrink:0, color:'rgba(226,248,255,0.3)' }}>{expanded===doc.id?<ChevronUp size={13}/>:<ChevronDown size={13}/>}</div>",
  "                  <button onClick={e=>{e.stopPropagation();remove(doc.id);}} style={{ width:'26px', height:'26px', borderRadius:'6px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>",
  "                    <Trash2 size={11} color='#EF4444' />",
  "                  </button>",
  "                </div>",
  "                {expanded===doc.id && (",
  "                  <div style={{ padding:'12px 14px', background:'rgba(34,211,238,0.02)', borderTop:'1px solid rgba(34,211,238,0.06)', maxHeight:'200px', overflowY:'auto' }}>",
  "                    {!chunks[doc.id] ? (",
  "                      <div style={{ fontSize:'11px', color:'rgba(226,248,255,0.4)', textAlign:'center', padding:'12px' }}>Loading content...</div>",
  "                    ) : chunks[doc.id].length===0 ? (",
  "                      <div style={{ fontSize:'11px', color:'rgba(226,248,255,0.4)', textAlign:'center', padding:'12px' }}>No content preview available yet. Document may still be processing.</div>",
  "                    ) : chunks[doc.id].slice(0,3).map((chunk,i) => (",
  "                      <div key={i} style={{ marginBottom:'8px', padding:'8px 10px', background:'rgba(34,211,238,0.03)', border:'1px solid rgba(34,211,238,0.08)', borderRadius:'7px' }}>",
  "                        <div style={{ fontSize:'9px', color:'rgba(34,211,238,0.4)', fontWeight:600, marginBottom:'4px' }}>CHUNK {i+1}</div>",
  "                        <div style={{ fontSize:'11px', color:'rgba(226,248,255,0.6)', lineHeight:1.5 }}>{typeof chunk==='string'?chunk.slice(0,200):JSON.stringify(chunk).slice(0,200)}...</div>",
  "                      </div>",
  "                    ))}",
  "                  </div>",
  "                )}",
  "              </div>",
  "            ))}",
  "          </div>",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 10. DOCUMENTS GET ROUTE — return chunks too
// ─────────────────────────────────────────────────────────────
write('app/api/documents/[id]/route.ts', L([
  "import { NextRequest, NextResponse } from 'next/server';",
  "import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';",
  "import { cookies } from 'next/headers';",
  "",
  "export async function GET(req: NextRequest, { params }: { params: { id: string } }) {",
  "  try {",
  "    const supabase = createRouteHandlerClient({ cookies });",
  "    const { data: doc } = await supabase.from('documents').select('*').eq('id', params.id).single();",
  "    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });",
  "    // Fetch first few chunks for preview",
  "    const { data: chunkRows } = await supabase",
  "      .from('document_chunks')",
  "      .select('content')",
  "      .eq('document_id', params.id)",
  "      .order('chunk_index', { ascending: true })",
  "      .limit(5);",
  "    const chunks = (chunkRows || []).map((c: any) => c.content);",
  "    return NextResponse.json({ ...doc, chunks });",
  "  } catch (err: any) {",
  "    return NextResponse.json({ error: err.message }, { status: 500 });",
  "  }",
  "}",
  "",
  "export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {",
  "  try {",
  "    const supabase = createRouteHandlerClient({ cookies });",
  "    const { data: doc } = await supabase.from('documents').select('*').eq('id', params.id).single();",
  "    if (doc?.storage_path) {",
  "      await supabase.storage.from('documents').remove([doc.storage_path]);",
  "    }",
  "    await supabase.from('document_chunks').delete().eq('document_id', params.id);",
  "    await supabase.from('documents').delete().eq('id', params.id);",
  "    return NextResponse.json({ success: true });",
  "  } catch (err: any) {",
  "    return NextResponse.json({ error: err.message }, { status: 500 });",
  "  }",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 11. CHAT PAGE — agent animation + print + mobile
// ─────────────────────────────────────────────────────────────
const chat = [];
const ch = s => chat.push(s);
ch("'use client';");
ch("import { useState, useRef, useEffect, useCallback } from 'react';");
ch("import { createClient } from '@/lib/supabase/client';");
ch("import Topbar from '@/components/layout/topbar';");
ch("import { Send, FileText, Zap, Printer, X, CheckCircle } from 'lucide-react';");
ch("");
ch("const AGENT_STEPS = [");
ch("  '\\u26a1 Initializing query engine...',");
ch("  '\\ud83d\\udd22 Vectorizing input (384D embeddings)...',");
ch("  '\\ud83d\\udd0d Searching knowledge base...',");
ch("  '\\ud83d\\udcc4 Ranking semantic similarity scores...',");
ch("  '\\u2736 Extracting relevant passages...',");
ch("  '\\ud83e\\udd16 Grounding response with citations...',");
ch("];");
ch("");
ch("const C: React.CSSProperties = { background:'rgba(5,18,35,0.9)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };");
ch("");
ch("export default function ChatPage() {");
ch("  const [docs, setDocs]       = useState<any[]>([]);");
ch("  const [selected, setSelected] = useState<string[]>([]);");
ch("  const [msgs, setMsgs]       = useState<{role:string;content:string;citations?:any[]}[]>([]);");
ch("  const [input, setInput]     = useState('');");
ch("  const [loading, setLoading] = useState(false);");
ch("  const [agentSteps, setAgentSteps] = useState<string[]>([]);");
ch("  const [showAgent, setShowAgent]   = useState(false);");
ch("  const [agentDone, setAgentDone]   = useState(false);");
ch("  const bottomRef = useRef<HTMLDivElement>(null);");
ch("  const timersRef = useRef<NodeJS.Timeout[]>([]);");
ch("  const supabase  = createClient();");
ch("");
ch("  useEffect(() => {");
ch("    fetch('/api/documents').then(r=>r.json()).then(d=>setDocs(d.filter((x:any)=>x.status==='ready')));");
ch("  }, []);");
ch("  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, agentSteps]);");
ch("");
ch("  const runAgent = useCallback((docNames: string[]) => {");
ch("    timersRef.current.forEach(t => clearTimeout(t));");
ch("    timersRef.current = [];");
ch("    setAgentSteps([]); setShowAgent(true); setAgentDone(false);");
ch("    const steps = [");
ch("      AGENT_STEPS[0],");
ch("      AGENT_STEPS[1],");
ch("      docNames.length > 0 ? '\\ud83d\\udcc1 Searching: '+docNames.slice(0,2).join(', ')+(docNames.length>2?' +'+( docNames.length-2)+' more...':'...') : AGENT_STEPS[2],");
ch("      AGENT_STEPS[3],");
ch("      AGENT_STEPS[4],");
ch("      AGENT_STEPS[5],");
ch("    ];");
ch("    steps.forEach((step, i) => {");
ch("      const t = setTimeout(() => setAgentSteps(prev => [...prev, step]), i * 480);");
ch("      timersRef.current.push(t);");
ch("    });");
ch("  }, []);");
ch("");
ch("  const send = async () => {");
ch("    if (!input.trim()||loading) return;");
ch("    const userMsg = { role:'user', content:input.trim() };");
ch("    setMsgs(m => [...m, userMsg]);");
ch("    setInput(''); setLoading(true);");
ch("    const docNames = selected.map(id => docs.find(d=>d.id===id)?.filename || id);");
ch("    runAgent(docNames);");
ch("    try {");
ch("      const res = await fetch('/api/chat', {");
ch("        method:'POST', headers:{'Content-Type':'application/json'},");
ch("        body: JSON.stringify({ message:userMsg.content, documentIds:selected, history:msgs }),");
ch("      });");
ch("      const data = await res.json();");
ch("      timersRef.current.forEach(t => clearTimeout(t));");
ch("      setAgentDone(true);");
ch("      setTimeout(() => setShowAgent(false), 1200);");
ch("      setMsgs(m => [...m, { role:'assistant', content:data.answer||'No response.', citations:data.citations }]);");
ch("    } catch {");
ch("      setShowAgent(false);");
ch("      setMsgs(m => [...m, { role:'assistant', content:'Error getting response.' }]);");
ch("    }");
ch("    setLoading(false);");
ch("  };");
ch("");
ch("  const printChat = () => {");
ch("    const w = window.open('','_blank','width=800,height=600');");
ch("    if (!w) return;");
ch("    const html = [");
ch("      '<html><head><title>PulsarIQ Chat Export</title>',");
ch("      '<style>body{font-family:Inter,sans-serif;max-width:700px;margin:32px auto;color:#111;} .u{background:#f0f4ff;padding:10px 14px;border-radius:10px;margin:12px 0;} .a{background:#f8f8f8;padding:10px 14px;border-radius:10px;margin:12px 0;border-left:3px solid #22D3EE;} .label{font-size:11px;font-weight:700;color:#666;margin-bottom:4px;} .cite{font-size:11px;color:#6366F1;} h1{font-size:18px;color:#030B14;border-bottom:2px solid #22D3EE;padding-bottom:8px;}</style>',");
ch("      '</head><body>',");
ch("      '<h1>PulsarIQ Chat Export — '+new Date().toLocaleString()+'</h1>',");
ch("      msgs.map(m => {");
ch("        const label = m.role==='user'?'YOU':'PULSARIQ AI';");
ch("        const cls   = m.role==='user'?'u':'a';");
ch("        const cites = m.citations?.map((c:any)=>'<span class=\\'cite\\'>['+( c.source||'').split('/').pop()+']</span>').join(' ')||'';");
ch("        return '<div class=\\''+cls+'\\'>\\n  <div class=\\'label\\'>'+label+'</div>\\n  <div>'+m.content+'</div>\\n  '+cites+'\\n</div>';");
ch("      }).join(''),");
ch("      '</body></html>',");
ch("    ].join('');");
ch("    w.document.write(html);");
ch("    w.document.close();");
ch("    w.print();");
ch("  };");
ch("");
ch("  const inp: React.CSSProperties = {");
ch("    flex:1, padding:'10px 13px',");
ch("    background:'rgba(34,211,238,0.04)',");
ch("    border:'1px solid rgba(34,211,238,0.18)',");
ch("    borderRadius:'10px', color:'#E2F8FF', fontSize:'13px',");
ch("    outline:'none', fontFamily:'Inter,sans-serif',");
ch("  };");
ch("");
ch("  return (");
ch("    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#030B14' }}>")
ch("      <Topbar title='AI Chat' />");
ch("      <div className='chat-layout' style={{ flex:1, overflow:'hidden', padding:'16px', gap:'14px' }}>");
ch("        {/* Doc selector */}");
ch("        <div className='doc-sidebar' style={{ ...C, display:'flex', flexDirection:'column', overflow:'hidden' }}>");
ch("          <div style={{ padding:'12px 14px', borderBottom:'1px solid rgba(34,211,238,0.07)' }}>");
ch("            <h3 style={{ fontSize:'12px', fontWeight:700, color:'#E2F8FF', margin:'0 0 2px' }}>Sources</h3>");
ch("            <p style={{ fontSize:'10px', color:'rgba(226,248,255,0.3)', margin:0 }}>{selected.length} selected</p>");
ch("          </div>");
ch("          <div style={{ flex:1, overflow:'auto', padding:'8px' }}>");
ch("            {docs.length===0 ? (");
ch("              <div style={{ padding:'16px', textAlign:'center', fontSize:'11px', color:'rgba(226,248,255,0.3)' }}>No ready documents.<br /><a href='/documents' style={{ color:'#22D3EE', textDecoration:'none' }}>Upload first →</a></div>");
ch("            ) : docs.map(doc => {");
ch("              const sel = selected.includes(doc.id);");
ch("              return (");
ch("                <div key={doc.id} onClick={()=>setSelected(s=>sel?s.filter(x=>x!==doc.id):[...s,doc.id])} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 8px', borderRadius:'8px', cursor:'pointer', marginBottom:'3px', background:sel?'rgba(34,211,238,0.08)':'transparent', border:sel?'1px solid rgba(34,211,238,0.2)':'1px solid transparent', transition:'all 0.15s' }}>");
ch("                  <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:'1.5px solid '+(sel?'#22D3EE':'rgba(226,248,255,0.2)'), background:sel?'rgba(34,211,238,0.15)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>");
ch("                    {sel && <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22D3EE' }} />}");
ch("                  </div>");
ch("                  <span style={{ fontSize:'11px', color:sel?'#E2F8FF':'rgba(226,248,255,0.45)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>{doc.filename}</span>");
ch("                </div>");
ch("              );");
ch("            })}");
ch("          </div>");
ch("        </div>");
ch("        {/* Chat area */}");
ch("        <div style={{ ...C, flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>");
ch("          {/* Header */}");
ch("          <div style={{ padding:'12px 14px', borderBottom:'1px solid rgba(34,211,238,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>");
ch("            <span style={{ fontSize:'12px', color:'rgba(226,248,255,0.4)' }}>{msgs.length} messages · {selected.length} sources</span>");
ch("            {msgs.length>0 && (");
ch("              <button className='no-mobile' onClick={printChat} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'7px', background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.15)', color:'#22D3EE', fontSize:'11px', fontWeight:600, cursor:'pointer' }}>");
ch("                <Printer size={12} /> Print");
ch("              </button>");
ch("            )}");
ch("          </div>");
ch("          {/* Messages */}");
ch("          <div style={{ flex:1, overflow:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'14px' }}>");
ch("            {msgs.length===0 && !showAgent && (");
ch("              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px' }}>");
ch("                <div style={{ width:'52px', height:'52px', borderRadius:'13px', background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px' }}>");
ch("                  <Zap size={22} color='rgba(34,211,238,0.5)' />");
ch("                </div>");
ch("                <p style={{ fontSize:'14px', fontWeight:600, color:'#E2F8FF', margin:'0 0 6px' }}>Ask your documents anything</p>");
ch("                <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.35)', margin:0 }}>Select sources on the left, then ask a question.</p>");
ch("              </div>");
ch("            )}");
ch("            {msgs.map((m,i) => (");
ch("              <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>");
ch("                <div style={{ maxWidth:'82%' }}>");
ch("                  {m.role==='assistant' && (");
ch("                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>");
ch("                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'linear-gradient(135deg,#22D3EE,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center' }}><Zap size={9} color='#fff' /></div>");
ch("                      <span style={{ fontSize:'10px', color:'rgba(34,211,238,0.6)', fontWeight:600 }}>PulsarIQ</span>");
ch("                    </div>");
ch("                  )}");
ch("                  <div className={m.role==='user'?'chat-msg-user':'chat-msg-ai'} style={{ padding:'11px 14px', borderRadius:m.role==='user'?'13px 13px 3px 13px':'3px 13px 13px 13px', background:m.role==='user'?'rgba(34,211,238,0.1)':'rgba(34,211,238,0.04)', border:'1px solid '+(m.role==='user'?'rgba(34,211,238,0.22)':'rgba(34,211,238,0.09)'), fontSize:'13px', color:'#E2F8FF', lineHeight:1.6 }}>");
ch("                    {m.content}");
ch("                  </div>");
ch("                  {m.citations&&m.citations.length>0 && (");
ch("                    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginTop:'7px' }}>");
ch("                      {m.citations.slice(0,4).map((c:any,ci:number)=>(");
ch("                        <div key={ci} style={{ display:'flex', alignItems:'center', gap:'3px', padding:'2px 7px', borderRadius:'9px', background:'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.14)', fontSize:'9px', color:'#22D3EE' }}>");
ch("                          <FileText size={8} />{String(c.source||'').split('/').pop()?.slice(0,22)||'Source'}");
ch("                        </div>");
ch("                      ))}");
ch("                    </div>");
ch("                  )}");
ch("                </div>");
ch("              </div>");
ch("            ))}");
ch("            {/* Agent thinking panel */}");
ch("            {showAgent && (");
ch("              <div style={{ borderRadius:'12px', background:'rgba(5,18,35,0.95)', border:'1px solid rgba(34,211,238,0.2)', padding:'14px', animation:'fadeUp 0.3s ease-out' }}>");
ch("                <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'10px' }}>");
ch("                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:agentDone?'#22C55E':'#22D3EE', boxShadow:'0 0 6px '+(agentDone?'#22C55E':'#22D3EE'), animation:agentDone?'none':'glowPulse 1s ease-in-out infinite' }} />");
ch("                  <span style={{ fontSize:'11px', fontWeight:700, color:agentDone?'#22C55E':'#22D3EE', letterSpacing:'0.5px' }}>{agentDone?'COMPLETE':'PROCESSING...'}</span>");
ch("                </div>");
ch("                {agentSteps.map((step, i) => (");
ch("                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'4px 0', animation:'stepReveal 0.25s ease-out' }}>");
ch("                    <div style={{ width:'14px', height:'14px', borderRadius:'50%', background:agentDone||i<agentSteps.length-1?'rgba(34,211,238,0.15)':'rgba(245,158,11,0.15)', border:'1px solid '+(agentDone||i<agentSteps.length-1?'rgba(34,211,238,0.3)':'rgba(245,158,11,0.3)'), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>");
ch("                      {agentDone||i<agentSteps.length-1 ? <CheckCircle size={8} color='#22D3EE' /> : <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#F59E0B', animation:'blink 0.8s ease-in-out infinite' }} />}");
ch("                    </div>");
ch("                    <span style={{ fontSize:'11px', color:agentDone||i<agentSteps.length-1?'rgba(226,248,255,0.5)':'#E2F8FF' }}>{step}</span>");
ch("                  </div>");
ch("                ))}");
ch("              </div>");
ch("            )}");
ch("            <div ref={bottomRef} />");
ch("          </div>");
ch("          {/* Input */}");
ch("          <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(34,211,238,0.07)' }}>");
ch("            <div style={{ display:'flex', gap:'8px' }}>");
ch("              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} placeholder={selected.length===0?'Select documents to start...':'Ask anything about your documents...'} disabled={selected.length===0||loading} style={inp} />");
ch("              <button onClick={send} disabled={!input.trim()||loading||selected.length===0} style={{ width:'42px', height:'42px', borderRadius:'10px', background:input.trim()&&!loading&&selected.length>0?'linear-gradient(135deg,#22D3EE,#6366F1)':'rgba(34,211,238,0.06)', border:'1px solid rgba(34,211,238,0.14)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:input.trim()?'0 4px 14px rgba(34,211,238,0.25)':'none', transition:'all 0.2s', flexShrink:0 }}>");
ch("                <Send size={15} color={input.trim()&&!loading&&selected.length>0?'#fff':'rgba(34,211,238,0.4)'} />");
ch("              </button>");
ch("            </div>");
ch("          </div>");
ch("        </div>");
ch("      </div>");
ch("    </div>");
ch("  );");
ch("}");
write('app/(dashboard)/chat/page.tsx', chat.join('\n'));

// ─────────────────────────────────────────────────────────────
// 12. ACCESS PAGE (fix 404)
// ─────────────────────────────────────────────────────────────
write('app/(dashboard)/access/page.tsx', L([
  "'use client';",
  "import { useEffect, useState } from 'react';",
  "import { createClient } from '@/lib/supabase/client';",
  "import Topbar from '@/components/layout/topbar';",
  "import { Shield, Users, Crown, Eye, Edit, Mail } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.9)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };",
  "",
  "const ROLE_META: Record<string,{col:string;icon:any;desc:string}> = {",
  "  admin:   { col:'#F59E0B', icon:Crown, desc:'Full access — manage users, documents, and settings' },",
  "  manager: { col:'#6366F1', icon:Edit,  desc:'Upload documents and manage team content' },",
  "  viewer:  { col:'#22D3EE', icon:Eye,   desc:'Read-only access to documents and AI chat' },",
  "};",
  "",
  "export default function AccessPage() {",
  "  const [profile,  setProfile]  = useState<any>(null);",
  "  const [members,  setMembers]  = useState<any[]>([]);",
  "  const [invite,   setInvite]   = useState('');",
  "  const [invRole,  setInvRole]  = useState('viewer');",
  "  const [invMsg,   setInvMsg]   = useState('');",
  "  const supabase = createClient();",
  "",
  "  useEffect(() => {",
  "    supabase.auth.getUser().then(async ({ data:{user} }) => {",
  "      if (!user) return;",
  "      const { data:p } = await supabase.from('profiles').select('*').eq('id',user.id).single();",
  "      setProfile({ ...p, email:user.email });",
  "      if (p?.org_id) {",
  "        const { data:m } = await supabase.from('profiles').select('*').eq('org_id',p.org_id);",
  "        setMembers(m||[]);",
  "      }",
  "    });",
  "  }, []);",
  "",
  "  const sendInvite = () => {",
  "    if (!invite) return;",
  "    setInvMsg('Invite sent to '+invite+' (mock — configure email in production)');",
  "    setInvite('');",
  "    setTimeout(()=>setInvMsg(''),4000);",
  "  };",
  "",
  "  const roleInfo = ROLE_META[profile?.role] || ROLE_META.viewer;",
  "  const RoleIcon = roleInfo.icon;",
  "",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14' }}>",
  "      <Topbar title='Access Control' />",
  "      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'18px', maxWidth:'800px' }}>",
  "",
  "        {/* My Role */}",
  "        <div style={{ ...C, padding:'22px', background:'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(5,18,35,0.95))', border:'1px solid rgba(245,158,11,0.2)' }}>",
  "          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>",
  "            <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>",
  "              <Shield size={20} color='#F59E0B' />",
  "            </div>",
  "            <div>",
  "              <div style={{ fontSize:'11px', color:'rgba(226,248,255,0.4)', marginBottom:'2px' }}>YOUR ROLE</div>",
  "              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>",
  "                <span style={{ fontSize:'18px', fontWeight:800, color:'#E2F8FF' }}>{profile?.role?.toUpperCase() || 'VIEWER'}</span>",
  "                <div style={{ padding:'3px 9px', borderRadius:'12px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', fontSize:'10px', fontWeight:700, color:'#F59E0B' }}>ACTIVE</div>",
  "              </div>",
  "              <div style={{ fontSize:'12px', color:'rgba(226,248,255,0.4)', marginTop:'2px' }}>{roleInfo.desc}</div>",
  "            </div>",
  "          </div>",
  "        </div>",
  "",
  "        {/* Role legend */}",
  "        <div style={C}>",
  "          <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(34,211,238,0.07)' }}>",
  "            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Permission Levels</h3>",
  "          </div>",
  "          <div style={{ padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>",
  "            {Object.entries(ROLE_META).map(([role, meta]) => {",
  "              const Icon = meta.icon;",
  "              const isMe = profile?.role===role;",
  "              return (",
  "                <div key={role} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', background:isMe?meta.col+'0A':'rgba(34,211,238,0.02)', border:'1px solid '+(isMe?meta.col+'25':'rgba(34,211,238,0.07)') }}>",
  "                  <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:meta.col+'14', border:'1px solid '+meta.col+'22', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={14} color={meta.col} /></div>",
  "                  <div style={{ flex:1 }}>",
  "                    <div style={{ fontSize:'12px', fontWeight:700, color:'#E2F8FF', textTransform:'capitalize' }}>{role} {isMe && <span style={{ fontSize:'9px', color:meta.col, marginLeft:'6px' }}>YOU</span>}</div>",
  "                    <div style={{ fontSize:'11px', color:'rgba(226,248,255,0.4)' }}>{meta.desc}</div>",
  "                  </div>",
  "                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:meta.col, boxShadow:'0 0 6px '+meta.col }} />",
  "                </div>",
  "              );",
  "            })}",
  "          </div>",
  "        </div>",
  "",
  "        {/* Team members */}",
  "        <div style={C}>",
  "          <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(34,211,238,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>",
  "            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Team Members</h3>",
  "            <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'rgba(34,211,238,0.5)' }}><Users size={12} />{members.length} members</div>",
  "          </div>",
  "          <div style={{ padding:'10px' }}>",
  "            {members.map(m => {",
  "              const meta = ROLE_META[m.role] || ROLE_META.viewer;",
  "              const Icon = meta.icon;",
  "              return (",
  "                <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 10px', borderRadius:'9px', marginBottom:'5px', background:'rgba(34,211,238,0.02)', border:'1px solid rgba(34,211,238,0.06)' }}>",
  "                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#22D3EE,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', flexShrink:0 }}>{m.full_name?.[0]?.toUpperCase()||m.email?.[0]?.toUpperCase()||'U'}</div>",
  "                  <div style={{ flex:1, overflow:'hidden' }}>",
  "                    <div style={{ fontSize:'12px', color:'#E2F8FF', fontWeight:500 }}>{m.full_name||'No name'}</div>",
  "                    <div style={{ fontSize:'10px', color:'rgba(226,248,255,0.35)' }}>{m.email}</div>",
  "                  </div>",
  "                  <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'2px 8px', borderRadius:'9px', background:meta.col+'12', border:'1px solid '+meta.col+'25', fontSize:'9px', fontWeight:700, color:meta.col, flexShrink:0 }}><Icon size={9} />{m.role}</div>",
  "                </div>",
  "              );",
  "            })}",
  "            {members.length===0 && <div style={{ padding:'20px', textAlign:'center', fontSize:'12px', color:'rgba(226,248,255,0.3)' }}>No members found.</div>}",
  "          </div>",
  "        </div>",
  "",
  "        {/* Invite */}",
  "        {profile?.role==='admin' && (",
  "          <div style={C}>",
  "            <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(34,211,238,0.07)' }}>",
  "              <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Invite Team Member</h3>",
  "            </div>",
  "            <div style={{ padding:'16px', display:'flex', gap:'10px' }}>",
  "              <input value={invite} onChange={e=>setInvite(e.target.value)} placeholder='colleague@company.com' style={{ flex:1, padding:'9px 12px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.18)', borderRadius:'9px', color:'#E2F8FF', fontSize:'13px', outline:'none', fontFamily:'Inter,sans-serif' }} />",
  "              <select value={invRole} onChange={e=>setInvRole(e.target.value)} style={{ padding:'9px 12px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.18)', borderRadius:'9px', color:'#E2F8FF', fontSize:'13px', outline:'none', fontFamily:'Inter,sans-serif' }}>",
  "                <option value='viewer'>Viewer</option>",
  "                <option value='manager'>Manager</option>",
  "                <option value='admin'>Admin</option>",
  "              </select>",
  "              <button onClick={sendInvite} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'9px 16px', borderRadius:'9px', background:'linear-gradient(135deg,#22D3EE,#6366F1)', border:'none', color:'#fff', fontSize:'12px', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(34,211,238,0.3)' }}><Mail size={13} />Send Invite</button>",
  "            </div>",
  "            {invMsg && <div style={{ padding:'8px 16px', fontSize:'12px', color:'#22C55E' }}>{invMsg}</div>}",
  "          </div>",
  "        )}",
  "      </div>",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 13. ANALYTICS PAGE
// ─────────────────────────────────────────────────────────────
write('app/(dashboard)/analytics/page.tsx', L([
  "'use client';",
  "import Topbar from '@/components/layout/topbar';",
  "import { TrendingUp, FileText, MessageSquare, Database, Zap } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.9)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };",
  "",
  "export default function AnalyticsPage() {",
  "  const metrics = [",
  "    { icon:FileText,      l:'Documents',   v:'2,847', ch:'+12%', c:'#22D3EE' },",
  "    { icon:MessageSquare, l:'AI Queries',  v:'3,419', ch:'+23%', c:'#F59E0B' },",
  "    { icon:Database,      l:'Chunks',      v:'1.2M',  ch:'+8%',  c:'#6366F1' },",
  "    { icon:Zap,           l:'Avg Latency', v:'187ms', ch:'-15%', c:'#22C55E' },",
  "  ];",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14' }}>",
  "      <Topbar title='Analytics' />",
  "      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'18px' }}>",
  "        <div className='stat-grid'>",
  "          {metrics.map(({ icon:Icon, l, v, ch, c }) => (",
  "            <div key={l} style={{ ...C, padding:'20px', position:'relative', overflow:'hidden' }}>",
  "              <div style={{ position:'absolute', top:'-18px', right:'-18px', width:'72px', height:'72px', borderRadius:'50%', background:'radial-gradient(circle,'+c+'18,transparent)', pointerEvents:'none' }} />",
  "              <Icon size={16} color={c} style={{ marginBottom:'10px' }} />",
  "              <div style={{ fontSize:'26px', fontWeight:900, color:c, letterSpacing:'-1px', marginBottom:'3px' }}>{v}</div>",
  "              <div style={{ fontSize:'12px', fontWeight:600, color:'#E2F8FF', marginBottom:'3px' }}>{l}</div>",
  "              <div style={{ fontSize:'11px', color:ch.startsWith('+')? '#22C55E':'#EF4444', fontWeight:600 }}>{ch} this month</div>",
  "            </div>",
  "          ))}",
  "        </div>",
  "        <div style={{ ...C, padding:'22px' }}>",
  "          <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:'0 0 18px' }}>Query Volume — Last 14 Days</h3>",
  "          <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'110px' }}>",
  "            {[40,65,45,80,55,90,70,85,60,95,75,88,65,100].map((h,i) => (",
  "              <div key={i} style={{ flex:1, background:'linear-gradient(to top,rgba(34,211,238,0.6),rgba(34,211,238,0.1))', borderRadius:'4px 4px 0 0', height:h+'%', minWidth:'8px', border:'1px solid rgba(34,211,238,0.2)', boxShadow:'0 0 8px rgba(34,211,238,0.1)' }} />",
  "            ))}",
  "          </div>",
  "          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px' }}>",
  "            {['14d','13d','12d','11d','10d','9d','8d','7d','6d','5d','4d','3d','2d','1d'].map(d=>(",
  "              <span key={d} style={{ fontSize:'8px', color:'rgba(226,248,255,0.25)' }}>{d}</span>",
  "            ))}",
  "          </div>",
  "        </div>",
  "        <div style={{ ...C, padding:'22px' }}>",
  "          <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:'0 0 16px' }}>System Status</h3>",
  "          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>",
  "            {[",
  "              { l:'Vector Search (pgvector)', s:'Operational', c:'#22C55E' },",
  "              { l:'Ollama AI (tinyllama)',    s:'Running',     c:'#22C55E' },",
  "              { l:'Document Ingestion',      s:'Active',      c:'#22C55E' },",
  "              { l:'Supabase Storage',        s:'Connected',   c:'#22C55E' },",
  "            ].map(({l,s,c})=>(",
  "              <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderRadius:'9px', background:'rgba(34,211,238,0.02)', border:'1px solid rgba(34,211,238,0.06)' }}>",
  "                <span style={{ fontSize:'12px', color:'rgba(226,248,255,0.6)' }}>{l}</span>",
  "                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}><div style={{ width:'5px', height:'5px', borderRadius:'50%', background:c, boxShadow:'0 0 5px '+c }} /><span style={{ fontSize:'11px', color:c, fontWeight:600 }}>{s}</span></div>",
  "              </div>",
  "            ))}",
  "          </div>",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 14. SETTINGS PAGE
// ─────────────────────────────────────────────────────────────
write('app/(dashboard)/settings/page.tsx', L([
  "'use client';",
  "import { useEffect, useState } from 'react';",
  "import { createClient } from '@/lib/supabase/client';",
  "import Topbar from '@/components/layout/topbar';",
  "import { User, Shield, Database, Save, CheckCircle } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.9)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', padding:'22px' };",
  "const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.18)', borderRadius:'9px', color:'#E2F8FF', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Inter,sans-serif' };",
  "",
  "export default function SettingsPage() {",
  "  const [profile, setProfile] = useState<any>(null);",
  "  const [saved,   setSaved]   = useState(false);",
  "  const supabase = createClient();",
  "  useEffect(() => {",
  "    supabase.auth.getUser().then(async ({ data:{user} }) => {",
  "      if (!user) return;",
  "      const { data:p } = await supabase.from('profiles').select('*').eq('id',user.id).single();",
  "      setProfile({ ...(p||{}), email:user.email });",
  "    });",
  "  }, []);",
  "  const save = async () => {",
  "    const { data:{user} } = await supabase.auth.getUser();",
  "    if (!user||!profile) return;",
  "    await supabase.from('profiles').update({ full_name:profile.full_name }).eq('id',user.id);",
  "    setSaved(true); setTimeout(()=>setSaved(false),2500);",
  "  };",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14' }}>",
  "      <Topbar title='Settings' />",
  "      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px', maxWidth:'600px' }}>",
  "        <div style={C}>",
  "          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'18px' }}><User size={15} color='#22D3EE' /><h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Profile</h3></div>",
  "          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>",
  "            {[{l:'Full Name',k:'full_name',t:'text'},{l:'Email',k:'email',t:'email'}].map(({l,k,t})=>(",
  "              <div key={k}>",
  "                <label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>{l}</label>",
  "                <input type={t} value={profile?.[k]||''} disabled={k==='email'} onChange={e=>setProfile((p:any)=>({...p,[k]:e.target.value}))} style={{ ...inp, opacity:k==='email'?0.5:1 }} />",
  "              </div>",
  "            ))}",
  "            <button onClick={save} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'9px 18px', borderRadius:'9px', background:'linear-gradient(135deg,#22D3EE,#6366F1)', border:'none', color:'#fff', fontSize:'12px', fontWeight:700, cursor:'pointer', width:'fit-content', boxShadow:'0 4px 16px rgba(34,211,238,0.3)' }}>",
  "              {saved ? <><CheckCircle size={13} />Saved!</> : <><Save size={13} />Save Changes</>}",
  "            </button>",
  "          </div>",
  "        </div>",
  "        <div style={C}>",
  "          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'14px' }}><Shield size={15} color='#F59E0B' /><h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Security</h3></div>",
  "          {[{l:'Role',v:profile?.role||'viewer'},{l:'Org ID',v:(profile?.org_id||'—').slice(0,18)+'...'}].map(({l,v})=>(",
  "            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(34,211,238,0.06)' }}>",
  "              <span style={{ fontSize:'12px', color:'rgba(226,248,255,0.45)' }}>{l}</span>",
  "              <span style={{ fontSize:'12px', color:'#E2F8FF', fontWeight:600 }}>{v}</span>",
  "            </div>",
  "          ))}",
  "        </div>",
  "        <div style={C}>",
  "          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'14px' }}><Database size={15} color='#6366F1' /><h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>AI Configuration</h3></div>",
  "          {[{l:'Embedding Model',v:'all-minilm (384D)'},{l:'Chat Model',v:'tinyllama'},{l:'Vector Dims',v:'384'},{l:'Search',v:'pgvector + keyword fallback'}].map(({l,v})=>(",
  "            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(34,211,238,0.06)' }}>",
  "              <span style={{ fontSize:'12px', color:'rgba(226,248,255,0.45)' }}>{l}</span>",
  "              <span style={{ fontSize:'11px', color:'#22D3EE', fontWeight:600, fontFamily:'monospace' }}>{v}</span>",
  "            </div>",
  "          ))}",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
]));

// ─────────────────────────────────────────────────────────────
// 15. AUTH PAGES
// ─────────────────────────────────────────────────────────────
write('app/(auth)/login/page.tsx', L([
  "'use client';",
  "import { useState } from 'react';",
  "import { useRouter } from 'next/navigation';",
  "import { createClient } from '@/lib/supabase/client';",
  "import Link from 'next/link';",
  "import { ArrowRight } from 'lucide-react';",
  "",
  "export default function LoginPage() {",
  "  const [email,setEmail]=useState('');",
  "  const [password,setPassword]=useState('');",
  "  const [error,setError]=useState('');",
  "  const [loading,setLoading]=useState(false);",
  "  const router=useRouter(), supabase=createClient();",
  "  const handleSubmit = async (e:React.FormEvent) => {",
  "    e.preventDefault(); setLoading(true); setError('');",
  "    const { error:err } = await supabase.auth.signInWithPassword({ email, password });",
  "    if (err) { setError(err.message); setLoading(false); } else router.push('/dashboard');",
  "  };",
  "  const inp: React.CSSProperties = { width:'100%', padding:'11px 13px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.18)', borderRadius:'9px', color:'#E2F8FF', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Inter,sans-serif' };",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>",
  "      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse,rgba(34,211,238,0.07),transparent)', pointerEvents:'none' }} />",
  "      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(13,79,110,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(13,79,110,0.07) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }} />",
  "      <div style={{ width:'100%', maxWidth:'380px', position:'relative', zIndex:2 }}>",
  "        <div style={{ textAlign:'center', marginBottom:'28px' }}>",
  "          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>",
  "            <div style={{ width:'28px', height:'28px', position:'relative' }}>",
  "              <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.5)' }} />",
  "              <div style={{ position:'absolute', inset:'5px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />",
  "              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'7px', height:'7px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 6px #22D3EE' }} />",
  "            </div>",
  "            <span style={{ fontWeight:900, fontSize:'20px', background:'linear-gradient(90deg,#E2F8FF,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PulsarIQ</span>",
  "          </div>",
  "          <p style={{ fontSize:'11px', color:'rgba(34,211,238,0.4)', letterSpacing:'1.5px' }}>ENTERPRISE AI</p>",
  "        </div>",
  "        <div style={{ padding:'28px', borderRadius:'16px', background:'rgba(5,18,35,0.92)', border:'1px solid rgba(34,211,238,0.15)', backdropFilter:'blur(40px)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>",
  "          <h2 style={{ fontSize:'18px', fontWeight:800, margin:'0 0 4px', color:'#E2F8FF' }}>Sign in</h2>",
  "          <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.4)', margin:'0 0 20px' }}>Access your knowledge base</p>",
  "          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>",
  "            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>Work Email</label><input type='email' required value={email} onChange={e=>setEmail(e.target.value)} placeholder='you@company.com' style={inp} /></div>",
  "            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>Password</label><input type='password' required value={password} onChange={e=>setPassword(e.target.value)} placeholder='••••••••' style={inp} /></div>",
  "            {error && <div style={{ fontSize:'11px', color:'#EF4444', padding:'7px 10px', background:'rgba(239,68,68,0.08)', borderRadius:'7px', border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}",
  "            <button type='submit' disabled={loading} style={{ padding:'11px', borderRadius:'9px', background:'linear-gradient(135deg,#22D3EE,#6366F1)', border:'none', color:'#fff', fontSize:'13px', fontWeight:700, cursor:loading?'wait':'pointer', opacity:loading?0.7:1, boxShadow:'0 4px 20px rgba(34,211,238,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', marginTop:'4px' }}>{loading?'Signing in...':'Sign In'} {!loading && <ArrowRight size={14} />}</button>",
  "          </form>",
  "          <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(226,248,255,0.3)', marginTop:'18px', marginBottom:0 }}>New to PulsarIQ? <Link href='/signup' style={{ color:'#22D3EE', fontWeight:600, textDecoration:'none' }}>Create workspace</Link></p>",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
]));

write('app/(auth)/signup/page.tsx', L([
  "'use client';",
  "import { useState } from 'react';",
  "import { useRouter } from 'next/navigation';",
  "import Link from 'next/link';",
  "import { ArrowRight } from 'lucide-react';",
  "",
  "export default function SignupPage() {",
  "  const [form,setForm]=useState({name:'',email:'',password:'',org:''});",
  "  const [error,setError]=useState('');",
  "  const [loading,setLoading]=useState(false);",
  "  const router=useRouter();",
  "  const handleSubmit = async (e:React.FormEvent) => {",
  "    e.preventDefault(); setLoading(true); setError('');",
  "    try {",
  "      const res=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});",
  "      const data=await res.json();",
  "      if (!res.ok) throw new Error(data.error||'Signup failed');",
  "      const {createClient}=await import('@/lib/supabase/client');",
  "      const {error:se}=await createClient().auth.signInWithPassword({email:form.email,password:form.password});",
  "      if (se) throw se;",
  "      router.push('/dashboard');",
  "    } catch (err:any) { setError(err.message||'Something went wrong'); setLoading(false); }",
  "  };",
  "  const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.18)', borderRadius:'9px', color:'#E2F8FF', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Inter,sans-serif' };",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>",
  "      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse,rgba(34,211,238,0.07),transparent)', pointerEvents:'none' }} />",
  "      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(13,79,110,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(13,79,110,0.07) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }} />",
  "      <div style={{ width:'100%', maxWidth:'400px', position:'relative', zIndex:2 }}>",
  "        <div style={{ textAlign:'center', marginBottom:'24px' }}>",
  "          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px' }}>",
  "            <div style={{ width:'28px', height:'28px', position:'relative' }}>",
  "              <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.5)' }} />",
  "              <div style={{ position:'absolute', inset:'5px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />",
  "              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'7px', height:'7px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 6px #22D3EE' }} />",
  "            </div>",
  "            <span style={{ fontWeight:900, fontSize:'20px', background:'linear-gradient(90deg,#E2F8FF,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PulsarIQ</span>",
  "          </div>",
  "        </div>",
  "        <div style={{ padding:'28px', borderRadius:'16px', background:'rgba(5,18,35,0.92)', border:'1px solid rgba(34,211,238,0.15)', backdropFilter:'blur(40px)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>",
  "          <h2 style={{ fontSize:'18px', fontWeight:800, margin:'0 0 4px', color:'#E2F8FF' }}>Create workspace</h2>",
  "          <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.4)', margin:'0 0 20px' }}>Set up your enterprise knowledge base</p>",
  "          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'11px' }}>",
  "            {[{k:'name',l:'Full Name',t:'text',ph:'John Smith'},{k:'org',l:'Organisation',t:'text',ph:'Acme Corp'},{k:'email',l:'Work Email',t:'email',ph:'you@company.com'},{k:'password',l:'Password',t:'password',ph:'••••••••'}].map(({k,l,t,ph})=>(",
  "              <div key={k}><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>{l}</label><input type={t} required value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={inp} /></div>",
  "            ))}",
  "            {error && <div style={{ fontSize:'11px', color:'#EF4444', padding:'7px 10px', background:'rgba(239,68,68,0.08)', borderRadius:'7px', border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}",
  "            <button type='submit' disabled={loading} style={{ padding:'11px', borderRadius:'9px', background:'linear-gradient(135deg,#22D3EE,#6366F1)', border:'none', color:'#fff', fontSize:'13px', fontWeight:700, cursor:loading?'wait':'pointer', opacity:loading?0.7:1, boxShadow:'0 4px 20px rgba(34,211,238,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', marginTop:'4px' }}>{loading?'Creating...':'Create Workspace'} {!loading&&<ArrowRight size={14}/>}</button>",
  "          </form>",
  "          <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(226,248,255,0.3)', marginTop:'16px', marginBottom:0 }}>Already have an account? <Link href='/login' style={{ color:'#22D3EE', fontWeight:600, textDecoration:'none' }}>Sign in</Link></p>",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
]));

console.log('\n  \u2705 Complete build done!\n');
console.log('  What was built:');
console.log('  \u2713 globals.css       - teal-navy theme + mobile CSS + animations');
console.log('  \u2713 app/page.tsx      - fixed z-index, no overlap, proper layers');
console.log('  \u2713 sidebar.tsx       - orbital logo, /access added');
console.log('  \u2713 mobile-nav.tsx    - bottom tab bar for mobile');
console.log('  \u2713 topbar.tsx        - teal glass');
console.log('  \u2713 dashboard/layout  - includes MobileNav');
console.log('  \u2713 dashboard/page    - stat cards, recent docs');
console.log('  \u2713 documents/page    - expand to preview chunks');
console.log('  \u2713 documents/[id]    - returns chunks for preview');
console.log('  \u2713 chat/page         - agent animation + print + mobile');
console.log('  \u2713 access/page       - RBAC team management (fixes 404)');
console.log('  \u2713 analytics/page    - charts + system status');
console.log('  \u2713 settings/page     - profile + security + AI config');
console.log('  \u2713 login/page        - teal glass form');
console.log('  \u2713 signup/page       - teal glass form');
console.log('\n  Run: rmdir /s /q .next && npm run dev');
console.log('  Open: http://localhost:3000\n');
