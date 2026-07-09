// PulsarIQ — Phase 5B: Premium Landing Page Overhaul
// Run from C:\pulsariq: node phase5b.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(filePath, content) {
  const full = path.join(root, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  \u2713', filePath);
}

console.log('\n  PulsarIQ \u2014 Phase 5B: Premium Landing Page\n');

write('app/page.tsx', String.raw`
'use client';
import { useEffect, useRef } from 'react';
import { ArrowRight, Shield, Database, MessageSquare, FileText, Users, Lock, Zap, BarChart2, Check } from 'lucide-react';

// ── Lorenz Attractor Constants ──────────────────────────────
const S = 10, R = 28, B = 8/3, DT = 0.005, TRAIL = 900;
const SEEDS = [{x:0.1,y:0,z:0},{x:0.12,y:0.02,z:0.1},{x:-0.1,y:0.01,z:0},{x:0.05,y:-0.05,z:0.2}];
const COLORS = [[99,102,241],[34,211,238],[168,85,247],[34,211,238]];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef   = useRef<{frame:number;pts:{x:number;y:number;z:number;trail:{px:number;py:number}[]}[]}>(
    { frame:0, pts: SEEDS.map(s => ({ ...s, trail:[] })) }
  );
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let angle = 0;

    const draw = () => {
      const d = dataRef.current;
      const W = canvas.width, H = canvas.height;
      const cx = W * 0.5, cy = H * 0.44;
      const scale = Math.min(W, H) / 52;
      d.frame++;
      angle += 0.0025;

      ctx.fillStyle = 'rgba(7,8,15,0.04)';
      ctx.fillRect(0, 0, W, H);

      d.pts.forEach((a, ai) => {
        const dx = S*(a.y-a.x), dy = a.x*(R-a.z)-a.y, dz = a.x*a.y-B*a.z;
        a.x += dx*DT; a.y += dy*DT; a.z += dz*DT;
        const rx = a.x*Math.cos(angle) - a.y*Math.sin(angle);
        const px = cx + scale*rx;
        const py = cy - scale*(a.z-25);
        a.trail.push({px,py});
        if (a.trail.length > TRAIL) a.trail.shift();
        const [r,g,b] = COLORS[ai];
        const len = a.trail.length;
        for (let i=2; i<len; i++) {
          const t = i/len;
          ctx.beginPath();
          ctx.moveTo(a.trail[i-1].px, a.trail[i-1].py);
          ctx.lineTo(a.trail[i].px, a.trail[i].py);
          ctx.strokeStyle = 'rgba('+r+','+g+','+b+','+(t*t*0.45).toFixed(3)+')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
        if (len > 0) {
          const last = a.trail[len-1];
          const grd = ctx.createRadialGradient(last.px,last.py,0,last.px,last.py,5);
          grd.addColorStop(0,'rgba('+r+','+g+','+b+',0.9)');
          grd.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
          ctx.beginPath(); ctx.arc(last.px,last.py,5,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
          ctx.beginPath(); ctx.arc(last.px,last.py,1.2,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.fill();
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const LOGOS = ['Microsoft','Salesforce','Atlassian','Oracle','SAP','Notion','Slack','HubSpot','Stripe','Twilio'];
  const FEATURES = [
    { icon:Database,     title:'RAG Pipeline',      desc:'Upload once, query forever. Exact source citations every time.',                    color:'#6366F1', span:2 },
    { icon:Lock,         title:'100% Private',       desc:'Self-hosted AI. Your documents never leave your servers.',                          color:'#A855F7', span:1 },
    { icon:Users,        title:'RBAC',               desc:'Admin, Manager, Viewer roles across unlimited organisations.',                      color:'#22D3EE', span:1 },
    { icon:FileText,     title:'Every Format',       desc:'PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML.',                                           color:'#F59E0B', span:1 },
    { icon:MessageSquare,title:'AI Chat',            desc:'Real-time streaming answers grounded in your documents.',                           color:'#EC4899', span:2 },
    { icon:BarChart2,    title:'Analytics',          desc:'Usage insights, query trends, document performance.',                               color:'#10B981', span:1 },
  ];
  const STEPS = [
    { n:'01', title:'Upload Your Documents', desc:'Drag and drop any file type. PDF, DOCX, Excel, PowerPoint, CSV — we handle all formats up to 50MB each.' },
    { n:'02', title:'AI Processes & Indexes', desc:'PulsarIQ automatically parses, chunks, and embeds your documents using vector AI. Status updates in real-time.' },
    { n:'03', title:'Ask Anything', desc:'Chat with your knowledge base. Get precise answers with exact source citations, page numbers, and confidence scores.' },
  ];
  const TESTIMONIALS = [
    { quote:'PulsarIQ transformed how our legal team processes 10,000+ documents. What took days now takes minutes with precise citations.', name:'Sarah Chen', role:'CTO, Meridian Legal', avatar:'SC' },
    { quote:'Finally an AI document platform that keeps our sensitive data on-premise. The RBAC system is exactly what enterprise needs.', name:'Marcus Webb', role:'VP Engineering, FinCore', avatar:'MW' },
    { quote:'The citation accuracy is remarkable. We can trust every AI answer because it traces back to the exact source document.', name:'Priya Nair', role:'Head of Innovation, Altara', avatar:'PN' },
  ];

  return (
    <div style={{ width:'100%', background:'#07080F', fontFamily:"'Inter','SF Pro Display',sans-serif", color:'#F1F5F9', overflowX:'hidden' }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(7,8,15,0.6) 100%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'200px', background:'linear-gradient(to bottom,transparent,#07080F)', pointerEvents:'none', zIndex:3 }} />

        {/* Nav */}
        <nav style={{ position:'relative', zIndex:10, height:'62px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px', backdropFilter:'blur(20px)', background:'rgba(7,8,15,0.5)', borderBottom:'1px solid rgba(99,102,241,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(99,102,241,0.5)' }}>
              <Zap size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'16px', letterSpacing:'-0.2px', lineHeight:1 }}>PulsarIQ</div>
              <div style={{ fontSize:'9px', color:'#64748B', letterSpacing:'1.2px' }}>ENTERPRISE AI</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'34px' }}>
            {['Features','How it Works','Pricing','Docs'].map(t => (
              <span key={t} style={{ fontSize:'13px', color:'#64748B', cursor:'pointer' }}>{t}</span>
            ))}
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <a href="/login"  style={{ padding:'8px 18px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#94A3B8', fontSize:'13px', textDecoration:'none' }}>Sign In</a>
            <a href="/signup" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 20px', borderRadius:'9px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', color:'#fff', fontSize:'13px', fontWeight:700, textDecoration:'none', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}>
              Get Started <ArrowRight size={14} />
            </a>
          </div>
        </nav>

        {/* Hero content — split layout */}
        <div style={{ position:'relative', zIndex:5, flex:1, display:'flex', alignItems:'center', padding:'0 48px', gap:'60px', maxWidth:'1200px', margin:'0 auto', width:'100%' }}>

          {/* Left: text */}
          <div style={{ flex:'0 0 520px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'5px 14px', borderRadius:'30px', border:'1px solid rgba(34,211,238,0.3)', background:'rgba(34,211,238,0.07)', marginBottom:'28px', fontSize:'11px', color:'#22D3EE', fontWeight:600, letterSpacing:'0.5px' }}>
              <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#22D3EE', boxShadow:'0 0 8px #22D3EE' }} />
              SELF-HOSTED ENTERPRISE AI
            </div>

            <h1 style={{ fontSize:'clamp(40px,4vw,64px)', fontWeight:800, lineHeight:1.05, margin:'0 0 20px', letterSpacing:'-2px' }}>
              Your enterprise<br />knowledge,{' '}
              <span style={{ background:'linear-gradient(90deg,#6366F1,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                finally intelligent.
              </span>
            </h1>

            <p style={{ fontSize:'17px', color:'#64748B', lineHeight:1.7, margin:'0 0 36px', maxWidth:'440px' }}>
              Upload any document. Ask any question. PulsarIQ finds the exact answer in your knowledge base — with precise citations, every time.
            </p>

            <div style={{ display:'flex', gap:'12px', marginBottom:'32px' }}>
              <a href="/signup" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'13px 28px', borderRadius:'12px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', color:'#fff', fontSize:'14px', fontWeight:700, textDecoration:'none', boxShadow:'0 8px 32px rgba(99,102,241,0.4)' }}>
                Start Free Trial <ArrowRight size={15} />
              </a>
              <a href="/dashboard" style={{ padding:'13px 24px', borderRadius:'12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#F1F5F9', fontSize:'14px', textDecoration:'none' }}>
                Open Dashboard
              </a>
            </div>

            <div style={{ display:'flex', gap:'20px' }}>
              {[{icon:Shield,label:'SOC2 Ready'},{icon:Database,label:'pgvector'},{icon:Lock,label:'On-Premise'}].map(({icon:Icon,label}) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#475569' }}>
                  <Icon size={12} color="#6366F1" />{label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div style={{ flex:1, position:'relative' }}>
            <div style={{ borderRadius:'16px', background:'rgba(13,15,28,0.9)', border:'1px solid rgba(99,102,241,0.2)', backdropFilter:'blur(24px)', overflow:'hidden', boxShadow:'0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)', transform:'perspective(1200px) rotateY(-6deg) rotateX(3deg)' }}>
              {/* Mockup topbar */}
              <div style={{ height:'44px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', borderBottom:'1px solid rgba(99,102,241,0.12)', background:'rgba(7,8,15,0.8)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:'24px', height:'24px', borderRadius:'7px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Zap size={12} color="#fff" />
                  </div>
                  <span style={{ fontSize:'12px', fontWeight:700 }}>PulsarIQ</span>
                </div>
                <div style={{ display:'flex', gap:'6px' }}>
                  {['#EF4444','#F59E0B','#22C55E'].map(c => <div key={c} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c }} />)}
                </div>
              </div>
              {/* Mockup body */}
              <div style={{ display:'flex', height:'340px' }}>
                {/* Sidebar */}
                <div style={{ width:'140px', borderRight:'1px solid rgba(99,102,241,0.1)', padding:'12px 8px', display:'flex', flexDirection:'column', gap:'3px' }}>
                  {[{icon:BarChart2,l:'Dashboard'},{icon:FileText,l:'Documents',a:true},{icon:MessageSquare,l:'AI Chat'},{icon:Shield,l:'Access'}].map(({icon:Icon,l,a}) => (
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'6px 8px', borderRadius:'6px', background:a ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                      <Icon size={11} color={a ? '#6366F1' : '#475569'} />
                      <span style={{ fontSize:'11px', color:a ? '#F1F5F9' : '#475569' }}>{l}</span>
                    </div>
                  ))}
                </div>
                {/* Main */}
                <div style={{ flex:1, padding:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {[{l:'Documents',v:'2,847'},{l:'AI Queries',v:'3,419'},{l:'Chunks',v:'1.2M'}].map(({l,v}) => (
                      <div key={l} style={{ flex:1, padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.1)' }}>
                        <div style={{ fontSize:'9px', color:'#475569', marginBottom:'4px' }}>{l}</div>
                        <div style={{ fontSize:'18px', fontWeight:800, color:'#F1F5F9' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderRadius:'8px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(99,102,241,0.08)', overflow:'hidden', flex:1 }}>
                    {[{n:'Q4 Financial Report.pdf',s:'Ready',t:'PDF'},{n:'Product Roadmap.pptx',s:'Embedding',t:'PPT'},{n:'Compliance Manual.docx',s:'Ready',t:'DOC'}].map((d,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderBottom:i<2 ? '1px solid rgba(99,102,241,0.06)' : 'none' }}>
                        <div style={{ fontSize:'8px', fontWeight:700, color:'#6366F1', width:'24px', height:'24px', borderRadius:'5px', background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>{d.t}</div>
                        <span style={{ flex:1, fontSize:'10px', color:'#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.n}</span>
                        <div style={{ fontSize:'9px', color:d.s==='Ready' ? '#22C55E' : '#6366F1', padding:'1px 6px', borderRadius:'10px', background:d.s==='Ready' ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)' }}>{d.s}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chat preview */}
                  <div style={{ padding:'8px 10px', borderRadius:'8px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)' }}>
                    <div style={{ fontSize:'9px', color:'#94A3B8', marginBottom:'4px' }}>"What was Q4 revenue growth?"</div>
                    <div style={{ fontSize:'9px', color:'#F1F5F9', lineHeight:1.4 }}>Q4 revenue reached $47.3M, a 23% YoY increase driven by enterprise subs. <span style={{ color:'#22D3EE' }}>[Q4 Report, p.12]</span></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow behind mockup */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'400px', height:'300px', background:'radial-gradient(ellipse, rgba(99,102,241,0.2), transparent)', pointerEvents:'none', zIndex:-1 }} />
          </div>
        </div>
      </div>

      {/* ── LOGO MARQUEE ──────────────────────────────────── */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'20px 0', overflow:'hidden', background:'rgba(255,255,255,0.01)' }}>
        <p style={{ textAlign:'center', fontSize:'11px', color:'#334155', letterSpacing:'2px', fontWeight:600, marginBottom:'16px' }}>TRUSTED BY LEADING ENTERPRISES</p>
        <div style={{ display:'flex', gap:'48px', animation:'marquee 20s linear infinite', whiteSpace:'nowrap' }}>
          {[...LOGOS,...LOGOS].map((l,i) => (
            <span key={i} style={{ fontSize:'14px', fontWeight:700, color:'#334155', letterSpacing:'1px', flexShrink:0 }}>{l}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }`}</style>
      </div>

      {/* ── BENTO FEATURES ────────────────────────────────── */}
      <div style={{ padding:'100px 48px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ marginBottom:'60px' }}>
          <p style={{ fontSize:'11px', color:'#6366F1', letterSpacing:'2.5px', fontWeight:700, marginBottom:'12px' }}>CAPABILITIES</p>
          <h2 style={{ fontSize:'clamp(32px,3.5vw,48px)', fontWeight:800, margin:'0 0 16px', letterSpacing:'-1.5px', maxWidth:'600px' }}>
            Everything your enterprise needs in one platform
          </h2>
          <p style={{ fontSize:'16px', color:'#64748B', maxWidth:'500px', lineHeight:1.65 }}>
            Built for the demands of modern enterprise — private, fast, and intelligent.
          </p>
        </div>

        {/* Bento grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
          {FEATURES.map(({ icon:Icon, title, desc, color, span }) => (
            <div key={title} style={{ gridColumn:'span ' + span, padding:'28px', borderRadius:'16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.1)', backdropFilter:'blur(16px)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'radial-gradient(circle,'+color+'12,transparent)', pointerEvents:'none' }} />
              <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:color+'14', border:'1px solid '+color+'22', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px' }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize:'16px', fontWeight:700, margin:'0 0 8px', letterSpacing:'-0.3px' }}>{title}</h3>
              <p style={{ fontSize:'13px', color:'#64748B', lineHeight:1.6, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <div style={{ padding:'80px 48px', background:'rgba(255,255,255,0.01)', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'60px' }}>
            <p style={{ fontSize:'11px', color:'#22D3EE', letterSpacing:'2.5px', fontWeight:700, marginBottom:'12px' }}>HOW IT WORKS</p>
            <h2 style={{ fontSize:'clamp(28px,3vw,42px)', fontWeight:800, margin:0, letterSpacing:'-1px' }}>Three steps to intelligence</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px' }}>
            {STEPS.map(({n,title,desc}) => (
              <div key={n} style={{ padding:'32px', borderRadius:'16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(99,102,241,0.1)', position:'relative' }}>
                <div style={{ fontSize:'48px', fontWeight:900, color:'rgba(99,102,241,0.12)', lineHeight:1, marginBottom:'16px', letterSpacing:'-2px' }}>{n}</div>
                <h3 style={{ fontSize:'16px', fontWeight:700, margin:'0 0 10px' }}>{title}</h3>
                <p style={{ fontSize:'13px', color:'#64748B', lineHeight:1.65, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────────────── */}
      <div style={{ padding:'80px 48px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'rgba(255,255,255,0.05)', borderRadius:'16px', overflow:'hidden' }}>
          {[{v:'99.9%',l:'Uptime SLA'},{v:'<200ms',l:'Search Speed'},{v:'7',l:'File Formats'},{v:'384D',l:'Vector Embeddings'}].map(({v,l}) => (
            <div key={l} style={{ padding:'32px 24px', background:'#07080F', textAlign:'center' }}>
              <div style={{ fontSize:'36px', fontWeight:900, background:'linear-gradient(135deg,#6366F1,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'-1px', marginBottom:'6px' }}>{v}</div>
              <div style={{ fontSize:'13px', color:'#475569' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <div style={{ padding:'80px 48px', background:'rgba(255,255,255,0.01)', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <p style={{ fontSize:'11px', color:'#6366F1', letterSpacing:'2.5px', fontWeight:700, marginBottom:'12px' }}>TESTIMONIALS</p>
            <h2 style={{ fontSize:'clamp(28px,3vw,40px)', fontWeight:800, margin:0, letterSpacing:'-1px' }}>Trusted by enterprise teams</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
            {TESTIMONIALS.map(({quote,name,role,avatar}) => (
              <div key={name} style={{ padding:'28px', borderRadius:'16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ display:'flex', gap:'4px', marginBottom:'16px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color:'#F59E0B', fontSize:'14px' }}>★</span>)}
                </div>
                <p style={{ fontSize:'14px', color:'#94A3B8', lineHeight:1.7, margin:'0 0 20px', fontStyle:'italic' }}>"{quote}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', flexShrink:0 }}>{avatar}</div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#F1F5F9' }}>{name}</div>
                    <div style={{ fontSize:'11px', color:'#64748B' }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ───────────────────────────────────────── */}
      <div style={{ padding:'80px 48px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <p style={{ fontSize:'11px', color:'#22D3EE', letterSpacing:'2.5px', fontWeight:700, marginBottom:'12px' }}>PRICING</p>
          <h2 style={{ fontSize:'clamp(28px,3vw,40px)', fontWeight:800, margin:0, letterSpacing:'-1px' }}>Simple, transparent pricing</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', alignItems:'start' }}>
          {[
            { tier:'Starter', price:'$49', period:'/month', features:['5 users','100 documents','5GB storage','AI Chat','Email support'], highlight:false },
            { tier:'Business', price:'$149', period:'/month', features:['25 users','1,000 documents','50GB storage','AI Chat + Analytics','Priority support','Custom RBAC'], highlight:true },
            { tier:'Enterprise', price:'Custom', period:'', features:['Unlimited users','Unlimited documents','Unlimited storage','Full feature suite','Dedicated support','On-premise deploy'], highlight:false },
          ].map(({tier,price,period,features,highlight}) => (
            <div key={tier} style={{ padding:'32px', borderRadius:'16px', background:highlight ? 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(34,211,238,0.08))' : 'rgba(255,255,255,0.02)', border:'1px solid ' + (highlight ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'), position:'relative' }}>
              {highlight && <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', padding:'3px 16px', borderRadius:'20px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', fontSize:'11px', fontWeight:700, color:'#fff' }}>MOST POPULAR</div>}
              <div style={{ fontSize:'14px', fontWeight:600, color:'#64748B', marginBottom:'8px' }}>{tier}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'24px' }}>
                <span style={{ fontSize:'40px', fontWeight:900, color:'#F1F5F9', letterSpacing:'-1px' }}>{price}</span>
                <span style={{ fontSize:'14px', color:'#64748B' }}>{period}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <Check size={14} color="#22C55E" />
                    <span style={{ fontSize:'13px', color:'#94A3B8' }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/signup" style={{ display:'block', textAlign:'center', padding:'11px', borderRadius:'10px', background:highlight ? 'linear-gradient(135deg,#6366F1,#22D3EE)' : 'rgba(255,255,255,0.06)', border:highlight ? 'none' : '1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:'14px', fontWeight:600, textDecoration:'none', boxShadow:highlight ? '0 4px 20px rgba(99,102,241,0.35)' : 'none' }}>
                {tier === 'Enterprise' ? 'Contact Us' : 'Start Free Trial'}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── COSMIC FOOTER CTA ─────────────────────────────── */}
      <div style={{ padding:'80px 48px 0', borderTop:'1px solid rgba(255,255,255,0.04)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'400px', background:'radial-gradient(ellipse, rgba(99,102,241,0.12), transparent)', pointerEvents:'none' }} />

        <div style={{ maxWidth:'800px', margin:'0 auto', textAlign:'center', position:'relative', zIndex:2, paddingBottom:'60px' }}>
          <p style={{ fontSize:'11px', color:'#6366F1', letterSpacing:'2.5px', fontWeight:700, marginBottom:'16px' }}>START TODAY</p>
          <h2 style={{ fontSize:'clamp(32px,4vw,52px)', fontWeight:800, margin:'0 0 16px', letterSpacing:'-1.5px', lineHeight:1.1 }}>
            Ready to make your knowledge<br />
            <span style={{ background:'linear-gradient(90deg,#6366F1,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>truly intelligent?</span>
          </h2>
          <p style={{ fontSize:'16px', color:'#64748B', margin:'0 0 36px', lineHeight:1.7 }}>
            Join the enterprises already using PulsarIQ to transform how their teams interact with documents.
          </p>
          <a href="/signup" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 36px', borderRadius:'12px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', color:'#fff', fontSize:'15px', fontWeight:700, textDecoration:'none', boxShadow:'0 8px 36px rgba(99,102,241,0.4)' }}>
            Start Free — No Credit Card <ArrowRight size={16} />
          </a>
        </div>

        {/* Cosmic "PULSARIQ" text */}
        <div style={{ position:'relative', overflow:'hidden', height:'160px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'100%', height:'2px', background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)', pointerEvents:'none' }} />
          <span style={{ fontSize:'clamp(80px,12vw,180px)', fontWeight:900, letterSpacing:'-4px', background:'linear-gradient(180deg,rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.03) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', userSelect:'none', whiteSpace:'nowrap' }}>
            PULSARIQ
          </span>
        </div>

        {/* Footer bar */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'24px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'24px', height:'24px', borderRadius:'7px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={12} color="#fff" />
            </div>
            <span style={{ fontWeight:700, fontSize:'14px' }}>PulsarIQ</span>
          </div>
          <span style={{ fontSize:'12px', color:'#334155' }}>2026 PulsarIQ · Enterprise AI Platform</span>
          <div style={{ display:'flex', gap:'20px' }}>
            {['Privacy','Terms','Security'].map(t => <span key={t} style={{ fontSize:'12px', color:'#334155', cursor:'pointer' }}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
`);

console.log('\n  \u2705 Phase 5B complete!\n');
console.log('  What was built:');
console.log('  \u2713 Lorenz attractor hero background');
console.log('  \u2713 Split hero layout with dashboard mockup');
console.log('  \u2713 Scrolling logo marquee (trust signals)');
console.log('  \u2713 Bento grid feature cards');
console.log('  \u2713 3-step how it works');
console.log('  \u2713 Stats bar');
console.log('  \u2713 Testimonials grid');
console.log('  \u2713 3-tier pricing table');
console.log('  \u2713 Cosmic PULSARIQ footer\n');
console.log('  Stop server \u2192 npm run dev \u2192 http://localhost:3000\n');
