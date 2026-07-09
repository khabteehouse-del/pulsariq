// PulsarIQ — Phase 5: Landing Page + Command Palette + Pipeline Visualizer
// Run from C:\pulsariq: node phase5.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(filePath, content) {
  const full = path.join(root, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  \u2713', filePath);
}

console.log('\n  PulsarIQ \u2014 Phase 5: Landing + Command Palette + Visualizer\n');

fs.mkdirSync(path.join(root, 'components', 'layout'), { recursive: true });
fs.mkdirSync(path.join(root, 'components', 'landing'), { recursive: true });
console.log('  \u2713 Directories\n');

// ── 1. Landing Page (replaces app/page.tsx) ───────────────────
write('app/page.tsx', String.raw`
'use client';
import { useEffect, useRef } from 'react';
import { Zap, ArrowRight, Shield, Database, MessageSquare, FileText, Users, Lock } from 'lucide-react';

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef   = useRef<{ frame: number; stars: {x:number;y:number;r:number;phase:number;speed:number}[]; particles: {angle:number;radius:number;speed:number;size:number}[]; rings: {r:number;op:number}[] }>({ frame:0, stars:[], particles:[], rings:[] });
  const animRef   = useRef<number>(0);
  const themeRef  = useRef({ star: '#818CF8' });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    dataRef.current.stars = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.011 + 0.003,
    }));

    dataRef.current.particles = [
      ...Array.from({ length: 10 }, (_, i) => ({ angle: (i/10)*Math.PI*2, radius: 95,  speed: 0.004,   size: 1.8 })),
      ...Array.from({ length: 14 }, (_, i) => ({ angle: (i/14)*Math.PI*2, radius: 155, speed: -0.0025, size: 1.5 })),
      ...Array.from({ length: 18 }, (_, i) => ({ angle: (i/18)*Math.PI*2, radius: 215, speed: 0.0016,  size: 1.2 })),
    ];

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const d = dataRef.current;
      const w = W(), h = H();
      const cx = w / 2, cy = h * 0.44;
      ctx.clearRect(0, 0, w, h);
      d.frame++;

      d.stars.forEach(s => {
        s.phase += s.speed;
        const op = (Math.sin(s.phase) + 1) / 2 * 0.6 + 0.08;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129,140,248,' + op.toFixed(2) + ')';
        ctx.fill();
      });

      d.rings = d.rings.filter(r => r.op > 0);
      if (d.frame % 90 === 0) d.rings.push({ r: 30, op: 0.5 });
      d.rings.forEach(r => { r.r += 2; r.op -= 0.005;
        ctx.beginPath(); ctx.arc(cx, cy, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34,211,238,' + r.op.toFixed(3) + ')';
        ctx.lineWidth = 1.5; ctx.stroke();
      });

      const bAngle = d.frame * 0.006;
      for (let i = 0; i < 2; i++) {
        const a = bAngle + i * Math.PI;
        const len = Math.min(w, h) * 0.38;
        const bx = cx + Math.cos(a) * len, by = cy + Math.sin(a) * len;
        const g = ctx.createLinearGradient(cx, cy, bx, by);
        g.addColorStop(0, 'rgba(99,102,241,0.5)'); g.addColorStop(0.6, 'rgba(99,102,241,0.08)'); g.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.beginPath(); const sp = 0.065;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a - sp) * len, cy + Math.sin(a - sp) * len);
        ctx.lineTo(cx + Math.cos(a + sp) * len, cy + Math.sin(a + sp) * len);
        ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      }

      [95, 155, 215].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99,102,241,' + (0.06 - i * 0.015) + ')';
        ctx.lineWidth = 1; ctx.setLineDash([3, 9]); ctx.stroke(); ctx.setLineDash([]);
      });

      d.particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;
        const gp = ctx.createRadialGradient(px, py, 0, px, py, p.size * 5);
        gp.addColorStop(0, 'rgba(34,211,238,0.7)'); gp.addColorStop(1, 'rgba(34,211,238,0)');
        ctx.beginPath(); ctx.arc(px, py, p.size * 5, 0, Math.PI * 2); ctx.fillStyle = gp; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fillStyle = '#A5F3FC'; ctx.fill();
      });

      const pulse = (Math.sin(d.frame * 0.04) + 1) / 2;
      const glowR = 55 + pulse * 28;
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g1.addColorStop(0, 'rgba(99,102,241,' + (0.38 + pulse * 0.18).toFixed(2) + ')');
      g1.addColorStop(0.5, 'rgba(99,102,241,0.07)'); g1.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fillStyle = g1; ctx.fill();

      const cor = ctx.createRadialGradient(cx, cy, 10, cx, cy, 38);
      cor.addColorStop(0, 'rgba(255,255,255,' + (0.22 + pulse * 0.12).toFixed(2) + ')'); cor.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fillStyle = cor; ctx.fill();

      const cR = 11 + pulse * 5;
      const gc = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR);
      gc.addColorStop(0, '#FFFFFF'); gc.addColorStop(0.3, '#E0E7FF'); gc.addColorStop(1, '#6366F1');
      ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2); ctx.fillStyle = gc; ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const features = [
    { icon: Database,      title: 'RAG Pipeline',       desc: 'Upload once, query forever. Every answer grounded in your documents with exact source citations.',        color: '#6366F1' },
    { icon: Users,         title: 'Role Based Access',  desc: 'Admin, Manager, Viewer. Full multi-tenant architecture built for enterprise organisations at any scale.',  color: '#22D3EE' },
    { icon: Lock,          title: '100% Private',       desc: 'Self-hosted AI via Ollama. Your documents never leave your servers. Zero third-party exposure ever.',      color: '#A855F7' },
    { icon: FileText,      title: 'Every Format',       desc: 'PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML. Drag and drop any file — we handle the rest automatically.',       color: '#F59E0B' },
    { icon: MessageSquare, title: 'Streaming Chat',     desc: 'Real-time AI responses with inline source highlighting. Ask questions the way you naturally think.',        color: '#EC4899' },
    { icon: Zap,           title: 'Instant Search',     desc: 'Semantic vector search across millions of chunks in milliseconds. Speed meets enterprise intelligence.',   color: '#10B981' },
  ];

  return (
    <div style={{ width:'100%', minHeight:'100vh', background:'#07080F', fontFamily:"'Inter','SF Pro Display',sans-serif", color:'#F1F5F9', overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:'62px', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', backdropFilter:'blur(24px)', background:'rgba(7,8,15,0.72)', borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(99,102,241,0.45)' }}>
            <Zap size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:'16px', letterSpacing:'-0.2px', lineHeight:1 }}>PulsarIQ</div>
            <div style={{ fontSize:'9px', color:'#64748B', letterSpacing:'1.2px' }}>ENTERPRISE AI</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'34px' }}>
          {['Features','Enterprise','Pricing','Docs'].map(item => (
            <span key={item} style={{ fontSize:'14px', color:'#64748B', cursor:'pointer' }}>{item}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <a href="/login" style={{ padding:'8px 18px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.09)', background:'transparent', color:'#F1F5F9', fontSize:'13px', cursor:'pointer', textDecoration:'none' }}>Sign In</a>
          <a href="/signup" style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 20px', borderRadius:'9px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer', textDecoration:'none', boxShadow:'0 4px 20px rgba(99,102,241,0.35)' }}>
            Get Started <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position:'relative', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'180px', background:'linear-gradient(to bottom,transparent,#07080F)', pointerEvents:'none', zIndex:2 }} />

        <div style={{ position:'relative', zIndex:5, textAlign:'center', padding:'0 24px', maxWidth:'760px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'5px 16px', borderRadius:'30px', border:'1px solid rgba(34,211,238,0.3)', background:'rgba(34,211,238,0.07)', marginBottom:'28px', fontSize:'12px', color:'#22D3EE', fontWeight:500 }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#22D3EE', boxShadow:'0 0 8px #22D3EE' }} />
            Self-Hosted Enterprise AI · Zero Data Exposure
          </div>

          <h1 style={{ fontSize:'clamp(36px,5.5vw,70px)', fontWeight:800, lineHeight:1.06, margin:'0 0 22px', letterSpacing:'-2px' }}>
            Your documents.<br />
            <span style={{ background:'linear-gradient(90deg,#6366F1,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Your intelligence.
            </span>
          </h1>

          <p style={{ fontSize:'18px', color:'#64748B', lineHeight:1.7, margin:'0 auto 38px', maxWidth:'500px' }}>
            Upload any file. Ask any question. PulsarIQ searches your entire knowledge base with AI — grounded answers, exact citations, every time.
          </p>

          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/signup" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'14px 30px', borderRadius:'12px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 36px rgba(99,102,241,0.4)', textDecoration:'none' }}>
              Start Free <ArrowRight size={16} />
            </a>
            <a href="/dashboard" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'14px 30px', borderRadius:'12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'#F1F5F9', fontSize:'15px', cursor:'pointer', textDecoration:'none' }}>
              Open Dashboard
            </a>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'24px', marginTop:'40px', flexWrap:'wrap' }}>
            {[{icon:Shield,label:'SOC2 Ready'},{icon:Database,label:'pgvector Search'},{icon:Lock,label:'On-Premise AI'}].map(({ icon:Icon, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'#64748B' }}>
                <Icon size={13} color="#6366F1" />{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding:'80px 40px 100px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'60px' }}>
          <p style={{ fontSize:'11px', color:'#22D3EE', letterSpacing:'2.5px', fontWeight:700, marginBottom:'14px' }}>BUILT FOR ENTERPRISE</p>
          <h2 style={{ fontSize:'clamp(28px,3vw,40px)', fontWeight:800, margin:0, letterSpacing:'-1px' }}>Everything your team needs</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'14px' }}>
          {features.map(({ icon:Icon, title, desc, color }) => (
            <div key={title} style={{ padding:'26px', borderRadius:'16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.12)', backdropFilter:'blur(16px)', cursor:'pointer' }}>
              <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:color + '12', border:'1px solid ' + color + '22', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px' }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize:'15px', fontWeight:700, margin:'0 0 9px', letterSpacing:'-0.2px' }}>{title}</h3>
              <p style={{ fontSize:'13px', color:'#64748B', lineHeight:1.65, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ margin:'0 40px 80px', borderRadius:'20px', padding:'56px 40px', background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(34,211,238,0.06))', border:'1px solid rgba(99,102,241,0.2)', textAlign:'center' }}>
        <p style={{ fontSize:'12px', color:'#22D3EE', letterSpacing:'2px', fontWeight:700, marginBottom:'16px' }}>GET STARTED TODAY</p>
        <h2 style={{ fontSize:'32px', fontWeight:800, margin:'0 0 14px', letterSpacing:'-0.8px' }}>Ready to make your knowledge intelligent?</h2>
        <p style={{ fontSize:'15px', color:'#64748B', margin:'0 0 32px' }}>Join companies using PulsarIQ to transform how their teams interact with documents.</p>
        <a href="/signup" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 32px', borderRadius:'12px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', border:'none', color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 32px rgba(99,102,241,0.35)', textDecoration:'none' }}>
          Start Building Free <ArrowRight size={16} />
        </a>
      </div>

      {/* FOOTER */}
      <div style={{ padding:'28px 40px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'24px', height:'24px', borderRadius:'7px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={12} color="#fff" />
          </div>
          <span style={{ fontWeight:700, fontSize:'14px' }}>PulsarIQ</span>
        </div>
        <span style={{ fontSize:'12px', color:'#64748B' }}>2026 PulsarIQ · Enterprise AI Platform</span>
        <div style={{ display:'flex', gap:'20px' }}>
          {['Privacy','Terms','Security'].map(item => (
            <span key={item} style={{ fontSize:'12px', color:'#64748B', cursor:'pointer' }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
`);

// ── 2. Command Palette ────────────────────────────────────────
write('components/layout/command-palette.tsx', String.raw`
'use client';
import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, BarChart2, Settings, Upload, Search, Zap } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const ACTIONS = [
  { icon: LayoutDashboard, label: 'Go to Dashboard',  href: '/dashboard',  group: 'Navigation' },
  { icon: FileText,        label: 'Go to Documents',  href: '/documents',  group: 'Navigation' },
  { icon: MessageSquare,   label: 'Go to AI Chat',    href: '/chat',       group: 'Navigation' },
  { icon: BarChart2,       label: 'Go to Analytics',  href: '/analytics',  group: 'Navigation' },
  { icon: Settings,        label: 'Go to Settings',   href: '/settings',   group: 'Navigation' },
  { icon: Upload,          label: 'Upload Document',  href: '/documents',  group: 'Actions'    },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
    setQuery('');
  };

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = query
    ? ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : ACTIONS;

  const groups = Array.from(new Set(filtered.map(a => a.group)));

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:9999, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'120px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:'560px', maxWidth:'90vw', borderRadius:'16px', background:'rgba(13,15,28,0.97)', border:'1px solid rgba(99,102,241,0.3)', backdropFilter:'blur(24px)', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.15)' }}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 16px', borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 12px rgba(99,102,241,0.4)' }}>
            <Zap size={14} color="#fff" />
          </div>
          <Search size={14} color="#64748B" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, documents, actions..."
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'#F1F5F9', fontSize:'14px', fontFamily:'Inter,sans-serif' }}
          />
          <kbd style={{ fontSize:'11px', color:'#475569', padding:'2px 6px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'4px' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight:'360px', overflowY:'auto', padding:'8px' }}>
          {filtered.length === 0 && (
            <div style={{ padding:'24px', textAlign:'center', color:'#475569', fontSize:'13px' }}>
              No results for "{query}"
            </div>
          )}
          {groups.map(group => (
            <div key={group}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'1px', padding:'8px 10px 4px' }}>{group}</div>
              {filtered.filter(a => a.group === group).map(action => (
                <div
                  key={action.label}
                  onClick={() => handleSelect(action.href)}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <action.icon size={14} color="#6366F1" />
                  </div>
                  <span style={{ fontSize:'13px', color:'#F1F5F9' }}>{action.label}</span>
                  <div style={{ marginLeft:'auto', fontSize:'11px', color:'#475569', padding:'2px 6px', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px' }}>
                    Enter
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(99,102,241,0.1)', display:'flex', gap:'16px', alignItems:'center' }}>
          <span style={{ fontSize:'11px', color:'#334155' }}>
            <kbd style={{ background:'rgba(255,255,255,0.05)', borderRadius:'3px', padding:'1px 5px', marginRight:'4px' }}>Ctrl</kbd>
            <kbd style={{ background:'rgba(255,255,255,0.05)', borderRadius:'3px', padding:'1px 5px' }}>K</kbd>
            {' '}to toggle
          </span>
          <span style={{ fontSize:'11px', color:'#334155', marginLeft:'auto' }}>
            Powered by PulsarIQ
          </span>
        </div>
      </div>
    </div>
  );
}
`);

// ── 3. Dashboard Layout with Command Palette ──────────────────
write('app/(dashboard)/layout.tsx', String.raw`
'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/sidebar';
import CommandPalette from '@/components/layout/command-palette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#07080F', fontFamily:'Inter,sans-serif' }}>
      <Sidebar onCommandPalette={() => setCmdOpen(true)} />
      <div style={{ flex:1, marginLeft:210, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {children}
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
`);

// ── 4. Updated Sidebar with ⌘K button ────────────────────────
write('components/layout/sidebar.tsx', String.raw`
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderOpen, MessageSquare, BarChart2, Shield, Settings, Zap, LogOut, Command } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  onCommandPalette?: () => void;
}

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/documents', icon: FolderOpen,       label: 'Documents' },
  { href: '/chat',      icon: MessageSquare,    label: 'AI Chat'   },
  { href: '/analytics', icon: BarChart2,        label: 'Analytics' },
  { href: '/access',    icon: Shield,           label: 'Access'    },
  { href: '/settings',  icon: Settings,         label: 'Settings'  },
];

export default function Sidebar({ onCommandPalette }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside style={{ width:210, flexShrink:0, height:'100vh', position:'fixed', top:0, left:0, background:'rgba(13,15,28,0.9)', borderRight:'1px solid rgba(99,102,241,0.15)', backdropFilter:'blur(24px)', display:'flex', flexDirection:'column', padding:'20px 10px', zIndex:50 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 12px', marginBottom:16 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(99,102,241,0.4)', flexShrink:0 }}>
          <Zap size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:'#F1F5F9', lineHeight:1 }}>PulsarIQ</div>
          <div style={{ fontSize:9, color:'#64748B', letterSpacing:'1px' }}>ENTERPRISE AI</div>
        </div>
      </div>

      {/* ⌘K Button */}
      <button
        onClick={onCommandPalette}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', marginBottom:12, borderRadius:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.15)', cursor:'pointer', width:'100%', color:'#475569' }}
      >
        <Search size={13} color="#64748B" />
        <span style={{ flex:1, textAlign:'left', fontSize:12, color:'#475569' }}>Search...</span>
        <div style={{ display:'flex', gap:2 }}>
          <kbd style={{ fontSize:9, background:'rgba(255,255,255,0.05)', borderRadius:3, padding:'1px 4px', color:'#475569' }}>Ctrl</kbd>
          <kbd style={{ fontSize:9, background:'rgba(255,255,255,0.05)', borderRadius:3, padding:'1px 4px', color:'#475569' }}>K</kbd>
        </div>
      </button>

      <nav style={{ display:'flex', flexDirection:'column', gap:3, flex:1 }}>
        {nav.map(({ href, icon:Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{ textDecoration:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:active ? 'rgba(99,102,241,0.1)' : 'transparent', border:'1px solid ' + (active ? 'rgba(99,102,241,0.2)' : 'transparent'), cursor:'pointer', transition:'all 0.2s' }}>
                <Icon size={15} color={active ? '#6366F1' : 'rgba(255,255,255,0.28)'} />
                <span style={{ fontSize:13, fontWeight:active ? 600 : 400, color:active ? '#F1F5F9' : 'rgba(255,255,255,0.38)' }}>{label}</span>
                {active && <div style={{ marginLeft:'auto', width:5, height:5, borderRadius:'50%', background:'#6366F1', boxShadow:'0 0 7px #6366F1' }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={signOut} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'none', border:'none', cursor:'pointer', width:'100%' }}>
          <LogOut size={13} color="rgba(255,255,255,0.2)" />
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.2)' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function Search({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}
`);

// ── 5. Pipeline Visualizer on Documents Page ──────────────────
write('components/documents/pipeline-status.tsx', String.raw`
'use client';

const STEPS = ['Pending', 'Processing', 'Chunking', 'Embedding', 'Ready'];

const STEP_INDEX: Record<string, number> = {
  pending:    0,
  processing: 1,
  chunking:   2,
  embedding:  3,
  ready:      4,
  failed:     -1,
};

interface PipelineStatusProps {
  status: string;
}

export default function PipelineStatus({ status }: PipelineStatusProps) {
  if (status === 'ready') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)' }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:'#22C55E' }} />
        <span style={{ fontSize:10, color:'#22C55E', fontWeight:600 }}>Ready</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:'#EF4444' }} />
        <span style={{ fontSize:10, color:'#EF4444', fontWeight:600 }}>Failed</span>
      </div>
    );
  }

  const current = STEP_INDEX[status] ?? 0;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      {STEPS.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        const pending = i > current;
        return (
          <div key={step} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div
              title={step}
              style={{
                width: active ? 8 : 6,
                height: active ? 8 : 6,
                borderRadius: '50%',
                background: done ? '#6366F1' : active ? '#22D3EE' : 'rgba(255,255,255,0.15)',
                boxShadow: active ? '0 0 8px #22D3EE' : done ? '0 0 4px rgba(99,102,241,0.5)' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
            {i < STEPS.length - 1 && (
              <div style={{ width:12, height:1, background:done ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }} />
            )}
          </div>
        );
      })}
      <span style={{ fontSize:10, color:'#6366F1', fontWeight:600, marginLeft:4, textTransform:'capitalize' }}>{status}</span>
    </div>
  );
}
`);

console.log('\n  \u2705 Phase 5 complete!\n');
console.log('  What was built:');
console.log('  \u2713 Landing page with pulsar hero animation');
console.log('  \u2713 Command palette (Ctrl+K)');
console.log('  \u2713 Updated sidebar with search trigger');
console.log('  \u2713 Dashboard layout with keyboard shortcut');
console.log('  \u2713 Pipeline visualizer component\n');
console.log('  npm run dev \u2192 http://localhost:3000\n');
