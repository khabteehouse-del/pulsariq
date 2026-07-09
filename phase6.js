// PulsarIQ — Phase 6 Final
// Run: node phase6.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Phase 6 Final\n');

// Patch globals.css
const gPath = path.join(root, 'app', 'globals.css');
let gcss = fs.readFileSync(gPath, 'utf8');
if (!gcss.includes('crtDot')) {
  gcss += `
@keyframes crtDot    { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.4)} }
@keyframes wordIn    { from{opacity:0;filter:blur(10px);transform:translateY(6px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
@keyframes ringCW    { from{transform:rotateX(72deg) rotateZ(0deg)}   to{transform:rotateX(72deg) rotateZ(360deg)} }
@keyframes ringCCW   { from{transform:rotateX(55deg) rotateZ(0deg)}   to{transform:rotateX(55deg) rotateZ(-360deg)} }
@keyframes corePulse { 0%,100%{box-shadow:0 0 30px rgba(34,211,238,0.7),0 0 60px rgba(34,211,238,0.3)} 50%{box-shadow:0 0 50px rgba(34,211,238,0.9),0 0 100px rgba(34,211,238,0.5)} }
@keyframes scanLine  { 0%{top:0%} 100%{top:100%} }
@keyframes floatPanel{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes dataFade  { 0%{opacity:0;transform:translateY(3px)} 50%{opacity:1} 100%{opacity:0;transform:translateY(-3px)} }
@keyframes barGrow   { 0%,100%{height:20%} 50%{height:100%} }
@keyframes orbitA { from{transform:rotateX(68deg) rotateZ(0deg)}   to{transform:rotateX(68deg) rotateZ(360deg)} }
@keyframes orbitB { from{transform:rotateX(52deg) rotateZ(180deg)} to{transform:rotateX(52deg) rotateZ(540deg)} }
@keyframes orbitC { from{transform:rotateX(62deg) rotateZ(90deg)}  to{transform:rotateX(62deg) rotateZ(-270deg)} }
@keyframes orbitD { from{transform:rotateX(44deg) rotateZ(270deg)} to{transform:rotateX(44deg) rotateZ(-90deg)} }

/* Nav dropdown */
.nav-dropdown {
  position:absolute; top:calc(100% + 14px); left:-14px;
  background:rgba(4,14,28,0.97); border:1px solid rgba(34,211,238,0.16);
  border-radius:14px; padding:14px; backdrop-filter:blur(40px);
  box-shadow:0 20px 60px rgba(0,0,0,0.75),0 0 0 1px rgba(34,211,238,0.05);
  opacity:0; pointer-events:none; z-index:200;
  transform:translateY(-8px) scale(0.96);
  transition:opacity 0.22s cubic-bezier(0.34,1.56,0.64,1),
             transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
}
.nav-item:hover .nav-dropdown { opacity:1; pointer-events:all; transform:translateY(0) scale(1); }
.nav-item { position:relative; }
.dd-title { font-size:9px; font-weight:700; color:rgba(34,211,238,0.4); letter-spacing:1.5px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(34,211,238,0.07); }
.dd-item { display:flex; align-items:flex-start; gap:9px; padding:7px 9px; border-radius:9px; cursor:pointer; border:1px solid transparent; margin-bottom:3px; transition:background 0.15s ease,border-color 0.15s ease; }
.dd-item:hover { background:rgba(34,211,238,0.06); border-color:rgba(34,211,238,0.12); }
.dd-item:last-child { margin-bottom:0; }
.dd-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
.dd-label { font-size:12px; font-weight:600; color:#E2F8FF; margin-bottom:1px; }
.dd-desc  { font-size:10px; color:rgba(226,248,255,0.33); line-height:1.4; }
.dd-link  { display:flex; align-items:center; justify-content:space-between; padding:8px 9px; border-radius:8px; cursor:pointer; border:1px solid transparent; margin-bottom:2px; transition:background 0.15s ease,border-color 0.15s ease; }
.dd-link:hover { background:rgba(34,211,238,0.05); border-color:rgba(34,211,238,0.1); }
.dd-link span:first-child { font-size:12px; color:rgba(226,248,255,0.6); transition:color 0.15s; }
.dd-link:hover span:first-child { color:#E2F8FF; }
.dd-link span:last-child { font-size:10px; color:rgba(34,211,238,0.35); transition:color 0.15s; }
.dd-link:hover span:last-child { color:#22D3EE; }

/* Premium glass button */
.btn-glass {
  background:rgba(34,211,238,0.08); border:1px solid rgba(34,211,238,0.32);
  color:#E2F8FF; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif;
  transition:background 0.18s ease,border-color 0.18s ease,box-shadow 0.18s ease,transform 0.15s ease;
  display:flex; align-items:center; justify-content:center; gap:6px;
}
.btn-glass:hover:not(:disabled) {
  background:rgba(34,211,238,0.14); border-color:rgba(34,211,238,0.55);
  box-shadow:0 0 18px rgba(34,211,238,0.18),inset 0 0 20px rgba(34,211,238,0.05);
  transform:translateY(-1px);
}
.btn-glass:active:not(:disabled) { transform:scale(0.98); }
.btn-glass:disabled { opacity:0.45; cursor:wait; }
`;
  fs.writeFileSync(gPath, gcss, 'utf8');
  console.log('  \u2713 globals.css');
}

const L = [];
const p = s => L.push(s);

p("'use client';");
p("import { useEffect, useRef, useState, useCallback } from 'react';");
p("import { useRouter } from 'next/navigation';");
p("import { createClient } from '@/lib/supabase/client';");
p("import { ArrowRight } from 'lucide-react';");
p("");
p("// ── CRT Boot ─────────────────────────────────────────────────");
p("function CRTBoot({ onDone }: { onDone:()=>void }) {");
p("  const [step, setStep] = useState(0);");
p("  const grainRef = useRef<HTMLCanvasElement>(null);");
p("  const grainRaf = useRef<number>(0);");
p("  const cb = useCallback(onDone, []);");
p("  useEffect(() => {");
p("    const t1=setTimeout(()=>setStep(1),380);");
p("    const t2=setTimeout(()=>setStep(2),600);");
p("    const t3=setTimeout(()=>setStep(3),770);");
p("    const t4=setTimeout(()=>{ setStep(4); cb(); },1060);");
p("    return ()=>[t1,t2,t3,t4].forEach(clearTimeout);");
p("  }, [cb]);");
p("  useEffect(() => {");
p("    if (step!==2 && step!==3) return;");
p("    const c=grainRef.current; if(!c) return;");
p("    c.width=window.innerWidth; c.height=window.innerHeight;");
p("    const ctx=c.getContext('2d'); if(!ctx) return;");
p("    let live=true;");
p("    const tick=()=>{ if(!live) return;");
p("      const id=ctx.createImageData(c.width,c.height);");
p("      for(let i=0;i<id.data.length;i+=4){");
p("        const v=Math.random()>0.45?Math.floor(Math.random()*240):0;");
p("        id.data[i]=v; id.data[i+1]=v; id.data[i+2]=v; id.data[i+3]=Math.floor(Math.random()*155);");
p("      }");
p("      ctx.putImageData(id,0,0); grainRaf.current=requestAnimationFrame(tick);");
p("    };");
p("    tick();");
p("    return ()=>{ live=false; cancelAnimationFrame(grainRaf.current); };");
p("  }, [step]);");
p("  if (step===4) return null;");
p("  const isDot=step===0, isScan=step===1, isBlast=step===2, isFade=step===3;");
p("  return (");
p("    <div style={{ position:'fixed',inset:0,zIndex:1000,pointerEvents:isFade?'none':'all',");
p("      background:isBlast?'rgba(255,255,255,0.88)':isFade?'transparent':'#030B14',");
p("      transition:isBlast?'background 55ms':isFade?'background 290ms':'none' }}>");
p("      {!isFade&&(");
p("        <div style={{ position:'absolute',left:'50%',top:'50%',");
p("          borderRadius:isDot?'50%':'0',");
p("          width:isDot?'10px':'100vw',");
p("          height:isDot?'10px':isScan?'2px':'100vh',");
p("          background:isBlast?'linear-gradient(180deg,rgba(34,211,238,0.25),white,rgba(34,211,238,0.25))':isDot?'radial-gradient(circle,#fff,#22D3EE,transparent)':'linear-gradient(90deg,transparent,rgba(34,211,238,0.55),#22D3EE,rgba(34,211,238,0.55),transparent)',");
p("          boxShadow:isDot?'0 0 22px #22D3EE,0 0 55px rgba(34,211,238,0.6)':isScan?'0 0 14px rgba(34,211,238,0.8)':'none',");
p("          animation:isDot?'crtDot 0.38s ease-in-out infinite':'none',");
p("          transition:isScan?'width 215ms cubic-bezier(0.4,0,0.2,1),height 215ms,border-radius 215ms':isBlast?'height 155ms cubic-bezier(0.4,0,1,1)':'none' }} />)}");
p("      {isBlast&&(<div style={{ position:'absolute',inset:0,pointerEvents:'none' }}>");
p("        <div style={{ position:'absolute',inset:0,background:'rgba(255,0,60,0.14)',mixBlendMode:'multiply' as const,transform:'translateX(-5px)' }} />");
p("        <div style={{ position:'absolute',inset:0,background:'rgba(0,255,220,0.14)',mixBlendMode:'multiply' as const,transform:'translateX(5px)' }} />");
p("      </div>)}");
p("      {(isBlast||isFade)&&(<canvas ref={grainRef} style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:isFade?0:0.42,transition:isFade?'opacity 290ms':'none',mixBlendMode:'screen' as const,pointerEvents:'none' }} />)}");
p("    </div>");
p("  );");
p("}");
p("");
p("// ── Lorenz ───────────────────────────────────────────────────");
p("const LS=10,LR=28,LB=8/3,LDT=0.005,LTR=900;");
p("const LSEED=[{x:0.1,y:0,z:0},{x:0.12,y:0.02,z:0.1},{x:-0.1,y:0.01,z:0}];");
p("const LCOL=['34,211,238','99,102,241','34,211,238'];");
p("const BARS=[35,62,44,80,52,90,68,84,58,95,72,88,63,100];");
p("");
p("// ── Page ─────────────────────────────────────────────────────");
p("export default function LandingPage() {");
p("  const cvs  = useRef<HTMLCanvasElement>(null);");
p("  const raf  = useRef<number>(0);");
p("  const fr   = useRef(0);");
p("  const pts  = useRef(LSEED.map(s=>({...s,trail:[] as {px:number;py:number}[]})));");
p("  const [email,    setEmail]    = useState('');");
p("  const [password, setPassword] = useState('');");
p("  const [error,    setError]    = useState('');");
p("  const [loading,  setLoading]  = useState(false);");
p("  const [bootDone, setBootDone] = useState(false);");
p("  const [words,    setWords]    = useState(0);");
p("  const [showSub,  setShowSub]  = useState(false);");
p("  const [showBar,  setShowBar]  = useState(false);");
p("  const router=useRouter(), supabase=createClient();");
p("");
p("  useEffect(()=>{");
p("    if(!bootDone) return;");
p("    [0,140,270,390,510].forEach((d,i)=>setTimeout(()=>setWords(i+1),d));");
p("    setTimeout(()=>setShowSub(true),730); setTimeout(()=>setShowBar(true),970);");
p("  },[bootDone]);");
p("");
p("  useEffect(()=>{");
p("    const c=cvs.current; if(!c) return;");
p("    const rsz=()=>{ c.width=c.offsetWidth; c.height=c.offsetHeight; };");
p("    rsz(); window.addEventListener('resize',rsz);");
p("    const ctx=c.getContext('2d'); if(!ctx) return;");
p("    let ang=0;");
p("    const draw=()=>{");
p("      fr.current++; ang+=0.0018;");
p("      const f=fr.current,W=c.width,H=c.height,cx=W*0.5,cy=H*0.52;");
p("      const sc=Math.min(W,H)/56, pulse=(Math.sin(f*0.03)+1)/2;");
p("      ctx.clearRect(0,0,W,H);");
p("      const bg=ctx.createRadialGradient(cx,H*0.55,0,cx,H*0.55,Math.max(W,H));");
p("      bg.addColorStop(0,'#061422'); bg.addColorStop(0.5,'#030B14'); bg.addColorStop(1,'#020810');");
p("      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);");
p("      // Grid");
p("      const vy=H*0.62; ctx.globalAlpha=0.1;");
p("      for(let i=0;i<=20;i++){const y=vy+(H-vy)*(i/20);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.strokeStyle='#0D4F6E';ctx.lineWidth=0.5;ctx.stroke();}");
p("      for(let i=-18;i<=18;i++){const bx=cx+i*(W/22);ctx.beginPath();ctx.moveTo(cx,vy);ctx.lineTo(bx,H);ctx.strokeStyle='#0D4F6E';ctx.lineWidth=0.5;ctx.stroke();}");
p("      ctx.globalAlpha=1;");
p("      // Ground glow");
p("      const gg=ctx.createRadialGradient(cx,H*0.74,0,cx,H*0.74,W*0.35);");
p("      gg.addColorStop(0,'rgba(34,211,238,'+(0.06+pulse*0.03)+')'); gg.addColorStop(1,'transparent');");
p("      ctx.fillStyle=gg; ctx.fillRect(0,0,W,H);");
p("      // Lorenz (subtle)");
p("      pts.current.forEach((a,ai)=>{");
p("        const dx=LS*(a.y-a.x),dy=a.x*(LR-a.z)-a.y,dz=a.x*a.y-LB*a.z;");
p("        a.x+=dx*LDT; a.y+=dy*LDT; a.z+=dz*LDT;");
p("        const rx=a.x*Math.cos(ang)-a.y*Math.sin(ang);");
p("        const px=cx+sc*rx, py=cy-sc*(a.z-25);");
p("        a.trail.push({px,py}); if(a.trail.length>LTR) a.trail.shift();");
p("        const [r,g,b]=LCOL[ai].split(','), len=a.trail.length;");
p("        for(let i=2;i<len;i++){");
p("          const t=i/len;");
p("          ctx.beginPath(); ctx.moveTo(a.trail[i-1].px,a.trail[i-1].py); ctx.lineTo(a.trail[i].px,a.trail[i].py);");
p("          ctx.strokeStyle='rgba('+r+','+g+','+b+','+(t*t*0.18).toFixed(3)+')'; ctx.lineWidth=0.5; ctx.stroke();");
p("        }");
p("      });");
p("      // Core glow");
p("      [180,110,65,32].forEach((rr,i)=>{");
p("        const op=[0.04,0.08,0.16,0.42][i]+pulse*[0.02,0.03,0.05,0.1][i];");
p("        const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,rr);");
p("        cg.addColorStop(0,'rgba(34,211,238,'+op+')'); cg.addColorStop(1,'transparent');");
p("        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill();");
p("      });");
p("      // Reactor rings");
p("      const ra=f*0.014;");
p("      [58,46,34,22,13].forEach((rr,i)=>{");
p("        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);");
p("        const op=0.5+pulse*0.28-i*0.07;");
p("        ctx.strokeStyle=i===0?'rgba(245,158,11,'+op+')':'rgba(34,211,238,'+op+')';");
p("        ctx.lineWidth=i===0?2.5:0.8; ctx.stroke();");
p("      });");
p("      for(let j=0;j<8;j++){const ss=ra+j*(Math.PI/4); ctx.beginPath(); ctx.arc(cx,cy,58,ss,ss+0.24); ctx.strokeStyle='rgba(245,158,11,0.88)'; ctx.lineWidth=3; ctx.stroke();}");
p("      // Core dot");
p("      const ic=ctx.createRadialGradient(cx,cy,0,cx,cy,10+pulse*4);");
p("      ic.addColorStop(0,'#fff'); ic.addColorStop(0.35,'#A5F3FC'); ic.addColorStop(1,'transparent');");
p("      ctx.beginPath(); ctx.arc(cx,cy,10+pulse*4,0,Math.PI*2); ctx.fillStyle=ic; ctx.fill();");
p("      // Beam lines");
p("      [-0.52,-0.22,0.22,0.52].forEach(a=>{");
p("        const bx=cx+Math.sin(a)*W*0.3, by=H*0.44-Math.abs(a)*48;");
p("        const bl=ctx.createLinearGradient(cx,cy,bx,by);");
p("        bl.addColorStop(0,'rgba(34,211,238,'+(0.28+pulse*0.18)+')'); bl.addColorStop(1,'transparent');");
p("        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(bx,by); ctx.strokeStyle=bl; ctx.lineWidth=0.7; ctx.stroke();");
p("      });");
p("      raf.current=requestAnimationFrame(draw);");
p("    };");
p("    draw();");
p("    return()=>{ cancelAnimationFrame(raf.current); window.removeEventListener('resize',rsz); };");
p("  },[]);");
p("");
p("  const handleLogin=async(e:React.FormEvent)=>{");
p("    e.preventDefault(); setLoading(true); setError('');");
p("    const {error:err}=await supabase.auth.signInWithPassword({email,password});");
p("    if(err){setError(err.message);setLoading(false);}else router.push('/dashboard');");
p("  };");
p("");
p("  const WORDS=['Your','knowledge,','pulsing','with','intelligence.'];");
p("");
p("  const PANELS=[");
p("    { orbit:'orbitA', dur:'12s', radius:230, tilt:-68, fd:'4.2s', fd2:'0s', col:'#22D3EE',");
p("      title:'AI Assistant', sub:'Processing Knowledge',");
p("      rows:[{t:'u',m:'What was Q4 revenue growth?'},{t:'a',m:'Revenue reached $47.3M, up 23% YoY. Primary driver: enterprise subs +34%.'},{t:'c',m:'[Q4 Financial Report.pdf · p.12]'}]},");
p("    { orbit:'orbitB', dur:'9s',  radius:200, tilt:-52, fd:'5s',   fd2:'0.8s', col:'#6366F1',");
p("      title:'Document Intelligence', sub:'Ingestion Pipeline',");
p("      rows:[{t:'s',m:'PDF Parsed'},{t:'s',m:'Chunks: 847'},{t:'s',m:'Embedded: 384D'},{t:'s',m:'pgvector: READY'},{t:'b',m:'1,247,384 vectors'}]},");
p("    { orbit:'orbitC', dur:'14s', radius:240, tilt:-62, fd:'4.6s', fd2:'1.4s', col:'#22D3EE',");
p("      title:'Vector Analytics', sub:'1.2M Chunks Indexed',");
p("      rows:[{t:'chart',m:''},{t:'kv',m:'Latency|187ms'},{t:'kv',m:'Accuracy|94.2%'},{t:'kv',m:'Queries|3,419'}]},");
p("    { orbit:'orbitD', dur:'10s', radius:190, tilt:-44, fd:'3.8s', fd2:'2s', col:'#F59E0B',");
p("      title:'Data Citations', sub:'Source Verified',");
p("      rows:[{t:'d',m:'Q4 Financial Report.pdf'},{t:'d',m:'Compliance Manual v2.docx'},{t:'d',m:'Board Meeting Notes.pdf'},{t:'note',m:'Authenticity & traceability enforced'}]},");
p("  ];");
p("");
p("  return(");
p("    <div style={{width:'100%',height:'100vh',overflow:'hidden',background:'#030B14',fontFamily:\"'Inter',sans-serif\",color:'#E2F8FF',position:'relative'}}>");
p("      <CRTBoot onDone={()=>setBootDone(true)} />");
p("      <canvas ref={cvs} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0}} />");
p("");
p("      {/* PULSARIQ — z:1 lowest layer */}");
p("      <div style={{position:'absolute',bottom:'-8px',left:0,right:0,zIndex:1,overflow:'hidden',height:'78px',display:'flex',alignItems:'flex-end',justifyContent:'center',pointerEvents:'none'}}>");
p("        <span style={{fontSize:'clamp(54px,8vw,130px)',fontWeight:900,letterSpacing:'-3px',color:'rgba(34,211,238,0.04)',userSelect:'none',whiteSpace:'nowrap',lineHeight:1}}>PULSARIQ</span>");
p("      </div>");
p("");
p("      {/* Gradient overlays */}");
p("      <div style={{position:'absolute',top:0,left:0,right:0,height:'48%',background:'linear-gradient(to bottom,rgba(3,11,20,0.94) 0%,rgba(3,11,20,0.5) 55%,transparent 100%)',zIndex:2,pointerEvents:'none'}} />");
p("      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'34%',background:'linear-gradient(to top,rgba(3,11,20,0.98) 0%,rgba(3,11,20,0.65) 55%,transparent 100%)',zIndex:2,pointerEvents:'none'}} />");
p("");
p("      {/* 3D Orbital scene — z:3 */}");
p("      <div style={{position:'absolute',inset:0,zIndex:3,perspective:'1100px',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>");
p("        <div style={{position:'relative',width:0,height:0,transformStyle:'preserve-3d',marginTop:'30px'}}>");
p("          {[{s:480,a:'ringCW',d:'20s'},{s:380,a:'ringCCW',d:'14s'}].map((r,i)=>(");
p("            <div key={i} style={{position:'absolute',width:r.s+'px',height:r.s+'px',marginLeft:-(r.s/2)+'px',marginTop:-(r.s/2)+'px',border:'1px solid rgba(34,211,238,0.06)',borderRadius:'50%',animation:r.a+' '+r.d+' linear infinite'}} />))}");
p("          <div style={{position:'absolute',width:'20px',height:'20px',marginLeft:'-10px',marginTop:'-10px',borderRadius:'50%',background:'radial-gradient(circle,#fff 0%,#A5F3FC 35%,rgba(34,211,238,0.1) 100%)',animation:'corePulse 2s ease-in-out infinite'}} />");
p("          {PANELS.map((panel,pi)=>(");
p("            <div key={pi} style={{position:'absolute',animation:panel.orbit+' '+panel.dur+' linear infinite',transformOrigin:'0 0'}}>");
p("              <div style={{position:'absolute',left:panel.radius+'px',marginTop:'-96px',transform:'rotateX('+panel.tilt+'deg)',animation:'floatPanel '+panel.fd+' ease-in-out '+panel.fd2+' infinite'}}>");
p("                <div style={{width:'170px',padding:'12px',borderRadius:'12px',background:'rgba(4,14,28,0.93)',border:'1px solid '+panel.col+'26',backdropFilter:'blur(24px)',boxShadow:'0 0 26px '+panel.col+'12,0 18px 46px rgba(0,0,0,0.55)',position:'relative',overflow:'hidden'}}>");
p("                  <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'7px'}}>");
p("                    <div style={{width:'5px',height:'5px',borderRadius:'50%',background:panel.col,boxShadow:'0 0 5px '+panel.col,animation:'glowPulse 2s ease-in-out '+(pi*0.4)+'s infinite',flexShrink:0}} />");
p("                    <span style={{fontSize:'9px',fontWeight:700,color:panel.col,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{panel.title}</span>");
p("                  </div>");
p("                  <div style={{fontSize:'8px',color:'rgba(226,248,255,0.28)',marginBottom:'7px'}}>{panel.sub}</div>");
p("                  {panel.rows.map((row,ri)=>{");
p("                    if(row.t==='u') return(<div key={ri} style={{display:'flex',justifyContent:'flex-end',marginBottom:'4px'}}><div style={{maxWidth:'82%',padding:'3px 6px',borderRadius:'6px 6px 2px 6px',background:'rgba(34,211,238,0.1)',border:'1px solid rgba(34,211,238,0.18)',fontSize:'8px',color:'#E2F8FF',lineHeight:1.4}}>{row.m}</div></div>);");
p("                    if(row.t==='a') return(<div key={ri} style={{display:'flex',justifyContent:'flex-start',marginBottom:'4px'}}><div style={{maxWidth:'90%',padding:'3px 6px',borderRadius:'2px 6px 6px 6px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)',fontSize:'8px',color:'rgba(226,248,255,0.72)',lineHeight:1.4}}>{row.m}</div></div>);");
p("                    if(row.t==='c') return(<div key={ri} style={{fontSize:'7px',color:'#22D3EE',padding:'2px 5px',borderRadius:'5px',background:'rgba(34,211,238,0.07)',border:'1px solid rgba(34,211,238,0.14)',display:'inline-block'}}>{row.m}</div>);");
p("                    if(row.t==='s') return(<div key={ri} style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'3px',animation:'dataFade 3s ease-in-out '+(ri*0.5)+'s infinite'}}><div style={{width:'3px',height:'3px',borderRadius:'50%',background:'#6366F1',flexShrink:0}}/><span style={{fontSize:'8px',color:'rgba(226,248,255,0.52)'}}>{row.m}</span></div>);");
p("                    if(row.t==='b') return(<div key={ri} style={{marginTop:'5px',padding:'4px 6px',borderRadius:'6px',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.16)'}}><div style={{fontSize:'11px',fontWeight:800,color:'#6366F1'}}>{row.m}</div></div>);");
p("                    if(row.t==='chart') return(<div key={ri} style={{display:'flex',alignItems:'flex-end',gap:'2px',height:'40px',marginBottom:'6px'}}>{BARS.map((h,bi)=>(<div key={bi} style={{flex:1,background:'linear-gradient(to top,rgba(34,211,238,0.5) 0%,rgba(34,211,238,0.06) 70%,transparent 100%)',borderRadius:'2px 2px 0 0',height:h+'%',minWidth:'4px',border:'1px solid rgba(34,211,238,0.1)',borderBottom:'none',backdropFilter:'blur(2px)',animation:'barGrow '+(2+bi*0.13)+'s ease-in-out '+(bi*0.07)+'s infinite'}}/>))}</div>);");
p("                    if(row.t==='kv'){const[k,v]=row.m.split('|');return(<div key={ri} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px',padding:'2px 0',borderBottom:'1px solid rgba(34,211,238,0.05)'}}><span style={{fontSize:'8px',color:'rgba(226,248,255,0.32)'}}>{k}</span><span style={{fontSize:'9px',fontWeight:700,color:'#22D3EE'}}>{v}</span></div>);}");
p("                    if(row.t==='d') return(<div key={ri} style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'3px',padding:'3px 5px',borderRadius:'5px',background:'rgba(245,158,11,0.05)',border:'1px solid rgba(245,158,11,0.1)'}}><div style={{width:'3px',height:'3px',borderRadius:'50%',background:'#F59E0B',flexShrink:0}}/><span style={{fontSize:'8px',color:'rgba(226,248,255,0.48)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.m}</span></div>);");
p("                    if(row.t==='note') return(<div key={ri} style={{marginTop:'5px',fontSize:'8px',color:'rgba(226,248,255,0.3)',lineHeight:1.4}}>{row.m}</div>);");
p("                    return null;");
p("                  })}");
p("                  <div style={{position:'absolute',left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,'+panel.col+'40,transparent)',animation:'scanLine 2.8s linear '+(pi*0.7)+'s infinite',top:0}} />");
p("                </div>");
p("              </div>");
p("            </div>))}");
p("        </div>");
p("      </div>");
p("");
p("      {/* Nav — z:20 */}");
p("      <nav style={{position:'absolute',top:0,left:0,right:0,zIndex:20,height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px'}}>");
p("        <div style={{display:'flex',alignItems:'center',gap:'9px'}}>");
p("          <div style={{width:'28px',height:'28px',position:'relative',flexShrink:0}}>");
p("            <div style={{position:'absolute',inset:0,border:'1.5px solid #22D3EE',borderRadius:'50%',boxShadow:'0 0 10px rgba(34,211,238,0.5)',animation:'glowPulse 2.5s ease-in-out infinite'}} />");
p("            <div style={{position:'absolute',inset:'5px',border:'1px solid rgba(99,102,241,0.5)',borderRadius:'50%'}} />");
p("            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'7px',height:'7px',borderRadius:'50%',background:'radial-gradient(circle,#fff,#22D3EE)',boxShadow:'0 0 6px #22D3EE'}} />");
p("          </div>");
p("          <span style={{fontWeight:800,fontSize:'16px',background:'linear-gradient(90deg,#E2F8FF,#22D3EE)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>PulsarIQ</span>");
p("        </div>");
p("        <div style={{display:'flex',gap:'28px',alignItems:'center'}}>");
p("          {/* Features dropdown */}");
p("          <div className='nav-item'>");
p("            <span className='nav-link' style={{cursor:'pointer'}}>Features</span>");
p("            <div className='nav-dropdown' style={{width:'268px'}}>");
p("              <div className='dd-title'>CAPABILITIES</div>");
p("              {[");
p("                {icon:'⚡',ic:'rgba(34,211,238,0.1)',ic2:'#22D3EE',l:'RAG Pipeline',d:'Upload once, query forever with exact citations'},");
p("                {icon:'🔒',ic:'rgba(168,85,247,0.1)',ic2:'#A855F7',l:'100% Private AI',d:'Self-hosted via Ollama, zero data exposure'},");
p("                {icon:'👥',ic:'rgba(245,158,11,0.1)',ic2:'#F59E0B',l:'Enterprise RBAC',d:'Admin, Manager, Viewer roles at scale'},");
p("                {icon:'🗂️',ic:'rgba(34,197,94,0.1)',ic2:'#22C55E',l:'Every Format',d:'PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML'},");
p("              ].map(f=>(");
p("                <div key={f.l} className='dd-item'>");
p("                  <div className='dd-icon' style={{background:f.ic,color:f.ic2}}>{f.icon}</div>");
p("                  <div><div className='dd-label'>{f.l}</div><div className='dd-desc'>{f.d}</div></div>");
p("                </div>))}");
p("            </div>");
p("          </div>");
p("          {/* Docs dropdown */}");
p("          <div className='nav-item'>");
p("            <span className='nav-link' style={{cursor:'pointer'}}>Docs</span>");
p("            <div className='nav-dropdown' style={{width:'220px'}}>");
p("              <div className='dd-title'>DOCUMENTATION</div>");
p("              {['Getting Started','Upload Guide','API Reference','Vector Search','RBAC Setup','Deployment Guide'].map(doc=>(");
p("                <div key={doc} className='dd-link'><span>{doc}</span><span>→</span></div>))}");
p("            </div>");
p("          </div>");
p("          <a href='/signup' style={{color:'#22D3EE',fontSize:'13px',fontWeight:600,textDecoration:'none',transition:'opacity 0.15s ease'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity='0.75'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity='1'}>Create workspace</a>");
p("        </div>");
p("      </nav>");
p("");
p("      {/* Headline — z:10 */}");
p("      <div style={{position:'absolute',top:'68px',left:0,right:0,zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 20px',pointerEvents:'none'}}>");
p("        <h1 style={{fontSize:'clamp(30px,4.2vw,60px)',fontWeight:900,lineHeight:1.08,letterSpacing:'-2px',textAlign:'center',margin:'0 0 10px',display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'0.25em'}}>");
p("          {WORDS.map((w,i)=>(");
p("            <span key={w} style={{display:'inline-block',opacity:words>i?1:0,filter:words>i?'blur(0)':'blur(10px)',transform:words>i?'translateY(0)':'translateY(8px)',transition:'opacity 0.32s ease,filter 0.32s ease,transform 0.32s ease',background:i>=3?'linear-gradient(90deg,#22D3EE,#6366F1)':'none',WebkitBackgroundClip:i>=3?'text':'unset',WebkitTextFillColor:i>=3?'transparent':'unset',color:i>=3?'transparent':'#E2F8FF'}}>{ w}</span>))}");
p("        </h1>");
p("        <p style={{fontSize:'14px',color:'rgba(226,248,255,0.38)',textAlign:'center',margin:0,lineHeight:1.6,maxWidth:'420px',opacity:showSub?1:0,transform:showSub?'translateY(0)':'translateY(8px)',transition:'opacity 0.4s ease,transform 0.4s ease',pointerEvents:'none'}}>Upload any document. Ask any question. Precise answers with exact citations.</p>");
p("      </div>");
p("");
p("      {/* Login bar — z:12 */}");
p("      <div style={{position:'absolute',bottom:'82px',left:0,right:0,zIndex:12,display:'flex',justifyContent:'center',padding:'0 20px',opacity:showBar?1:0,transform:showBar?'translateY(0)':'translateY(16px)',transition:'opacity 0.45s ease,transform 0.45s ease'}}>");
p("        <div style={{width:'100%',maxWidth:'600px'}}>");
p("          {error&&<div style={{textAlign:'center',fontSize:'11px',color:'#EF4444',marginBottom:'7px',padding:'5px 12px',background:'rgba(239,68,68,0.08)',borderRadius:'8px',border:'1px solid rgba(239,68,68,0.2)'}}>{error}</div>}");
p("          <form onSubmit={handleLogin} style={{display:'flex',alignItems:'center',padding:'5px 6px',borderRadius:'13px',background:'rgba(4,14,28,0.94)',border:'1px solid rgba(34,211,238,0.18)',backdropFilter:'blur(40px)',boxShadow:'0 8px 40px rgba(0,0,0,0.65)'}}>");
p("            <input type='email' required value={email} onChange={e=>setEmail(e.target.value)} placeholder='Work email' className='inp-field' style={{flex:1,border:'none',background:'transparent',boxSizing:'border-box' as const,minWidth:0}} />");
p("            <div style={{width:'1px',height:'22px',background:'rgba(34,211,238,0.12)',flexShrink:0}} />");
p("            <input type='password' required value={password} onChange={e=>setPassword(e.target.value)} placeholder='Password' className='inp-field' style={{flex:'0 0 148px',border:'none',background:'transparent',boxSizing:'border-box' as const,minWidth:0}} />");
p("            <button type='submit' disabled={loading} className='btn-glass' style={{flexShrink:0,padding:'9px 20px',borderRadius:'9px',fontSize:'13px',boxShadow:'none',whiteSpace:'nowrap'}}>{loading?'Signing in...':'Sign In'} {!loading&&<ArrowRight size={13}/>}</button>");
p("            <div style={{width:'1px',height:'22px',background:'rgba(34,211,238,0.08)',flexShrink:0,margin:'0 2px'}} />");
p("            <a href='/signup' style={{flexShrink:0,padding:'9px 12px',color:'rgba(34,211,238,0.6)',fontSize:'12px',fontWeight:600,textDecoration:'none',whiteSpace:'nowrap',transition:'color 0.15s ease'}} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#22D3EE'} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(34,211,238,0.6)'}>Create workspace</a>");
p("          </form>");
p("          <p style={{textAlign:'center',fontSize:'10px',color:'rgba(226,248,255,0.16)',marginTop:'7px'}}>Self-hosted &#183; Zero data exposure &#183; Enterprise RBAC</p>");
p("        </div>");
p("      </div>");
p("    </div>");
p("  );");
p("}");

write('app/page.tsx', L.join('\n'));
console.log('\n  \u2705 Phase 6 Final done!');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
