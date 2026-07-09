// PulsarIQ — interactive.js: Hover states, button animations, clean stat cards
// Run: node interactive.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Interactive States\n');

// ── 1. PATCH GLOBALS.CSS ──────────────────────────────────────
const gPath = path.join(root, 'app', 'globals.css');
let gcss = fs.readFileSync(gPath, 'utf8');

if (!gcss.includes('btn-grad')) {
  gcss += `
/* ── Buttons ───────────────────────────────────────────────── */
.btn-grad {
  background: linear-gradient(135deg, #22D3EE, #6366F1);
  border: none; color: #fff; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  font-family: 'Inter', sans-serif;
}
.btn-grad:hover:not(:disabled) {
  opacity: 0.88;
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(34,211,238,0.45), 0 4px 12px rgba(0,0,0,0.3);
}
.btn-grad:active:not(:disabled) {
  transform: translateY(0px) scale(0.98);
  opacity: 1;
}
.btn-grad:disabled { opacity: 0.5; cursor: wait; }

.btn-ghost {
  background: rgba(34,211,238,0.05);
  border: 1px solid rgba(34,211,238,0.18);
  color: #22D3EE; font-weight: 600; cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  font-family: 'Inter', sans-serif;
}
.btn-ghost:hover:not(:disabled) {
  background: rgba(34,211,238,0.1);
  border-color: rgba(34,211,238,0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(34,211,238,0.15);
}
.btn-ghost:active:not(:disabled) { transform: scale(0.98); }

.btn-danger {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  color: #EF4444; cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  font-family: 'Inter', sans-serif;
}
.btn-danger:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); transform: scale(1.02); }

.btn-icon {
  background: rgba(34,211,238,0.05);
  border: 1px solid rgba(34,211,238,0.12);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  display: flex; align-items: center; justify-content: center;
}
.btn-icon:hover { background: rgba(34,211,238,0.1); border-color: rgba(34,211,238,0.3); transform: scale(1.06); }

/* ── Cards ──────────────────────────────────────────────────── */
.card-base {
  background: rgba(5,18,35,0.9);
  border: 1px solid rgba(34,211,238,0.12);
  border-radius: 14px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.card-hover:hover {
  border-color: rgba(34,211,238,0.22);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.08);
  transform: translateY(-2px);
}

/* ── Stat cards ─────────────────────────────────────────────── */
.stat-card {
  background: rgba(5,18,35,0.9);
  border: 1px solid rgba(34,211,238,0.1);
  border-radius: 14px;
  backdrop-filter: blur(20px);
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  cursor: default;
}
.stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 14px 0 0 14px;
  background: var(--accent, #22D3EE);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}
.stat-card:hover { border-color: rgba(34,211,238,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.5); transform: translateY(-2px); }
.stat-card:hover::before { opacity: 1; }

/* ── Nav links ──────────────────────────────────────────────── */
.nav-link {
  color: rgba(226,248,255,0.35);
  text-decoration: none;
  transition: color 0.15s ease;
  font-size: 13px;
}
.nav-link:hover { color: rgba(226,248,255,0.75); }
.nav-link-active { color: #22D3EE !important; }

/* ── Sidebar items ──────────────────────────────────────────── */
.sidebar-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 9px; border-radius: 8px; text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.sidebar-item:hover {
  background: rgba(34,211,238,0.05);
  border-color: rgba(34,211,238,0.08);
}
.sidebar-item.active {
  background: rgba(34,211,238,0.08);
  border-color: rgba(34,211,238,0.14);
}
.sidebar-item span { transition: color 0.15s ease; }

/* ── List row items ─────────────────────────────────────────── */
.list-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 9px;
  background: rgba(34,211,238,0.02);
  border: 1px solid rgba(34,211,238,0.06);
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  cursor: pointer;
}
.list-row:hover {
  background: rgba(34,211,238,0.05);
  border-color: rgba(34,211,238,0.14);
  transform: translateX(2px);
}

/* ── Input fields ───────────────────────────────────────────── */
.inp-field {
  padding: 10px 13px;
  background: rgba(34,211,238,0.04);
  border: 1px solid rgba(34,211,238,0.18);
  border-radius: 9px; color: #E2F8FF; font-size: 13px;
  outline: none; font-family: 'Inter', sans-serif;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  width: 100%; box-sizing: border-box;
}
.inp-field:focus {
  border-color: rgba(34,211,238,0.45);
  background: rgba(34,211,238,0.07);
  box-shadow: 0 0 0 3px rgba(34,211,238,0.08);
}
.inp-field::placeholder { color: rgba(226,248,255,0.25); }

/* ── Doc selector items (chat) ──────────────────────────────── */
.doc-item {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 8px; border-radius: 8px; cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.doc-item:hover { background: rgba(34,211,238,0.05); border-color: rgba(34,211,238,0.1); }
.doc-item.selected { background: rgba(34,211,238,0.08); border-color: rgba(34,211,238,0.2); }

/* ── Chat send button ───────────────────────────────────────── */
.send-btn {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
  border: 1px solid rgba(34,211,238,0.14); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.send-btn.active {
  background: linear-gradient(135deg,#22D3EE,#6366F1);
  box-shadow: 0 4px 14px rgba(34,211,238,0.3);
}
.send-btn.active:hover { transform: scale(1.06); box-shadow: 0 6px 20px rgba(34,211,238,0.45); }
.send-btn.inactive { background: rgba(34,211,238,0.05); }

/* ── Upload zone ────────────────────────────────────────────── */
.upload-zone {
  border: 1px dashed rgba(34,211,238,0.2);
  background: rgba(5,18,35,0.5);
  border-radius: 14px; text-align: center; cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.upload-zone:hover {
  border-color: rgba(34,211,238,0.4);
  background: rgba(34,211,238,0.04);
  box-shadow: 0 0 24px rgba(34,211,238,0.08);
}
.upload-zone.dragover {
  border-color: #22D3EE;
  background: rgba(34,211,238,0.08);
  box-shadow: 0 0 32px rgba(34,211,238,0.15);
}

/* ── Topbar action buttons ──────────────────────────────────── */
.topbar-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(34,211,238,0.05);
  border: 1px solid rgba(34,211,238,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}
.topbar-btn:hover { background: rgba(34,211,238,0.1); border-color: rgba(34,211,238,0.28); transform: scale(1.08); }

/* ── Search bar ─────────────────────────────────────────────── */
.search-bar {
  width: 100%; display: flex; align-items: center; gap: 7px;
  padding: 7px 9px; border-radius: 8px;
  background: rgba(34,211,238,0.04); border: 1px solid rgba(34,211,238,0.1);
  color: rgba(226,248,255,0.3); font-size: 12px; cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.search-bar:hover { background: rgba(34,211,238,0.08); border-color: rgba(34,211,238,0.2); }

/* ── Sign out button ────────────────────────────────────────── */
.signout-btn {
  width: 100%; display: flex; align-items: center; gap: 7px;
  padding: 7px 9px; border-radius: 8px;
  background: transparent; border: 1px solid rgba(34,211,238,0.08);
  color: rgba(226,248,255,0.3); font-size: 12px; cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.signout-btn:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2); color: #EF4444; }

/* ── Checkbox items ─────────────────────────────────────────── */
.check-circle {
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.check-circle.selected { box-shadow: 0 0 8px rgba(34,211,238,0.3); }

/* ── Utility ────────────────────────────────────────────────── */
.transition-all { transition: all 0.15s ease; }
`;
  fs.writeFileSync(gPath, gcss, 'utf8');
  console.log('  \u2713 globals.css (interaction classes)');
}

// ── 2. DASHBOARD PAGE — clean stat cards, classNames ──────────
const dash = [];
const d = s => dash.push(s);
d("'use client';");
d("import { useEffect, useState } from 'react';");
d("import { createClient } from '@/lib/supabase/client';");
d("import Topbar from '@/components/layout/topbar';");
d("import { FileText, MessageSquare, Database, TrendingUp, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';");
d("");
d("export default function DashboardPage() {");
d("  const [profile, setProfile] = useState<any>(null);");
d("  const [docs, setDocs]       = useState<any[]>([]);");
d("  const supabase = createClient();");
d("");
d("  useEffect(() => {");
d("    supabase.auth.getUser().then(async ({ data:{user} }) => {");
d("      if (!user) return;");
d("      const { data:p } = await supabase.from('profiles').select('*').eq('id',user.id).single();");
d("      setProfile(p);");
d("      const { data:dd } = await supabase.from('documents').select('*').order('created_at',{ascending:false}).limit(6);");
d("      setDocs(dd||[]);");
d("    });");
d("  }, []);");
d("");
d("  const stats = [");
d("    { icon:FileText,      label:'Documents',   value:String(docs.length), sub:'uploaded',          accent:'#22D3EE', trend:'+2 this week' },");
d("    { icon:Database,      label:'Chunks',      value:'—',                  sub:'vector embeddings', accent:'#F59E0B', trend:'indexing' },");
d("    { icon:MessageSquare, label:'AI Queries',  value:'—',                  sub:'answered',          accent:'#6366F1', trend:'today' },");
d("    { icon:TrendingUp,    label:'Accuracy',    value:'94.2%',              sub:'citation precision', accent:'#22C55E', trend:'↑ improving' },");
d("  ];");
d("");
d("  return (");
d("    <div style={{ minHeight:'100vh', background:'#030B14' }}>");
d("      <Topbar title='Dashboard' />");
d("      <div style={{ padding:'24px' }}>");
d("");
d("        {/* Welcome banner */}");
d("        <div className='card-base' style={{ padding:'20px 24px', marginBottom:'18px', background:'linear-gradient(135deg,rgba(34,211,238,0.06),rgba(5,18,35,0.95))', border:'1px solid rgba(34,211,238,0.14)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>");
d("          <div>");
d("            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>");
d("              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 8px #22C55E', animation:'glowPulse 2s ease-in-out infinite' }} />");
d("              <span style={{ fontSize:'10px', color:'rgba(34,211,238,0.6)', fontWeight:600, letterSpacing:'1px' }}>SYSTEM ONLINE</span>");
d("            </div>");
d("            <h2 style={{ fontSize:'20px', fontWeight:800, color:'#E2F8FF', letterSpacing:'-0.5px', margin:'0 0 3px' }}>Welcome back{profile?.full_name ? ', '+profile.full_name : ''}.</h2>");
d("            <p style={{ fontSize:'13px', color:'rgba(226,248,255,0.4)', margin:0 }}>Your enterprise knowledge base is ready.</p>");
d("          </div>");
d("          {profile?.role && (");
d("            <div style={{ padding:'5px 13px', borderRadius:'20px', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.2)', fontSize:'11px', color:'#22D3EE', fontWeight:700, letterSpacing:'0.5px' }}>");
d("              {profile.role.toUpperCase()}");
d("            </div>");
d("          )}");
d("        </div>");
d("");
d("        {/* Stat cards — no decorative balls */}");
d("        <div className='stat-grid' style={{ marginBottom:'18px' }}>");
d("          {stats.map(({ icon:Icon, label, value, sub, accent, trend }) => (");
d("            <div key={label} className='stat-card' style={{ '--accent': accent } as React.CSSProperties}>");
d("              {/* Top row: icon + trend */}");
d("              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>");
d("                <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:accent+'14', border:'1px solid '+accent+'22', display:'flex', alignItems:'center', justifyContent:'center' }}>");
d("                  <Icon size={16} color={accent} />");
d("                </div>");
d("                <span style={{ fontSize:'10px', color:accent, fontWeight:600, background:accent+'12', padding:'2px 7px', borderRadius:'8px', border:'1px solid '+accent+'20' }}>{trend}</span>");
d("              </div>");
d("              {/* Value */}");
d("              <div style={{ fontSize:'28px', fontWeight:900, color:'#E2F8FF', letterSpacing:'-1px', lineHeight:1, marginBottom:'4px' }}>{value}</div>");
d("              {/* Label */}");
d("              <div style={{ fontSize:'12px', fontWeight:600, color:'rgba(226,248,255,0.7)', marginBottom:'2px' }}>{label}</div>");
d("              <div style={{ fontSize:'10px', color:'rgba(226,248,255,0.28)' }}>{sub}</div>");
d("            </div>");
d("          ))}");
d("        </div>");
d("");
d("        {/* Recent docs */}");
d("        <div className='card-base' style={{ padding:'0' }}>");
d("          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(34,211,238,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>");
d("            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#E2F8FF', margin:0 }}>Recent Documents</h3>");
d("            <a href='/documents' style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:'#22D3EE', textDecoration:'none', fontWeight:500 }} className='transition-all'>View all <ArrowUpRight size={11} /></a>");
d("          </div>");
d("          <div style={{ padding:'10px' }}>");
d("            {docs.length === 0 ? (");
d("              <div style={{ textAlign:'center', padding:'32px', color:'rgba(226,248,255,0.3)', fontSize:'13px' }}>");
d("                No documents yet. <a href='/documents' style={{ color:'#22D3EE', textDecoration:'none' }}>Upload your first →</a>");
d("              </div>");
d("            ) : docs.map(doc => {");
d("              const sc = doc.status==='ready' ? '#22C55E' : doc.status==='failed' ? '#EF4444' : '#22D3EE';");
d("              return (");
d("                <div key={doc.id} className='list-row' style={{ marginBottom:'5px' }}>");
d("                  <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:'rgba(34,211,238,0.08)', border:'1px solid rgba(34,211,238,0.14)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:800, color:'#22D3EE', flexShrink:0 }}>");
d("                    {doc.file_type?.toUpperCase()?.slice(0,3)||'DOC'}");
d("                  </div>");
d("                  <div style={{ flex:1, overflow:'hidden' }}>");
d("                    <div style={{ fontSize:'12px', color:'#E2F8FF', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.filename}</div>");
d("                    <div style={{ fontSize:'10px', color:'rgba(226,248,255,0.3)', marginTop:'1px' }}>{new Date(doc.created_at).toLocaleDateString()}</div>");
d("                  </div>");
d("                  <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'2px 8px', borderRadius:'9px', fontSize:'9px', fontWeight:600, background:sc+'12', color:sc, border:'1px solid '+sc+'25', flexShrink:0 }}>");
d("                    {doc.status==='ready' ? <CheckCircle size={9} /> : <Clock size={9} />}");
d("                    {doc.status}");
d("                  </div>");
d("                </div>");
d("              );");
d("            })}");
d("          </div>");
d("        </div>");
d("      </div>");
d("    </div>");
d("  );");
d("}");
write('app/(dashboard)/dashboard/page.tsx', dash.join('\n'));

// ── 3. SIDEBAR — classNames for hover ─────────────────────────
const sb = [];
const s = x => sb.push(x);
s("'use client';");
s("import Link from 'next/link';");
s("import { usePathname } from 'next/navigation';");
s("import { createClient } from '@/lib/supabase/client';");
s("import { useRouter } from 'next/navigation';");
s("import { BarChart2, FileText, MessageSquare, Settings, LogOut, Search, Shield } from 'lucide-react';");
s("");
s("const nav = [");
s("  { href:'/dashboard', icon:BarChart2,     label:'Dashboard' },");
s("  { href:'/documents', icon:FileText,      label:'Documents'  },");
s("  { href:'/chat',      icon:MessageSquare, label:'AI Chat'    },");
s("  { href:'/access',    icon:Shield,        label:'Access'     },");
s("  { href:'/analytics', icon:BarChart2,     label:'Analytics'  },");
s("  { href:'/settings',  icon:Settings,      label:'Settings'   },");
s("];");
s("");
s("export default function Sidebar({ onSearch }: { onSearch?:()=>void }) {");
s("  const path=usePathname(), router=useRouter(), supabase=createClient();");
s("  const logout = async () => { await supabase.auth.signOut(); router.push('/'); };");
s("  return (");
s("    <aside style={{ width:'220px', height:'100vh', display:'flex', flexDirection:'column', background:'rgba(3,8,18,0.97)', borderRight:'1px solid rgba(34,211,238,0.08)', position:'sticky', top:0, backdropFilter:'blur(20px)' }}>");
s("      {/* Logo */}");
s("      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid rgba(34,211,238,0.06)' }}>");
s("        <Link href='/dashboard' style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>");
s("          <div style={{ width:'30px', height:'30px', position:'relative', flexShrink:0 }}>");
s("            <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.4)', animation:'glowPulse 2.5s ease-in-out infinite' }} />");
s("            <div style={{ position:'absolute', inset:'5px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />");
s("            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'7px', height:'7px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 6px #22D3EE' }} />");
s("          </div>");
s("          <div><div style={{ fontWeight:800, fontSize:'15px', color:'#E2F8FF', lineHeight:1 }}>PulsarIQ</div><div style={{ fontSize:'9px', color:'rgba(34,211,238,0.45)', letterSpacing:'1.5px', marginTop:'2px' }}>ENTERPRISE AI</div></div>");
s("        </Link>");
s("      </div>");
s("      {/* Search */}");
s("      <div style={{ padding:'10px 10px 6px' }}>");
s("        <button onClick={onSearch} className='search-bar'>");
s("          <Search size={12} color='rgba(34,211,238,0.5)' />");
s("          <span style={{ flex:1, textAlign:'left' }}>Search...</span>");
s("          <span style={{ fontSize:'10px', color:'rgba(34,211,238,0.3)', background:'rgba(34,211,238,0.06)', padding:'1px 5px', borderRadius:'4px' }}>\\u2318K</span>");
s("        </button>");
s("      </div>");
s("      {/* Nav */}");
s("      <nav style={{ flex:1, padding:'4px 10px', display:'flex', flexDirection:'column', gap:'1px' }}>");
s("        <div style={{ fontSize:'9px', color:'rgba(34,211,238,0.3)', letterSpacing:'1.5px', padding:'8px 4px 4px', fontWeight:600 }}>NAVIGATION</div>");
s("        {nav.map(({ href, icon:Icon, label }) => {");
s("          const active = path===href || path.startsWith(href+'/');");
s("          return (");
s("            <Link key={href} href={href} className={'sidebar-item'+(active?' active':'')}>");
s("              <Icon size={14} color={active?'#22D3EE':'rgba(226,248,255,0.28)'} style={{ transition:'color 0.15s ease', flexShrink:0 }} />");
s("              <span style={{ fontSize:'13px', fontWeight:active?600:400, color:active?'#E2F8FF':'rgba(226,248,255,0.38)' }}>{label}</span>");
s("              {active && <div style={{ marginLeft:'auto', width:'4px', height:'4px', borderRadius:'50%', background:'#22D3EE', boxShadow:'0 0 6px #22D3EE' }} />}");
s("            </Link>");
s("          );");
s("        })}");
s("      </nav>");
s("      {/* Signout */}");
s("      <div style={{ padding:'10px', borderTop:'1px solid rgba(34,211,238,0.06)' }}>");
s("        <button onClick={logout} className='signout-btn'>");
s("          <LogOut size={13} /><span>Sign out</span>");
s("        </button>");
s("      </div>");
s("    </aside>");
s("  );");
s("}");
write('components/layout/sidebar.tsx', sb.join('\n'));

// ── 4. TOPBAR — className buttons ─────────────────────────────
write('components/layout/topbar.tsx', [
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
  "        <button className='topbar-btn'><Bell size={13} color='rgba(34,211,238,0.5)' /></button>",
  "        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#22D3EE,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', boxShadow:'0 0 10px rgba(34,211,238,0.3)', cursor:'pointer', transition:'box-shadow 0.15s ease, transform 0.15s ease' }} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.08)';(e.currentTarget as HTMLElement).style.boxShadow='0 0 18px rgba(34,211,238,0.5)';}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)';(e.currentTarget as HTMLElement).style.boxShadow='0 0 10px rgba(34,211,238,0.3)';}}>",
  "          {user?.email?.[0]?.toUpperCase() || 'U'}",
  "        </div>",
  "      </div>",
  "    </header>",
  "  );",
  "}",
].join('\n'));

// ── 5. AUTH PAGES — className inputs + buttons ─────────────────
write('app/(auth)/login/page.tsx', [
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
  "  return (",
  "    <div style={{ minHeight:'100vh', background:'#030B14', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>",
  "      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'350px', background:'radial-gradient(ellipse,rgba(34,211,238,0.07),transparent)', pointerEvents:'none' }} />",
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
  "            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>Work Email</label><input type='email' required value={email} onChange={e=>setEmail(e.target.value)} placeholder='you@company.com' className='inp-field' /></div>",
  "            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>Password</label><input type='password' required value={password} onChange={e=>setPassword(e.target.value)} placeholder='••••••••' className='inp-field' /></div>",
  "            {error && <div style={{ fontSize:'11px', color:'#EF4444', padding:'7px 10px', background:'rgba(239,68,68,0.08)', borderRadius:'7px', border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}",
  "            <button type='submit' disabled={loading} className='btn-grad' style={{ padding:'11px', borderRadius:'9px', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', marginTop:'4px', boxShadow:'0 4px 20px rgba(34,211,238,0.3)' }}>{loading?'Signing in...':'Sign In'} {!loading&&<ArrowRight size={14}/>}</button>",
  "          </form>",
  "          <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(226,248,255,0.3)', marginTop:'18px', marginBottom:0 }}>New to PulsarIQ? <Link href='/signup' style={{ color:'#22D3EE', fontWeight:600, textDecoration:'none' }}>Create workspace</Link></p>",
  "        </div>",
  "      </div>",
  "    </div>",
  "  );",
  "}",
].join('\n'));

console.log('\n  \u2705 Interactive states complete!\n');
console.log('  What changed:');
console.log('  \u2713 globals.css     - 15 interaction CSS classes added');
console.log('  \u2713 Buttons         - hover lift + glow + scale + active press');
console.log('  \u2713 Stat cards      - no balls, left accent bar, trend chip instead');
console.log('  \u2713 List rows       - hover shift right + highlight');
console.log('  \u2713 Sidebar links   - smooth hover fill');
console.log('  \u2713 Input fields    - focus glow + border highlight');
console.log('  \u2713 Nav items       - color fade on hover');
console.log('  \u2713 Upload zone     - hover + dragover states');
console.log('  \u2713 Sign out btn    - hover turns red');
console.log('  \u2713 Avatar          - hover scale + glow');
console.log('\n  Run: rmdir /s /q .next && npm run dev\n');
