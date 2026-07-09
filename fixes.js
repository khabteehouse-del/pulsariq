// PulsarIQ — fixes.js
// docs.map fix, bg particles, analytics improvements, stat cards, logo particles, chat agent
// Run: node fixes.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Fixes\n');

// Patch globals.css
const gPath = path.join(root, 'app', 'globals.css');
let gcss = fs.readFileSync(gPath, 'utf8');
if (!gcss.includes('particleDrift')) {
  gcss += `
@keyframes particleDrift { 0%{transform:translateY(0) translateX(0)} 33%{transform:translateY(-18px) translateX(8px)} 66%{transform:translateY(-8px) translateX(-10px)} 100%{transform:translateY(0) translateX(0)} }
@keyframes orbitLogo { from{transform:rotate(0deg) translateX(var(--r)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--r)) rotate(-360deg)} }
@keyframes countUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes agentStep { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
@keyframes radarPing { 0%{transform:scale(0.3);opacity:0.9} 100%{transform:scale(2.4);opacity:0} }
@keyframes progressFill { from{width:0%} to{width:var(--progress,60%)} }
`;
  fs.writeFileSync(gPath, gcss, 'utf8');
  console.log('  \u2713 globals.css');
}

// ── 1. BG PARTICLES COMPONENT ────────────────────────────────
write('components/ui/bg-particles.tsx', [
  "'use client';",
  "import { useEffect, useRef } from 'react';",
  "",
  "export default function BgParticles() {",
  "  const ref = useRef<HTMLCanvasElement>(null);",
  "  const raf = useRef<number>(0);",
  "  useEffect(() => {",
  "    const c = ref.current; if (!c) return;",
  "    const rsz = () => { c.width=c.offsetWidth; c.height=c.offsetHeight; };",
  "    rsz(); window.addEventListener('resize', rsz);",
  "    const ctx = c.getContext('2d'); if (!ctx) return;",
  "    const pts = Array.from({length:55}, () => ({",
  "      x: Math.random(), y: Math.random(),",
  "      vx: (Math.random()-0.5)*0.00012, vy: (Math.random()-0.5)*0.00012,",
  "      r: Math.random()*1.2+0.2, op: Math.random()*0.25+0.05,",
  "      phase: Math.random()*Math.PI*2, speed: Math.random()*0.008+0.004,",
  "      col: Math.random()>0.5 ? '34,211,238' : '99,102,241',",
  "    }));",
  "    let frame = 0;",
  "    const draw = () => {",
  "      frame++; const W=c.width, H=c.height;",
  "      ctx.clearRect(0,0,W,H);",
  "      pts.forEach(p => {",
  "        p.x += p.vx; p.y += p.vy; p.phase += p.speed;",
  "        if(p.x<0) p.x=1; if(p.x>1) p.x=0;",
  "        if(p.y<0) p.y=1; if(p.y>1) p.y=0;",
  "        const pulse = (Math.sin(p.phase)+1)/2;",
  "        const op = p.op * (0.6 + pulse*0.4);",
  "        ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);",
  "        ctx.fillStyle = 'rgba('+p.col+','+op.toFixed(2)+')'; ctx.fill();",
  "      });",
  "      // Faint connection lines",
  "      for(let i=0;i<pts.length;i++){",
  "        for(let j=i+1;j<pts.length;j++){",
  "          const dx=(pts[i].x-pts[j].x)*W, dy=(pts[i].y-pts[j].y)*H;",
  "          const dist=Math.sqrt(dx*dx+dy*dy);",
  "          if(dist<90){",
  "            const op=(1-dist/90)*0.06;",
  "            ctx.beginPath(); ctx.moveTo(pts[i].x*W,pts[i].y*H); ctx.lineTo(pts[j].x*W,pts[j].y*H);",
  "            ctx.strokeStyle='rgba(34,211,238,'+op.toFixed(3)+')'; ctx.lineWidth=0.4; ctx.stroke();",
  "          }",
  "        }",
  "      }",
  "      raf.current = requestAnimationFrame(draw);",
  "    };",
  "    draw();",
  "    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize',rsz); };",
  "  },[]);",
  "  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />;",
  "}",
].join('\n'));

// ── 2. LOGO MARK WITH ORBITING PARTICLES ─────────────────────
write('components/ui/logo-mark.tsx', [
  "'use client';",
  "",
  "export default function LogoMark({ size=30 }: { size?:number }) {",
  "  const orbits = [",
  "    { r:size*0.75, dur:'4s', delay:'0s',   col:'#22D3EE', sz:2 },",
  "    { r:size*0.95, dur:'6s', delay:'1.5s',  col:'#6366F1', sz:1.5 },",
  "    { r:size*0.62, dur:'3s', delay:'0.8s',  col:'#22D3EE', sz:1.2 },",
  "  ];",
  "  return (",
  "    <div style={{ width:size+'px', height:size+'px', position:'relative', flexShrink:0 }}>",
  "      {/* Orbital particles */}",
  "      {orbits.map((o,i) => (",
  "        <div key={i} style={{",
  "          position:'absolute', top:'50%', left:'50%',",
  "          marginTop:'-1px', marginLeft:'-1px',",
  "          width:'2px', height:'2px',",
  "          animation:'orbitLogo '+o.dur+' linear '+o.delay+' infinite',",
  "          ['--r' as string]: o.r+'px',",
  "        } as React.CSSProperties}>",
  "          <div style={{ width:o.sz+'px', height:o.sz+'px', borderRadius:'50%', background:o.col, boxShadow:'0 0 4px '+o.col, marginLeft:'-'+(o.sz/2)+'px', marginTop:'-'+(o.sz/2)+'px' }} />",
  "        </div>",
  "      ))}",
  "      {/* Core rings */}",
  "      <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.4)', animation:'glowPulse 2.5s ease-in-out infinite' }} />",
  "      <div style={{ position:'absolute', inset: (size*0.18)+'px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />",
  "      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:(size*0.26)+'px', height:(size*0.26)+'px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 8px #22D3EE' }} />",
  "    </div>",
  "  );",
  "}",
].join('\n'));

// ── 3. DASHBOARD LAYOUT — inject BgParticles ─────────────────
write('app/(dashboard)/layout.tsx', [
  "'use client';",
  "import Sidebar from '@/components/layout/sidebar';",
  "import MobileNav from '@/components/layout/mobile-nav';",
  "import CommandPalette from '@/components/layout/command-palette';",
  "import BgParticles from '@/components/ui/bg-particles';",
  "import { useState } from 'react';",
  "",
  "export default function DashboardLayout({ children }:{ children:React.ReactNode }) {",
  "  const [cmd, setCmd] = useState(false);",
  "  return (",
  "    <div className='dash-layout' style={{ background:'#030B14', position:'relative' }}>",
  "      <BgParticles />",
  "      <CommandPalette open={cmd} onClose={()=>setCmd(false)} />",
  "      <div className='sidebar-wrap' style={{ position:'relative', zIndex:10 }}>",
  "        <Sidebar onSearch={()=>setCmd(true)} />",
  "      </div>",
  "      <main className='main-content' style={{ position:'relative', zIndex:5 }}>{children}</main>",
  "      <MobileNav />",
  "    </div>",
  "  );",
  "}",
].join('\n'));

// ── 4. SIDEBAR — use LogoMark with orbiting particles ─────────
write('components/layout/sidebar.tsx', [
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
  "export default function Sidebar({ onSearch }:{ onSearch?:()=>void }) {",
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
  "        <button onClick={onSearch} className='search-bar'>",
  "          <Search size={12} color='rgba(34,211,238,0.5)' />",
  "          <span style={{ flex:1, textAlign:'left' }}>Search...</span>",
  "          <span style={{ fontSize:'10px', color:'rgba(34,211,238,0.3)', background:'rgba(34,211,238,0.06)', padding:'1px 5px', borderRadius:'4px' }}>\u2318K</span>",
  "        </button>",
  "      </div>",
  "      <nav style={{ flex:1, padding:'4px 10px', display:'flex', flexDirection:'column', gap:'1px' }}>",
  "        <div style={{ fontSize:'9px', color:'rgba(34,211,238,0.3)', letterSpacing:'1.5px', padding:'8px 4px 4px', fontWeight:600 }}>NAVIGATION</div>",
  "        {nav.map(({ href, icon:Icon, label }) => {",
  "          const active = path===href || path.startsWith(href+'/');",
  "          return (",
  "            <Link key={href} href={href} className={'sidebar-item'+(active?' active':'')}>",
  "              <Icon size={14} color={active?'#22D3EE':'rgba(226,248,255,0.28)'} style={{ transition:'color 0.15s ease', flexShrink:0 }} />",
  "              <span style={{ fontSize:'13px', fontWeight:active?600:400, color:active?'#E2F8FF':'rgba(226,248,255,0.38)' }}>{label}</span>",
  "              {active && <div style={{ marginLeft:'auto', width:'4px', height:'4px', borderRadius:'50%', background:'#22D3EE', boxShadow:'0 0 6px #22D3EE' }} />}",
  "            </Link>",
  "          );",
  "        })}",
  "      </nav>",
  "      <div style={{ padding:'10px', borderTop:'1px solid rgba(34,211,238,0.06)' }}>",
  "        <button onClick={logout} className='signout-btn'><LogOut size={13} /><span>Sign out</span></button>",
  "      </div>",
  "    </aside>",
  "  );",
  "}",
].join('\n'));

// ── 5. DOCUMENTS PAGE — fix docs.map error ───────────────────
write('app/(dashboard)/documents/page.tsx', [
  "'use client';",
  "import { useEffect, useState, useCallback } from 'react';",
  "import Topbar from '@/components/layout/topbar';",
  "import { Upload, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };",
  "",
  "export default function DocumentsPage() {",
  "  const [docs, setDocs]           = useState<any[]>([]);",
  "  const [uploading, setUploading] = useState(false);",
  "  const [drag, setDrag]           = useState(false);",
  "  const [expanded, setExpanded]   = useState<string|null>(null);",
  "  const [chunks, setChunks]       = useState<{[id:string]:string[]}>({});",
  "",
  "  const fetchDocs = useCallback(async () => {",
  "    const r = await fetch('/api/documents');",
  "    if (r.ok) {",
  "      const raw = await r.json();",
  "      // Guard: API may return array or {data:[...]} shape",
  "      setDocs(Array.isArray(raw) ? raw : (raw?.data ?? raw?.documents ?? []));",
  "    }",
  "  }, []);",
  "",
  "  useEffect(() => {",
  "    fetchDocs();",
  "    const t = setInterval(() => setDocs(prev => {",
  "      if (prev.some(d => d.status==='processing'||d.status==='embedding')) fetchDocs();",
  "      return prev;",
  "    }), 3000);",
  "    return () => clearInterval(t);",
  "  }, [fetchDocs]);",
  "",
  "  const upload = async (files: FileList|null) => {",
  "    if (!files||!files.length) return;",
  "    setUploading(true);",
  "    for (const f of Array.from(files)) { const fd=new FormData(); fd.append('file',f); await fetch('/api/documents',{method:'POST',body:fd}); }",
  "    setUploading(false); fetchDocs();",
  "  };",
  "",
  "  const remove = async (id:string) => { await fetch('/api/documents/'+id,{method:'DELETE'}); fetchDocs(); };",
  "",
  "  const loadChunks = async (docId:string) => {",
  "    if (expanded===docId) { setExpanded(null); return; }",
  "    setExpanded(docId);",
  "    if (chunks[docId]) return;",
  "    try {",
  "      const r = await fetch('/api/documents/'+docId);",
  "      if (r.ok) { const d = await r.json(); setChunks(p=>({...p,[docId]:d.chunks||[]})); }",
  "    } catch { setChunks(p=>({...p,[docId]:[]})); }",
  "  };",
  "",
  "  const sc = (s:string) => s==='ready'?'#22C55E':s==='failed'?'#EF4444':'#22D3EE';",
  "  const si = (s:string) => s==='ready'?<CheckCircle size={10}/>:s==='failed'?<AlertCircle size={10}/>:<Clock size={10}/>;",
  "",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'transparent' }}>",
  "      <Topbar title='Documents' />",
  "      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'18px' }}>",
  "        {/* Upload */}",
  "        <div",
  "          className={'upload-zone'+(drag?' dragover':'')}",
  "          style={{ padding:'36px' }}",
  "          onDragOver={e=>{e.preventDefault();setDrag(true);}}",
  "          onDragLeave={()=>setDrag(false)}",
  "          onDrop={e=>{e.preventDefault();setDrag(false);upload(e.dataTransfer.files);}}",
  "          onClick={()=>{const i=document.createElement('input');i.type='file';i.multiple=true;i.accept='.pdf,.docx,.xlsx,.pptx,.csv,.txt,.html';i.onchange=e=>upload((e.target as HTMLInputElement).files);i.click();}}",
  "        >",
  "          <div style={{ width:'52px',height:'52px',borderRadius:'13px',background:'rgba(34,211,238,0.07)',border:'1px solid rgba(34,211,238,0.18)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',transition:'all 0.2s' }}>",
  "            {uploading?<RefreshCw size={22} color='#22D3EE' style={{animation:'spin 1s linear infinite'}}/>:<Upload size={22} color='#22D3EE'/>}",
  "          </div>",
  "          <p style={{ fontSize:'14px',fontWeight:600,color:'#E2F8FF',margin:'0 0 4px' }}>{uploading?'Uploading...':drag?'Drop to upload':'Drag & drop files'}</p>",
  "          <p style={{ fontSize:'12px',color:'rgba(226,248,255,0.3)',margin:0 }}>PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML · Max 50MB</p>",
  "        </div>",
  "        {/* List */}",
  "        <div style={C}>",
  "          <div style={{ padding:'16px 18px',borderBottom:'1px solid rgba(34,211,238,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>",
  "            <h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Knowledge Base</h3>",
  "            <span style={{ fontSize:'11px',color:'rgba(34,211,238,0.5)' }}>{docs.length} documents</span>",
  "          </div>",
  "          <div style={{ padding:'10px' }}>",
  "            {docs.length===0",
  "              ? <div style={{ textAlign:'center',padding:'36px',color:'rgba(226,248,255,0.3)',fontSize:'13px' }}>No documents yet. Upload above.</div>",
  "              : docs.map(doc => (",
  "                <div key={doc.id} style={{ marginBottom:'6px',borderRadius:'10px',border:'1px solid rgba(34,211,238,0.07)',overflow:'hidden' }}>",
  "                  <div className='list-row' style={{ borderRadius:0,border:'none',margin:0 }} onClick={()=>loadChunks(doc.id)}>",
  "                    <div style={{ width:'30px',height:'30px',borderRadius:'7px',background:'rgba(34,211,238,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',fontWeight:800,color:'#22D3EE',flexShrink:0 }}>{doc.file_type?.toUpperCase()?.slice(0,3)||'DOC'}</div>",
  "                    <div style={{ flex:1,overflow:'hidden' }}>",
  "                      <div style={{ fontSize:'12px',color:'#E2F8FF',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{doc.filename}</div>",
  "                      <div style={{ fontSize:'10px',color:'rgba(226,248,255,0.3)',marginTop:'1px' }}>{doc.chunk_count?doc.chunk_count+' chunks · ':''}{new Date(doc.created_at).toLocaleDateString()}</div>",
  "                    </div>",
  "                    <div style={{ display:'flex',alignItems:'center',gap:'4px',padding:'2px 8px',borderRadius:'9px',fontSize:'9px',fontWeight:600,background:sc(doc.status)+'12',color:sc(doc.status),border:'1px solid '+sc(doc.status)+'25',flexShrink:0 }}>{si(doc.status)}{doc.status}</div>",
  "                    <div style={{ color:'rgba(226,248,255,0.3)',flexShrink:0 }}>{expanded===doc.id?<ChevronUp size={13}/>:<ChevronDown size={13}/>}</div>",
  "                    <button onClick={e=>{e.stopPropagation();remove(doc.id);}} className='btn-danger' style={{ width:'26px',height:'26px',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Trash2 size={11}/></button>",
  "                  </div>",
  "                  {expanded===doc.id&&(",
  "                    <div style={{ padding:'12px 14px',background:'rgba(34,211,238,0.02)',borderTop:'1px solid rgba(34,211,238,0.06)',maxHeight:'200px',overflowY:'auto' }}>",
  "                      {!chunks[doc.id]",
  "                        ? <div style={{ fontSize:'11px',color:'rgba(226,248,255,0.4)',textAlign:'center',padding:'12px' }}>Loading...</div>",
  "                        : chunks[doc.id].length===0",
  "                        ? <div style={{ fontSize:'11px',color:'rgba(226,248,255,0.4)',textAlign:'center',padding:'12px' }}>No preview yet — document may still be processing.</div>",
  "                        : chunks[doc.id].slice(0,3).map((chunk,i)=>(",
  "                          <div key={i} style={{ marginBottom:'8px',padding:'8px 10px',background:'rgba(34,211,238,0.03)',border:'1px solid rgba(34,211,238,0.08)',borderRadius:'7px' }}>",
  "                            <div style={{ fontSize:'9px',color:'rgba(34,211,238,0.4)',fontWeight:600,marginBottom:'4px' }}>CHUNK {i+1}</div>",
  "                            <div style={{ fontSize:'11px',color:'rgba(226,248,255,0.6)',lineHeight:1.5 }}>{String(chunk).slice(0,220)}...</div>",
  "                          </div>",
  "                        ))}",
  "                    </div>",
  "                  )}",
  "                </div>",
  "              ))}",
  "          </div>",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
].join('\n'));

// ── 6. ANALYTICS PAGE — modern bars + clean stat cards ────────
write('app/(dashboard)/analytics/page.tsx', [
  "'use client';",
  "import Topbar from '@/components/layout/topbar';",
  "import { TrendingUp, FileText, MessageSquare, Database, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };",
  "",
  "const metrics = [",
  "  { icon:FileText,      label:'Documents',   value:'2,847', change:'+12%', up:true,  accent:'#22D3EE' },",
  "  { icon:MessageSquare, label:'AI Queries',  value:'3,419', change:'+23%', up:true,  accent:'#F59E0B' },",
  "  { icon:Database,      label:'Chunks',      value:'1.2M',  change:'+8%',  up:true,  accent:'#6366F1' },",
  "  { icon:Zap,           label:'Avg Latency', value:'187ms', change:'-15%', up:false, accent:'#22C55E' },",
  "];",
  "",
  "const BARS = [40,65,45,80,55,90,70,85,60,95,75,88,65,100];",
  "const DAYS = ['14d','13d','12d','11d','10d','9d','8d','7d','6d','5d','4d','3d','2d','1d'];",
  "",
  "export default function AnalyticsPage() {",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'transparent' }}>",
  "      <Topbar title='Analytics' />",
  "      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'18px' }}>",
  "",
  "        {/* Stat cards — clean, no balls */}",
  "        <div className='stat-grid'>",
  "          {metrics.map(({ icon:Icon, label, value, change, up, accent }) => (",
  "            <div key={label} className='stat-card' style={{ ['--accent' as string]: accent } as React.CSSProperties}>",
  "              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>",
  "                <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:accent+'14', border:'1px solid '+accent+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>",
  "                  <Icon size={16} color={accent} />",
  "                </div>",
  "                <div style={{ display:'flex', alignItems:'center', gap:'3px', fontSize:'10px', fontWeight:700, color:up?'#22C55E':'#EF4444', background:up?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', padding:'2px 7px', borderRadius:'8px', border:'1px solid '+(up?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)') }}>",
  "                  {up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {change}",
  "                </div>",
  "              </div>",
  "              <div style={{ fontSize:'28px', fontWeight:900, color:'#E2F8FF', letterSpacing:'-1px', lineHeight:1, marginBottom:'4px', animation:'countUp 0.5s ease-out' }}>{value}</div>",
  "              <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(226,248,255,0.7)', marginBottom:'2px' }}>{label}</div>",
  "              <div style={{ fontSize:'10px', color:'rgba(226,248,255,0.3)' }}>this month</div>",
  "            </div>",
  "          ))}",
  "        </div>",
  "",
  "        {/* Query chart — modern transparent bars */}",
  "        <div style={{ ...C, padding:'22px' }}>",
  "          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>",
  "            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Query Volume — Last 14 Days</h3>",
  "            <span style={{ fontSize:'11px', color:'rgba(34,211,238,0.5)' }}>3,419 total</span>",
  "          </div>",
  "          <div style={{ display:'flex', alignItems:'flex-end', gap:'5px', height:'120px', padding:'0 2px' }}>",
  "            {BARS.map((h,i) => (",
  "              <div key={i} style={{ flex:1, position:'relative', height:'100%', display:'flex', alignItems:'flex-end' }}>",
  "                <div style={{",
  "                  width:'100%',",
  "                  height:h+'%',",
  "                  background:'linear-gradient(to top, rgba(34,211,238,0.38) 0%, rgba(34,211,238,0.08) 65%, transparent 100%)',",
  "                  borderRadius:'4px 4px 0 0',",
  "                  border:'1px solid rgba(34,211,238,0.12)',",
  "                  borderBottom:'none',",
  "                  backdropFilter:'blur(4px)',",
  "                  boxShadow:'inset 0 1px 0 rgba(34,211,238,0.15), 0 0 6px rgba(34,211,238,0.04)',",
  "                  transition:'height 0.3s ease',",
  "                  position:'relative',",
  "                  overflow:'hidden',",
  "                }}>",
  "                  {/* Shimmer line at top of bar */}",
  "                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'rgba(34,211,238,0.5)' }} />",
  "                </div>",
  "              </div>",
  "            ))}",
  "          </div>",
  "          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px', paddingRight:'2px' }}>",
  "            {DAYS.map(d => <span key={d} style={{ fontSize:'8px', color:'rgba(226,248,255,0.2)', flex:1, textAlign:'center' }}>{d}</span>)}",
  "          </div>",
  "        </div>",
  "",
  "        {/* System status */}",
  "        <div style={{ ...C, padding:'20px' }}>",
  "          <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:'0 0 14px' }}>System Status</h3>",
  "          <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>",
  "            {[",
  "              { l:'Vector Search (pgvector)', s:'Operational', c:'#22C55E' },",
  "              { l:'Ollama AI (tinyllama)',     s:'Running',     c:'#22C55E' },",
  "              { l:'Document Ingestion',        s:'Active',      c:'#22C55E' },",
  "              { l:'Supabase Storage',          s:'Connected',   c:'#22C55E' },",
  "            ].map(({ l, s, c }) => (",
  "              <div key={l} className='list-row' style={{ cursor:'default' }}>",
  "                <span style={{ fontSize:'12px', color:'rgba(226,248,255,0.55)', flex:1 }}>{l}</span>",
  "                <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>",
  "                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:c, boxShadow:'0 0 5px '+c, animation:'glowPulse 2s ease-in-out infinite' }} />",
  "                  <span style={{ fontSize:'11px', color:c, fontWeight:600 }}>{s}</span>",
  "                </div>",
  "              </div>",
  "            ))}",
  "          </div>",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
].join('\n'));

// ── 7. CHAT PAGE — improved agent animation ───────────────────
const chat = [];
const ch = s => chat.push(s);
ch("'use client';");
ch("import { useState, useRef, useEffect, useCallback } from 'react';");
ch("import { createClient } from '@/lib/supabase/client';");
ch("import Topbar from '@/components/layout/topbar';");
ch("import { Send, FileText, Zap, Printer, CheckCircle, Circle } from 'lucide-react';");
ch("");
ch("const C: React.CSSProperties = { background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };");
ch("");
ch("export default function ChatPage() {");
ch("  const [docs, setDocs]         = useState<any[]>([]);");
ch("  const [sel, setSel]           = useState<string[]>([]);");
ch("  const [msgs, setMsgs]         = useState<{role:string;content:string;citations?:any[]}[]>([]);");
ch("  const [input, setInput]       = useState('');");
ch("  const [loading, setLoading]   = useState(false);");
ch("  const [agentSteps, setSteps]  = useState<{text:string;done:boolean}[]>([]);");
ch("  const [showAgent, setAgent]   = useState(false);");
ch("  const [agentDone, setAdone]   = useState(false);");
ch("  const [progress, setProgress] = useState(0);");
ch("  const bottomRef = useRef<HTMLDivElement>(null);");
ch("  const timers    = useRef<NodeJS.Timeout[]>([]);");
ch("  const supabase  = createClient();");
ch("");
ch("  useEffect(()=>{");
ch("    fetch('/api/documents').then(r=>r.json()).then(raw=>{");
ch("      const data=Array.isArray(raw)?raw:(raw?.data??[]);");
ch("      setDocs(data.filter((x:any)=>x.status==='ready'));");
ch("    });");
ch("  },[]);");
ch("  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs,agentSteps]);");
ch("");
ch("  const runAgent = useCallback((docNames:string[]) => {");
ch("    timers.current.forEach(t=>clearTimeout(t)); timers.current=[];");
ch("    const steps = [");
ch("      { text:'Initializing query engine...', pct:10 },");
ch("      { text:'Vectorizing input (384D embeddings)...', pct:25 },");
ch("      { text: docNames.length>0 ? 'Searching: '+docNames.slice(0,2).join(', ')+(docNames.length>2?' +'+( docNames.length-2)+' more':'')+'...' : 'Searching knowledge base...', pct:45 },");
ch("      { text:'Ranking semantic similarity scores...', pct:62 },");
ch("      { text:'Extracting relevant passages...', pct:78 },");
ch("      { text:'Grounding response with citations...', pct:92 },");
ch("    ];");
ch("    setSteps([]); setAgent(true); setAdone(false); setProgress(0);");
ch("    steps.forEach(({text,pct},i)=>{");
ch("      const t=setTimeout(()=>{");
ch("        setSteps(prev=>[...prev,{text,done:false}]);");
ch("        if(i>0) setSteps(prev=>prev.map((s,idx)=>idx<i?{...s,done:true}:s));");
ch("        setProgress(pct);");
ch("      }, i*480);");
ch("      timers.current.push(t);");
ch("    });");
ch("  }, []);");
ch("");
ch("  const send = async () => {");
ch("    if(!input.trim()||loading) return;");
ch("    const userMsg={role:'user',content:input.trim()};");
ch("    setMsgs(m=>[...m,userMsg]); setInput(''); setLoading(true);");
ch("    const docNames=sel.map(id=>docs.find(d=>d.id===id)?.filename||id);");
ch("    runAgent(docNames);");
ch("    try {");
ch("      const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg.content,documentIds:sel,history:msgs})});");
ch("      const data=await res.json();");
ch("      timers.current.forEach(t=>clearTimeout(t));");
ch("      setProgress(100); setAdone(true);");
ch("      setSteps(prev=>prev.map(s=>({...s,done:true})));");
ch("      setTimeout(()=>setAgent(false),1400);");
ch("      setMsgs(m=>[...m,{role:'assistant',content:data.answer||'No response.',citations:data.citations}]);");
ch("    } catch {");
ch("      setAgent(false);");
ch("      setMsgs(m=>[...m,{role:'assistant',content:'Error getting response.'}]);");
ch("    }");
ch("    setLoading(false);");
ch("  };");
ch("");
ch("  const printChat = () => {");
ch("    const w=window.open('','_blank','width=800,height=600'); if(!w) return;");
ch("    const html='<html><head><title>PulsarIQ Chat Export</title><style>body{font-family:Inter,sans-serif;max-width:700px;margin:32px auto;color:#111}.u{background:#f0f4ff;padding:10px 14px;border-radius:10px;margin:12px 0}.a{background:#f8f8f8;padding:10px 14px;border-radius:10px;margin:12px 0;border-left:3px solid #22D3EE}.lbl{font-size:11px;font-weight:700;color:#666;margin-bottom:4px}h1{border-bottom:2px solid #22D3EE;padding-bottom:8px}</style></head><body><h1>PulsarIQ Export — '+new Date().toLocaleString()+'</h1>'+msgs.map(m=>'<div class=\"'+(m.role==='user'?'u':'a')+'\"><div class=\"lbl\">'+(m.role==='user'?'YOU':'AI')+'</div>'+m.content+'</div>').join('')+'</body></html>';");
ch("    w.document.write(html); w.document.close(); w.print();");
ch("  };");
ch("");
ch("  return (");
ch("    <div style={{ height:'100vh',display:'flex',flexDirection:'column',background:'transparent' }}>");
ch("      <Topbar title='AI Chat' />");
ch("      <div className='chat-layout' style={{ flex:1,overflow:'hidden',padding:'16px',gap:'14px' }}>");
ch("        {/* Doc selector */}");
ch("        <div className='doc-sidebar' style={{ ...C,display:'flex',flexDirection:'column',overflow:'hidden' }}>");
ch("          <div style={{ padding:'12px 14px',borderBottom:'1px solid rgba(34,211,238,0.07)' }}>");
ch("            <h3 style={{ fontSize:'12px',fontWeight:700,color:'#E2F8FF',margin:'0 0 2px' }}>Sources</h3>");
ch("            <p style={{ fontSize:'10px',color:'rgba(226,248,255,0.3)',margin:0 }}>{sel.length} selected</p>");
ch("          </div>");
ch("          <div style={{ flex:1,overflow:'auto',padding:'8px' }}>");
ch("            {docs.length===0");
ch("              ? <div style={{ padding:'16px',textAlign:'center',fontSize:'11px',color:'rgba(226,248,255,0.3)' }}>No ready docs.<br/><a href='/documents' style={{ color:'#22D3EE',textDecoration:'none' }}>Upload first →</a></div>");
ch("              : docs.map(doc=>{");
ch("                const active=sel.includes(doc.id);");
ch("                return(");
ch("                  <div key={doc.id} onClick={()=>setSel(s=>active?s.filter(x=>x!==doc.id):[...s,doc.id])} className={'doc-item'+(active?' selected':'')}>  ");
ch("                    <div style={{ width:'16px',height:'16px',borderRadius:'50%',border:'1.5px solid '+(active?'#22D3EE':'rgba(226,248,255,0.2)'),background:active?'rgba(34,211,238,0.15)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s' }}>");
ch("                      {active&&<div style={{ width:'7px',height:'7px',borderRadius:'50%',background:'#22D3EE' }}/>}");
ch("                    </div>");
ch("                    <span style={{ fontSize:'11px',color:active?'#E2F8FF':'rgba(226,248,255,0.45)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:1.3 }}>{doc.filename}</span>");
ch("                  </div>");
ch("                );");
ch("              })}");
ch("          </div>");
ch("        </div>");
ch("        {/* Chat main */}");
ch("        <div style={{ ...C,flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0 }}>");
ch("          <div style={{ padding:'10px 14px',borderBottom:'1px solid rgba(34,211,238,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>");
ch("            <span style={{ fontSize:'11px',color:'rgba(226,248,255,0.35)' }}>{msgs.length} messages · {sel.length} sources</span>");
ch("            {msgs.length>0&&<button className='btn-ghost no-mobile' onClick={printChat} style={{ display:'flex',alignItems:'center',gap:'5px',padding:'5px 10px',borderRadius:'7px',fontSize:'11px' }}><Printer size={12}/>Print</button>}");
ch("          </div>");
ch("          <div style={{ flex:1,overflow:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'14px' }}>");
ch("            {msgs.length===0&&!showAgent&&(");
ch("              <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'40px' }}>");
ch("                <div style={{ width:'52px',height:'52px',borderRadius:'13px',background:'rgba(34,211,238,0.06)',border:'1px solid rgba(34,211,238,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'14px' }}><Zap size={22} color='rgba(34,211,238,0.5)'/></div>");
ch("                <p style={{ fontSize:'14px',fontWeight:600,color:'#E2F8FF',margin:'0 0 6px' }}>Ask your documents anything</p>");
ch("                <p style={{ fontSize:'12px',color:'rgba(226,248,255,0.35)',margin:0 }}>Select sources on the left, then ask a question.</p>");
ch("              </div>");
ch("            )}");
ch("            {msgs.map((m,i)=>(");
ch("              <div key={i} style={{ display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start' }}>");
ch("                <div style={{ maxWidth:'82%' }}>");
ch("                  {m.role==='assistant'&&<div style={{ display:'flex',alignItems:'center',gap:'6px',marginBottom:'5px' }}><div style={{ width:'18px',height:'18px',borderRadius:'50%',background:'linear-gradient(135deg,#22D3EE,#6366F1)',display:'flex',alignItems:'center',justifyContent:'center' }}><Zap size={9} color='#fff'/></div><span style={{ fontSize:'10px',color:'rgba(34,211,238,0.6)',fontWeight:600 }}>PulsarIQ</span></div>}");
ch("                  <div className={m.role==='user'?'chat-msg-user':'chat-msg-ai'} style={{ padding:'11px 14px',borderRadius:m.role==='user'?'13px 13px 3px 13px':'3px 13px 13px 13px',background:m.role==='user'?'rgba(34,211,238,0.09)':'rgba(34,211,238,0.04)',border:'1px solid '+(m.role==='user'?'rgba(34,211,238,0.2)':'rgba(34,211,238,0.08)'),fontSize:'13px',color:'#E2F8FF',lineHeight:1.6 }}>{m.content}</div>");
ch("                  {m.citations&&m.citations.length>0&&(<div style={{ display:'flex',gap:'5px',flexWrap:'wrap',marginTop:'7px' }}>{m.citations.slice(0,4).map((c:any,ci:number)=>(<div key={ci} style={{ display:'flex',alignItems:'center',gap:'3px',padding:'2px 7px',borderRadius:'9px',background:'rgba(34,211,238,0.06)',border:'1px solid rgba(34,211,238,0.14)',fontSize:'9px',color:'#22D3EE' }}><FileText size={8}/>{String(c.source||'').split('/').pop()?.slice(0,22)||'Source'}</div>))}</div>)}");
ch("                </div>");
ch("              </div>);");
ch("            })}");
ch("            {/* Agent thinking panel */}");
ch("            {showAgent&&(");
ch("              <div style={{ borderRadius:'12px',background:'rgba(4,14,28,0.96)',border:'1px solid rgba(34,211,238,0.2)',padding:'16px',animation:'fadeUp 0.3s ease-out' }}>");
ch("                {/* Radar + header */}");
ch("                <div style={{ display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px' }}>");
ch("                  {/* Radar animation */}");
ch("                  <div style={{ width:'32px',height:'32px',position:'relative',flexShrink:0 }}>");
ch("                    <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(34,211,238,0.3)' }} />");
ch("                    <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(34,211,238,0.6)',animation:'radarPing 1.5s ease-out 0s infinite' }} />");
ch("                    <div style={{ position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(34,211,238,0.4)',animation:'radarPing 1.5s ease-out 0.5s infinite' }} />");
ch("                    <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'6px',height:'6px',borderRadius:'50%',background:agentDone?'#22C55E':'#22D3EE',boxShadow:'0 0 8px '+(agentDone?'#22C55E':'#22D3EE') }} />");
ch("                  </div>");
ch("                  <div style={{ flex:1 }}>");
ch("                    <div style={{ fontSize:'11px',fontWeight:700,color:agentDone?'#22C55E':'#22D3EE',letterSpacing:'0.5px',marginBottom:'5px' }}>{agentDone?'COMPLETE':'PROCESSING...'}</div>");
ch("                    {/* Progress bar */}");
ch("                    <div style={{ height:'3px',background:'rgba(34,211,238,0.1)',borderRadius:'2px',overflow:'hidden' }}>");
ch("                      <div style={{ height:'100%',width:progress+'%',background:'linear-gradient(90deg,#6366F1,#22D3EE)',borderRadius:'2px',transition:'width 0.45s ease',boxShadow:'0 0 6px rgba(34,211,238,0.5)' }} />");
ch("                    </div>");
ch("                  </div>");
ch("                </div>");
ch("                {/* Steps */}");
ch("                <div style={{ display:'flex',flexDirection:'column',gap:'5px' }}>");
ch("                  {agentSteps.map((step,i)=>(");
ch("                    <div key={i} style={{ display:'flex',alignItems:'center',gap:'8px',animation:'agentStep 0.25s ease-out' }}>");
ch("                      <div style={{ width:'14px',height:'14px',borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:step.done?'rgba(34,211,238,0.12)':'rgba(245,158,11,0.1)',border:'1px solid '+(step.done?'rgba(34,211,238,0.25)':'rgba(245,158,11,0.25)') }}>");
ch("                        {step.done");
ch("                          ? <CheckCircle size={8} color='#22D3EE'/>");
ch("                          : <div style={{ width:'5px',height:'5px',borderRadius:'50%',background:'#F59E0B',animation:'glowPulse 0.7s ease-in-out infinite' }} />}");
ch("                      </div>");
ch("                      <span style={{ fontSize:'11px',color:step.done?'rgba(226,248,255,0.4)':'#E2F8FF',transition:'color 0.3s ease' }}>{step.text}</span>");
ch("                    </div>);");
ch("                  })}");
ch("                </div>");
ch("              </div>)}");
ch("            <div ref={bottomRef}/>");
ch("          </div>");
ch("          <div style={{ padding:'12px 14px',borderTop:'1px solid rgba(34,211,238,0.07)' }}>");
ch("            <div style={{ display:'flex',gap:'8px' }}>");
ch("              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} placeholder={sel.length===0?'Select documents first...':'Ask anything about your documents...'} disabled={sel.length===0||loading} className='inp-field' style={{ flex:1,boxSizing:'border-box' as const }} />");
ch("              <button onClick={send} disabled={!input.trim()||loading||sel.length===0} className={'send-btn '+(input.trim()&&!loading&&sel.length>0?'active':'inactive')}><Send size={15} color={input.trim()&&!loading&&sel.length>0?'#fff':'rgba(34,211,238,0.4)'}/></button>");
ch("            </div>");
ch("          </div>");
ch("        </div>");
ch("      </div>");
ch("    </div>");
ch("  );");
ch("}");
write('app/(dashboard)/chat/page.tsx', chat.join('\n'));

// ── 8. SETTINGS — glass buttons ───────────────────────────────
write('app/(dashboard)/settings/page.tsx', [
  "'use client';",
  "import { useEffect, useState } from 'react';",
  "import { createClient } from '@/lib/supabase/client';",
  "import Topbar from '@/components/layout/topbar';",
  "import { User, Shield, Database, Save, CheckCircle } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', padding:'22px' };",
  "",
  "export default function SettingsPage() {",
  "  const [profile, setProfile] = useState<any>(null);",
  "  const [saved,   setSaved]   = useState(false);",
  "  const supabase = createClient();",
  "  useEffect(()=>{",
  "    supabase.auth.getUser().then(async({data:{user}})=>{",
  "      if(!user) return;",
  "      const{data:p}=await supabase.from('profiles').select('*').eq('id',user.id).single();",
  "      setProfile({...(p||{}),email:user.email});",
  "    });",
  "  },[]);",
  "  const save=async()=>{",
  "    const{data:{user}}=await supabase.auth.getUser();",
  "    if(!user||!profile) return;",
  "    await supabase.from('profiles').update({full_name:profile.full_name}).eq('id',user.id);",
  "    setSaved(true); setTimeout(()=>setSaved(false),2500);",
  "  };",
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'transparent' }}>",
  "      <Topbar title='Settings' />",
  "      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px', maxWidth:'600px' }}>",
  "        <div style={C}>",
  "          <div style={{ display:'flex',alignItems:'center',gap:'7px',marginBottom:'18px' }}><User size={15} color='#22D3EE'/><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Profile</h3></div>",
  "          <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>",
  "            {[{l:'Full Name',k:'full_name',t:'text'},{l:'Email',k:'email',t:'email'}].map(({l,k,t})=>(",
  "              <div key={k}><label style={{ fontSize:'11px',color:'rgba(226,248,255,0.45)',display:'block',marginBottom:'5px' }}>{l}</label><input type={t} value={profile?.[k]||''} disabled={k==='email'} onChange={e=>setProfile((p:any)=>({...p,[k]:e.target.value}))} className='inp-field' style={{ opacity:k==='email'?0.5:1 }}/></div>",
  "            ))}",
  "            <button onClick={save} className='btn-glass' style={{ padding:'9px 18px',borderRadius:'9px',fontSize:'12px',width:'fit-content' }}>",
  "              {saved?<><CheckCircle size={13}/>Saved!</>:<><Save size={13}/>Save Changes</>}",
  "            </button>",
  "          </div>",
  "        </div>",
  "        <div style={C}>",
  "          <div style={{ display:'flex',alignItems:'center',gap:'7px',marginBottom:'14px' }}><Shield size={15} color='#F59E0B'/><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Security</h3></div>",
  "          {[{l:'Role',v:profile?.role||'viewer'},{l:'Org ID',v:(profile?.org_id||'—').slice(0,18)+'...'}].map(({l,v})=>(<div key={l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid rgba(34,211,238,0.06)' }}><span style={{ fontSize:'12px',color:'rgba(226,248,255,0.45)' }}>{l}</span><span style={{ fontSize:'12px',color:'#E2F8FF',fontWeight:600 }}>{v}</span></div>))}",
  "        </div>",
  "        <div style={C}>",
  "          <div style={{ display:'flex',alignItems:'center',gap:'7px',marginBottom:'14px' }}><Database size={15} color='#6366F1'/><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>AI Configuration</h3></div>",
  "          {[{l:'Embedding Model',v:'all-minilm (384D)'},{l:'Chat Model',v:'tinyllama'},{l:'Vector Dims',v:'384'},{l:'Search',v:'pgvector + fallback'}].map(({l,v})=>(<div key={l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid rgba(34,211,238,0.06)' }}><span style={{ fontSize:'12px',color:'rgba(226,248,255,0.45)' }}>{l}</span><span style={{ fontSize:'11px',color:'#22D3EE',fontWeight:600,fontFamily:'monospace' }}>{v}</span></div>))}",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
].join('\n'));

// ── 9. ACCESS PAGE — glass buttons ───────────────────────────
write('app/(dashboard)/access/page.tsx', [
  "'use client';",
  "import { useEffect, useState } from 'react';",
  "import { createClient } from '@/lib/supabase/client';",
  "import Topbar from '@/components/layout/topbar';",
  "import { Shield, Users, Crown, Eye, Edit, Mail } from 'lucide-react';",
  "",
  "const C: React.CSSProperties = { background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };",
  "const ROLES:Record<string,{col:string;icon:any;desc:string}> = {",
  "  admin:   {col:'#F59E0B',icon:Crown,desc:'Full access — manage users, documents and settings'},",
  "  manager: {col:'#6366F1',icon:Edit, desc:'Upload documents and manage team content'},",
  "  viewer:  {col:'#22D3EE',icon:Eye,  desc:'Read-only access to documents and AI chat'},",
  "};",
  "",
  "export default function AccessPage() {",
  "  const [profile,setProfile]=useState<any>(null);",
  "  const [members,setMembers]=useState<any[]>([]);",
  "  const [invite,setInvite]=useState('');",
  "  const [role,setRole]=useState('viewer');",
  "  const [msg,setMsg]=useState('');",
  "  const supabase=createClient();",
  "  useEffect(()=>{",
  "    supabase.auth.getUser().then(async({data:{user}})=>{",
  "      if(!user) return;",
  "      const{data:p}=await supabase.from('profiles').select('*').eq('id',user.id).single();",
  "      setProfile({...p,email:user.email});",
  "      if(p?.org_id){const{data:m}=await supabase.from('profiles').select('*').eq('org_id',p.org_id);setMembers(m||[]);}",
  "    });",
  "  },[]);",
  "  const send=()=>{ if(!invite) return; setMsg('Invite sent to '+invite); setInvite(''); setTimeout(()=>setMsg(''),4000); };",
  "  const ri=ROLES[profile?.role]||ROLES.viewer;",
  "  const RIcon=ri.icon;",
  "  return(",
  "    <div style={{ minHeight:'100vh',background:'transparent' }}>",
  "      <Topbar title='Access Control'/>",
  "      <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'18px',maxWidth:'800px' }}>",
  "        <div style={{ ...C,padding:'22px',background:'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(5,18,35,0.95))',border:'1px solid rgba(245,158,11,0.2)' }}>",
  "          <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>",
  "            <div style={{ width:'44px',height:'44px',borderRadius:'12px',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)',display:'flex',alignItems:'center',justifyContent:'center' }}><Shield size={20} color='#F59E0B'/></div>",
  "            <div>",
  "              <div style={{ fontSize:'11px',color:'rgba(226,248,255,0.4)',marginBottom:'2px' }}>YOUR ROLE</div>",
  "              <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>",
  "                <span style={{ fontSize:'18px',fontWeight:800,color:'#E2F8FF' }}>{profile?.role?.toUpperCase()||'VIEWER'}</span>",
  "                <div style={{ padding:'3px 9px',borderRadius:'12px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',fontSize:'10px',fontWeight:700,color:'#F59E0B' }}>ACTIVE</div>",
  "              </div>",
  "              <div style={{ fontSize:'12px',color:'rgba(226,248,255,0.4)',marginTop:'2px' }}>{ri.desc}</div>",
  "            </div>",
  "          </div>",
  "        </div>",
  "        <div style={C}>",
  "          <div style={{ padding:'16px 18px',borderBottom:'1px solid rgba(34,211,238,0.07)' }}><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Permission Levels</h3></div>",
  "          <div style={{ padding:'14px',display:'flex',flexDirection:'column',gap:'8px' }}>",
  "            {Object.entries(ROLES).map(([r,m])=>{ const Icon=m.icon; const isMe=profile?.role===r; return(",
  "              <div key={r} className='list-row' style={{ cursor:'default',background:isMe?m.col+'0A':'rgba(34,211,238,0.02)',border:'1px solid '+(isMe?m.col+'25':'rgba(34,211,238,0.07)') }}>",
  "                <div style={{ width:'32px',height:'32px',borderRadius:'9px',background:m.col+'14',border:'1px solid '+m.col+'22',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={14} color={m.col}/></div>",
  "                <div style={{ flex:1 }}><div style={{ fontSize:'12px',fontWeight:700,color:'#E2F8FF',textTransform:'capitalize' }}>{r}{isMe&&<span style={{ fontSize:'9px',color:m.col,marginLeft:'6px' }}>YOU</span>}</div><div style={{ fontSize:'11px',color:'rgba(226,248,255,0.4)' }}>{m.desc}</div></div>",
  "                <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:m.col,boxShadow:'0 0 6px '+m.col }} />",
  "              </div>);})}",
  "          </div>",
  "        </div>",
  "        <div style={C}>",
  "          <div style={{ padding:'16px 18px',borderBottom:'1px solid rgba(34,211,238,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>",
  "            <h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Team Members</h3>",
  "            <div style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'rgba(34,211,238,0.5)' }}><Users size={12}/>{members.length}</div>",
  "          </div>",
  "          <div style={{ padding:'10px' }}>",
  "            {members.map(m=>{ const meta=ROLES[m.role]||ROLES.viewer; const Icon=meta.icon; return(",
  "              <div key={m.id} className='list-row' style={{ marginBottom:'5px',cursor:'default' }}>",
  "                <div style={{ width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#22D3EE,#6366F1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff',flexShrink:0 }}>{m.full_name?.[0]?.toUpperCase()||m.email?.[0]?.toUpperCase()||'U'}</div>",
  "                <div style={{ flex:1,overflow:'hidden' }}><div style={{ fontSize:'12px',color:'#E2F8FF',fontWeight:500 }}>{m.full_name||'No name'}</div><div style={{ fontSize:'10px',color:'rgba(226,248,255,0.35)' }}>{m.email}</div></div>",
  "                <div style={{ display:'flex',alignItems:'center',gap:'4px',padding:'2px 8px',borderRadius:'9px',background:meta.col+'12',border:'1px solid '+meta.col+'25',fontSize:'9px',fontWeight:700,color:meta.col,flexShrink:0 }}><Icon size={9}/>{m.role}</div>",
  "              </div>);",
  "            })}",
  "            {members.length===0&&<div style={{ padding:'20px',textAlign:'center',fontSize:'12px',color:'rgba(226,248,255,0.3)' }}>No members found.</div>}",
  "          </div>",
  "        </div>",
  "        {profile?.role==='admin'&&(",
  "          <div style={C}>",
  "            <div style={{ padding:'16px 18px',borderBottom:'1px solid rgba(34,211,238,0.07)' }}><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Invite Team Member</h3></div>",
  "            <div style={{ padding:'16px',display:'flex',gap:'10px' }}>",
  "              <input value={invite} onChange={e=>setInvite(e.target.value)} placeholder='colleague@company.com' className='inp-field' style={{ flex:1 }}/>",
  "              <select value={role} onChange={e=>setRole(e.target.value)} className='inp-field' style={{ flex:'0 0 110px' }}><option value='viewer'>Viewer</option><option value='manager'>Manager</option><option value='admin'>Admin</option></select>",
  "              <button onClick={send} className='btn-glass' style={{ display:'flex',alignItems:'center',gap:'5px',padding:'9px 16px',borderRadius:'9px',fontSize:'12px',whiteSpace:'nowrap',flexShrink:0 }}><Mail size={13}/>Send Invite</button>",
  "            </div>",
  "            {msg&&<div style={{ padding:'8px 16px',fontSize:'12px',color:'#22C55E' }}>{msg}</div>}",
  "          </div>",
  "        )}",
  "      </div>",
  "    </div>",
  "  );",
  "}",
].join('\n'));

console.log('\n  \u2705 fixes.js complete!\n');
console.log('  Fixed:');
console.log('  \u2713 docs.map error          - Array.isArray guard on fetch');
console.log('  \u2713 BgParticles             - subtle drifting canvas on all dashboard pages');
console.log('  \u2713 Logo mark               - 3 orbiting particles in harmony with hero');
console.log('  \u2713 Analytics bars          - transparent gradient + shimmer + backdrop-blur');
console.log('  \u2713 Analytics stat cards    - left accent bar + trend arrow chip, no balls');
console.log('  \u2713 Chat agent animation    - radar ping + progress bar + step checklist');
console.log('  \u2713 Buttons (Save/Invite/etc) - glass style, no bright gradient');
console.log('  \u2713 Dashboard layout        - includes BgParticles');
console.log('\n  Sequence:');
console.log('  node phase6.js');
console.log('  node interactive.js');
console.log('  node fixes.js');
console.log('  rmdir /s /q .next && npm run dev\n');
