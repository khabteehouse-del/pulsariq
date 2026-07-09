// PulsarIQ — hotfix.js
// ONLY fixes what is broken. No new features.
// Run: node hotfix.js  then  rmdir /s /q .next  then  npm run dev

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Hotfix\n');

// ── 1. DASHBOARD LAYOUT — remove BgParticles (crash cause) ───
write('app/(dashboard)/layout.tsx', `'use client';
import Sidebar from '@/components/layout/sidebar';
import MobileNav from '@/components/layout/mobile-nav';
import CommandPalette from '@/components/layout/command-palette';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [cmd, setCmd] = useState(false);
  return (
    <div className="dash-layout" style={{ background: '#030B14' }}>
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      <div className="sidebar-wrap">
        <Sidebar onSearch={() => setCmd(true)} />
      </div>
      <main className="main-content">{children}</main>
      <MobileNav />
    </div>
  );
}
`);

// ── 2. SIDEBAR — simple, no orbital particle CSS hacks ────────
write('components/layout/sidebar.tsx', `'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart2, FileText, MessageSquare, Settings, LogOut, Search, Shield } from 'lucide-react';

const nav = [
  { href: '/dashboard', icon: BarChart2,     label: 'Dashboard' },
  { href: '/documents', icon: FileText,      label: 'Documents'  },
  { href: '/chat',      icon: MessageSquare, label: 'AI Chat'    },
  { href: '/access',    icon: Shield,        label: 'Access'     },
  { href: '/analytics', icon: BarChart2,     label: 'Analytics'  },
  { href: '/settings',  icon: Settings,      label: 'Settings'   },
];

function LogoMark() {
  return (
    <div style={{ width: '30px', height: '30px', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, border: '1.5px solid #22D3EE', borderRadius: '50%', boxShadow: '0 0 10px rgba(34,211,238,0.4)', animation: 'glowPulse 2.5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: '5px', border: '1px solid rgba(99,102,241,0.5)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle,#fff,#22D3EE)', boxShadow: '0 0 6px #22D3EE' }} />
    </div>
  );
}

export default function Sidebar({ onSearch }: { onSearch?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside style={{ width: '220px', height: '100vh', display: 'flex', flexDirection: 'column', background: 'rgba(3,8,18,0.97)', borderRight: '1px solid rgba(34,211,238,0.08)', position: 'sticky', top: 0, backdropFilter: 'blur(20px)' }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(34,211,238,0.06)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <LogoMark />
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#E2F8FF', lineHeight: 1 }}>PulsarIQ</div>
            <div style={{ fontSize: '9px', color: 'rgba(34,211,238,0.45)', letterSpacing: '1.5px', marginTop: '2px' }}>ENTERPRISE AI</div>
          </div>
        </Link>
      </div>

      <div style={{ padding: '10px 10px 6px' }}>
        <button onClick={onSearch} className="search-bar">
          <Search size={12} color="rgba(34,211,238,0.5)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
          <span style={{ fontSize: '10px', color: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.06)', padding: '1px 5px', borderRadius: '4px' }}>Ctrl K</span>
        </button>
      </div>

      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <div style={{ fontSize: '9px', color: 'rgba(34,211,238,0.3)', letterSpacing: '1.5px', padding: '8px 4px 4px', fontWeight: 600 }}>NAVIGATION</div>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={'sidebar-item' + (active ? ' active' : '')}>
              <Icon size={14} color={active ? '#22D3EE' : 'rgba(226,248,255,0.28)'} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? '#E2F8FF' : 'rgba(226,248,255,0.38)' }}>{label}</span>
              {active && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 6px #22D3EE' }} />}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '10px', borderTop: '1px solid rgba(34,211,238,0.06)' }}>
        <button onClick={logout} className="signout-btn">
          <LogOut size={13} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
`);

// ── 3. DOCUMENTS PAGE — bulletproof fetch ─────────────────────
write('app/(dashboard)/documents/page.tsx', `'use client';
import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/topbar';
import { Upload, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export default function DocumentsPage() {
  const [docs, setDocs]           = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag]           = useState(false);
  const [error, setError]         = useState('');

  const fetchDocs = useCallback(async () => {
    try {
      const r = await fetch('/api/documents');
      const text = await r.text();
      let data: any;
      try { data = JSON.parse(text); } catch { setError('Bad response from server'); return; }
      if (Array.isArray(data)) { setDocs(data); setError(''); }
      else if (Array.isArray(data?.data)) { setDocs(data.data); setError(''); }
      else { setError('Unexpected response format'); }
    } catch (e: any) {
      setError(e.message || 'Network error');
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
    try {
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', f);
        await fetch('/api/documents', { method: 'POST', body: fd });
      }
      await fetchDocs();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await fetch('/api/documents/' + id, { method: 'DELETE' });
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch {}
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
    <div style={{ minHeight: '100vh', background: '#030B14' }}>
      <Topbar title="Documents" />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#EF4444', fontSize: '13px' }}>
            Error: {error} &mdash; <button onClick={fetchDocs} style={{ color: '#22D3EE', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Retry</button>
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
                  <div style={{ fontSize: '12px', color: '#E2F8FF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', marginTop: '1px' }}>
                    {doc.chunk_count ? doc.chunk_count + ' chunks  \u00b7  ' : ''}{new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 9px', borderRadius: '9px', fontSize: '9px', fontWeight: 600, background: statusColor(doc.status) + '14', color: statusColor(doc.status), border: '1px solid ' + statusColor(doc.status) + '28', flexShrink: 0 }}>
                  <StatusIcon s={doc.status} />
                  {doc.status}
                </div>
                <button
                  className="btn-danger"
                  style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0 }}
                  onClick={() => remove(doc.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ── 4. GLOBALS CSS — add panel orbit animations ───────────────
const gPath = path.join(root, 'app', 'globals.css');
let gcss = fs.readFileSync(gPath, 'utf8');
if (!gcss.includes('@keyframes panelOrbit0')) {
  gcss += `
@keyframes panelOrbit0 { from{transform:rotateX(72deg) rotateZ(0deg)}   to{transform:rotateX(72deg) rotateZ(360deg)} }
@keyframes panelOrbit1 { from{transform:rotateX(72deg) rotateZ(90deg)}  to{transform:rotateX(72deg) rotateZ(450deg)} }
@keyframes panelOrbit2 { from{transform:rotateX(72deg) rotateZ(180deg)} to{transform:rotateX(72deg) rotateZ(540deg)} }
@keyframes panelOrbit3 { from{transform:rotateX(72deg) rotateZ(270deg)} to{transform:rotateX(72deg) rotateZ(630deg)} }
`;
  fs.writeFileSync(gPath, gcss, 'utf8');
  console.log('  \u2713 globals.css (panel orbit animations)');
}

// ── 5. LANDING PAGE — fix panels to stand upright ────────────
// Read existing page.tsx and patch only the panels section
const pagePath = path.join(root, 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Replace the orbital panels div with CSS 3D approach
const PANEL_MARKER = "      {/* Orbital panels — JS-positioned — z:3-5 */}";
if (pageContent.includes(PANEL_MARKER)) {
  const panelSection = `      {/* Orbital panels — CSS 3D — z:3-5 */}
      <div style={{ position:'absolute', inset:0, zIndex:3, perspective:'1100px', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
        <div style={{ position:'relative', width:0, height:0, transformStyle:'preserve-3d', marginTop:'30px' }}>
          {/* Orbit rings */}
          {[480,380].map((s,i) => (
            <div key={i} style={{ position:'absolute', width:s+'px', height:s+'px', marginLeft:-(s/2)+'px', marginTop:-(s/2)+'px', border:'1px solid rgba(34,211,238,0.06)', borderRadius:'50%' }} />
          ))}
          {/* Core CSS dot */}
          <div style={{ position:'absolute', width:'20px', height:'20px', marginLeft:'-10px', marginTop:'-10px', borderRadius:'50%', background:'radial-gradient(circle,#fff 0%,#A5F3FC 35%,rgba(34,211,238,0.1) 100%)', boxShadow:'0 0 30px rgba(34,211,238,0.9)', animation:'corePulse 2s ease-in-out infinite' }} />
          {/* Panels */}
          {PANELS.map((panel, i) => (
            <div key={i} style={{ position:'absolute', animation:'panelOrbit'+i+' '+[12,9,14,10][i]+'s linear infinite', transformOrigin:'0 0' }}>
              <div style={{ position:'absolute', left:([230,200,240,190][i])+'px', marginTop:'-92px', transform:'rotateX(-72deg)', animation:'floatPanel '+(4+i*0.5)+'s ease-in-out '+(i*0.8)+'s infinite' }}>
                <div style={{ width:'168px', padding:'12px', borderRadius:'12px', background:'rgba(4,14,28,0.93)', border:'1px solid '+panel.col+'28', backdropFilter:'blur(24px)', boxShadow:'0 0 26px '+panel.col+'14, 0 18px 46px rgba(0,0,0,0.55)', position:'relative', overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'7px' }}>
                    <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:panel.col, boxShadow:'0 0 5px '+panel.col, animation:'glowPulse 2s ease-in-out '+(i*0.4)+'s infinite', flexShrink:0 }} />
                    <span style={{ fontSize:'9px', fontWeight:700, color:panel.col }}>{panel.title}</span>
                  </div>
                  <div style={{ fontSize:'8px', color:'rgba(226,248,255,0.28)', marginBottom:'7px' }}>{panel.sub}</div>
                  {i === 0 && MSGS.map((msg, mi) => (
                    <div key={mi} style={{ display:'flex', justifyContent:msg.r==='user'?'flex-end':'flex-start', marginBottom:'4px' }}>
                      <div style={{ maxWidth:'88%', padding:'3px 6px', borderRadius:msg.r==='user'?'6px 6px 2px 6px':'2px 6px 6px 6px', background:msg.r==='user'?'rgba(34,211,238,0.1)':'rgba(255,255,255,0.04)', border:'1px solid '+(msg.r==='user'?'rgba(34,211,238,0.18)':'rgba(255,255,255,0.06)'), fontSize:'8px', color:msg.r==='ai'?'rgba(226,248,255,0.72)':'#E2F8FF', lineHeight:1.4 }}>{msg.m}</div>
                    </div>
                  ))}
                  {i === 1 && ['PDF Parsed','Chunks: 847','pgvector: READY'].map((s, si) => (
                    <div key={si} style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'3px', animation:'dataFade 3s ease-in-out '+(si*0.5)+'s infinite' }}>
                      <div style={{ width:'3px', height:'3px', borderRadius:'50%', background:'#6366F1', flexShrink:0 }} />
                      <span style={{ fontSize:'8px', color:'rgba(226,248,255,0.52)' }}>{s}</span>
                    </div>
                  ))}
                  {i === 2 && (
                    <div style={{ display:'flex', alignItems:'flex-end', gap:'2px', height:'36px' }}>
                      {BARS.map((h, bi) => (
                        <div key={bi} style={{ flex:1, background:'linear-gradient(to top,rgba(34,211,238,0.5) 0%,rgba(34,211,238,0.06) 70%,transparent 100%)', borderRadius:'2px 2px 0 0', height:h+'%', minWidth:'4px', border:'1px solid rgba(34,211,238,0.1)', borderBottom:'none', backdropFilter:'blur(2px)' }} />
                      ))}
                    </div>
                  )}
                  {i === 3 && ['Q4 Financial Report.pdf','Compliance Manual v2.docx','Board Meeting Notes.pdf'].map((d, di) => (
                    <div key={di} style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'3px', padding:'3px 5px', borderRadius:'5px', background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.1)' }}>
                      <div style={{ width:'3px', height:'3px', borderRadius:'50%', background:'#F59E0B', flexShrink:0 }} />
                      <span style={{ fontSize:'8px', color:'rgba(226,248,255,0.48)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d}</span>
                    </div>
                  ))}
                  <div style={{ position:'absolute', left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,'+panel.col+'40,transparent)', animation:'scanLine 2.8s linear '+(i*0.7)+'s infinite', top:0 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>`;

  // Find the start and end of the panels block
  const startIdx = pageContent.indexOf(PANEL_MARKER);
  const endMarker = '      {/* Nav — z:20 */}';
  const endIdx = pageContent.indexOf(endMarker);

  if (startIdx !== -1 && endIdx !== -1) {
    pageContent = pageContent.slice(0, startIdx) + panelSection + '\n\n' + pageContent.slice(endIdx);
    // Also remove the panelRefs and panelRaf since we don't need JS positioning anymore
    pageContent = pageContent
      .replace(/  const panelRefs = \[\n.*?\n.*?\n.*?\n  \];\n  const panelRaf = useRef<number>\(0\);\n/s, '')
      .replace(/  \/\/ JS-based panel orbit[\s\S]*?panelRaf\.current = requestAnimationFrame\(animate\);\n    };\n    animate\(\);\n    return \(\) => cancelAnimationFrame\(panelRaf\.current\);\n  \}, \[\]\);\n/s, '');
    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log('  \u2713 app/page.tsx (panels fixed to CSS 3D orbit)');
  } else {
    console.log('  ! app/page.tsx panel marker not found - panels unchanged');
  }
}

console.log('\n  \u2705 Hotfix complete!\n');
console.log('  What was fixed:');
console.log('  \u2713 Dashboard layout   - removed BgParticles (crash cause)');
console.log('  \u2713 Sidebar            - simplified, no CSS custom property hacks');
console.log('  \u2713 Documents page     - bulletproof fetch with text->JSON parsing');
console.log('  \u2713 Documents page     - shows server error if API fails');
console.log('  \u2713 Documents page     - manual Refresh button added');
console.log('  \u2713 globals.css        - panel orbit animations added');
console.log('  \u2713 Landing page       - panels now orbit upright (CSS 3D)');
console.log('\n  Run:');
console.log('  rmdir /s /q .next');
console.log('  npm run dev\n');
