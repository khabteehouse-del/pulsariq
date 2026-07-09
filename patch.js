// PulsarIQ — patch.js: Fix CSS, chat syntax, login button
// Run: node patch.js → rmdir /s /q .next → npm run dev

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Patch\n');

// ── 1. COMPLETE GLOBALS.CSS (overwrite, no guards) ─────────────
write('app/globals.css', `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:     #030B14;
  --bg1:    #040D18;
  --panel:  rgba(5,18,35,0.9);
  --border: rgba(34,211,238,0.12);
  --cyan:   #22D3EE;
  --gold:   #F59E0B;
  --indigo: #6366F1;
  --green:  #22C55E;
  --red:    #EF4444;
  --t1:     #E2F8FF;
  --t2:     rgba(226,248,255,0.5);
  --t3:     rgba(226,248,255,0.22);
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

/* ── Animations ───────────────────────────────────────────────── */
@keyframes glowPulse    { 0%,100%{opacity:0.5} 50%{opacity:1} }
@keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes fadeUp       { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes crtDot       { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.4)} }
@keyframes wordIn       { from{opacity:0;filter:blur(10px);transform:translateY(6px)} to{opacity:1;filter:blur(0);transform:translateY(0)} }
@keyframes ringCW       { from{transform:rotateX(72deg) rotateZ(0deg)}   to{transform:rotateX(72deg) rotateZ(360deg)} }
@keyframes ringCCW      { from{transform:rotateX(55deg) rotateZ(0deg)}   to{transform:rotateX(55deg) rotateZ(-360deg)} }
@keyframes corePulse    { 0%,100%{box-shadow:0 0 30px rgba(34,211,238,0.7),0 0 60px rgba(34,211,238,0.3)} 50%{box-shadow:0 0 50px rgba(34,211,238,0.9),0 0 100px rgba(34,211,238,0.5)} }
@keyframes scanLine     { 0%{top:0%} 100%{top:100%} }
@keyframes floatPanel   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes dataFade     { 0%{opacity:0;transform:translateY(3px)} 50%{opacity:1} 100%{opacity:0;transform:translateY(-3px)} }
@keyframes barGrow      { 0%,100%{height:20%} 50%{height:100%} }
@keyframes orbitA       { from{transform:rotateX(68deg) rotateZ(0deg)}   to{transform:rotateX(68deg) rotateZ(360deg)} }
@keyframes orbitB       { from{transform:rotateX(52deg) rotateZ(180deg)} to{transform:rotateX(52deg) rotateZ(540deg)} }
@keyframes orbitC       { from{transform:rotateX(62deg) rotateZ(90deg)}  to{transform:rotateX(62deg) rotateZ(-270deg)} }
@keyframes orbitD       { from{transform:rotateX(44deg) rotateZ(270deg)} to{transform:rotateX(44deg) rotateZ(-90deg)} }
@keyframes particleDrift{ 0%{transform:translateY(0) translateX(0)} 33%{transform:translateY(-18px) translateX(8px)} 66%{transform:translateY(-8px) translateX(-10px)} 100%{transform:translateY(0) translateX(0)} }
@keyframes orbitLogo    { from{transform:rotate(0deg) translateX(var(--r)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--r)) rotate(-360deg)} }
@keyframes countUp      { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes agentStep    { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
@keyframes radarPing    { 0%{transform:scale(0.3);opacity:0.9} 100%{transform:scale(2.4);opacity:0} }
@keyframes stepReveal   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
@keyframes blink        { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes marquee      { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes shimmer      { from{background-position:200% 0} to{background-position:-200% 0} }

/* ── Responsive layout ───────────────────────────────────────── */
.dash-layout   { display:flex; min-height:100vh; position:relative; }
.sidebar-wrap  { width:220px; flex-shrink:0; }
.main-content  { flex:1; overflow:auto; min-height:100vh; }
.mobile-nav    { display:none; }
.no-mobile     { display:flex; }
.stat-grid     { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.feature-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.chat-layout   { display:flex; gap:16px; height:calc(100vh - 56px); overflow:hidden; }
.doc-sidebar   { width:240px; flex-shrink:0; }

@media print {
  .no-print { display:none !important; }
  body { background:#fff; color:#000; }
}

@media (max-width:768px) {
  .sidebar-wrap { display:none; }
  .mobile-nav   { display:flex; position:fixed; bottom:0; left:0; right:0; z-index:100; }
  .no-mobile    { display:none !important; }
  .main-content { padding-bottom:64px; }
  .stat-grid    { grid-template-columns:repeat(2,1fr); gap:10px; }
  .chat-layout  { flex-direction:column; height:auto; }
  .doc-sidebar  { width:100%; }
}

/* ── Nav dropdown ─────────────────────────────────────────────── */
.nav-item { position:relative; }
.nav-link { color:rgba(226,248,255,0.38); font-size:13px; text-decoration:none; cursor:pointer; padding:4px 0; transition:color 0.15s ease; display:block; }
.nav-link:hover { color:rgba(226,248,255,0.82); }

.nav-dropdown {
  position:absolute; top:calc(100% + 14px); left:-14px;
  background:rgba(4,14,28,0.97); border:1px solid rgba(34,211,238,0.18);
  border-radius:14px; padding:14px; backdrop-filter:blur(40px);
  box-shadow:0 20px 60px rgba(0,0,0,0.75),0 0 0 1px rgba(34,211,238,0.05);
  opacity:0; pointer-events:none; z-index:200;
  transform:translateY(-8px) scale(0.96);
  transition:opacity 0.22s cubic-bezier(0.34,1.56,0.64,1), transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
}
.nav-item:hover .nav-dropdown { opacity:1; pointer-events:all; transform:translateY(0) scale(1); }

.dd-title { font-size:9px; font-weight:700; color:rgba(34,211,238,0.4); letter-spacing:1.5px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(34,211,238,0.07); }
.dd-item  { display:flex; align-items:flex-start; gap:9px; padding:7px 9px; border-radius:9px; cursor:pointer; border:1px solid transparent; margin-bottom:3px; transition:background 0.15s, border-color 0.15s; }
.dd-item:hover { background:rgba(34,211,238,0.06); border-color:rgba(34,211,238,0.12); }
.dd-item:last-child { margin-bottom:0; }
.dd-icon  { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
.dd-label { font-size:12px; font-weight:600; color:#E2F8FF; margin-bottom:1px; }
.dd-desc  { font-size:10px; color:rgba(226,248,255,0.33); line-height:1.4; }
.dd-link  { display:flex; align-items:center; justify-content:space-between; padding:8px 9px; border-radius:8px; cursor:pointer; border:1px solid transparent; margin-bottom:2px; transition:background 0.15s, border-color 0.15s; }
.dd-link:hover { background:rgba(34,211,238,0.05); border-color:rgba(34,211,238,0.1); }
.dd-link span:first-child { font-size:12px; color:rgba(226,248,255,0.6); transition:color 0.15s; }
.dd-link:hover span:first-child { color:#E2F8FF; }
.dd-link span:last-child { font-size:10px; color:rgba(34,211,238,0.35); }
.dd-link:hover span:last-child { color:#22D3EE; }

/* ── Buttons ──────────────────────────────────────────────────── */
.btn-grad {
  background:linear-gradient(135deg,#22D3EE,#6366F1);
  border:none; color:#fff; font-weight:700; cursor:pointer;
  font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; gap:6px;
  transition:opacity 0.15s, transform 0.15s, box-shadow 0.15s;
}
.btn-grad:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); box-shadow:0 8px 28px rgba(34,211,238,0.4); }
.btn-grad:active:not(:disabled){ transform:scale(0.98); }
.btn-grad:disabled { opacity:0.45; cursor:wait; }

.btn-glass {
  background:rgba(34,211,238,0.1); border:1px solid rgba(34,211,238,0.38);
  color:#E2F8FF; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif;
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition:background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.15s;
}
.btn-glass:hover:not(:disabled) { background:rgba(34,211,238,0.18); border-color:rgba(34,211,238,0.6); box-shadow:0 0 20px rgba(34,211,238,0.2); transform:translateY(-1px); }
.btn-glass:active:not(:disabled){ transform:scale(0.98); }
.btn-glass:disabled { opacity:0.45; cursor:wait; }

.btn-ghost {
  background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.2);
  color:#22D3EE; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif;
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition:background 0.15s, border-color 0.15s, transform 0.15s;
}
.btn-ghost:hover { background:rgba(34,211,238,0.1); border-color:rgba(34,211,238,0.4); transform:translateY(-1px); }

.btn-danger {
  background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);
  color:#EF4444; cursor:pointer; font-family:'Inter',sans-serif;
  display:flex; align-items:center; justify-content:center;
  transition:background 0.15s, border-color 0.15s, transform 0.15s;
}
.btn-danger:hover { background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.4); transform:scale(1.04); }

.btn-icon {
  background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.12);
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:background 0.15s, border-color 0.15s, transform 0.15s;
}
.btn-icon:hover { background:rgba(34,211,238,0.1); border-color:rgba(34,211,238,0.3); transform:scale(1.06); }

/* ── Cards ────────────────────────────────────────────────────── */
.card-base {
  background:rgba(5,18,35,0.9); border:1px solid rgba(34,211,238,0.12);
  border-radius:14px; backdrop-filter:blur(20px); box-shadow:0 8px 32px rgba(0,0,0,0.4);
  transition:border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.card-hover:hover { border-color:rgba(34,211,238,0.22); box-shadow:0 12px 40px rgba(0,0,0,0.5); transform:translateY(-2px); }

.stat-card {
  background:rgba(5,18,35,0.9); border:1px solid rgba(34,211,238,0.1);
  border-radius:14px; backdrop-filter:blur(20px); padding:20px;
  position:relative; overflow:hidden;
  transition:border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.stat-card::before {
  content:''; position:absolute; left:0; top:0; bottom:0;
  width:3px; border-radius:14px 0 0 14px;
  background:var(--accent,#22D3EE); opacity:0.6;
  transition:opacity 0.2s;
}
.stat-card:hover { border-color:rgba(34,211,238,0.2); box-shadow:0 8px 32px rgba(0,0,0,0.5); transform:translateY(-2px); }
.stat-card:hover::before { opacity:1; }

/* ── Lists ────────────────────────────────────────────────────── */
.list-row {
  display:flex; align-items:center; gap:10px; padding:9px 10px;
  border-radius:9px; background:rgba(34,211,238,0.02);
  border:1px solid rgba(34,211,238,0.06); cursor:pointer;
  transition:background 0.15s, border-color 0.15s, transform 0.15s;
}
.list-row:hover { background:rgba(34,211,238,0.05); border-color:rgba(34,211,238,0.14); transform:translateX(2px); }

/* ── Inputs ───────────────────────────────────────────────────── */
.inp-field {
  padding:10px 13px; background:rgba(34,211,238,0.04);
  border:1px solid rgba(34,211,238,0.18); border-radius:9px;
  color:#E2F8FF; font-size:13px; outline:none;
  font-family:'Inter',sans-serif; width:100%; box-sizing:border-box;
  transition:border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.inp-field:focus { border-color:rgba(34,211,238,0.45); background:rgba(34,211,238,0.07); box-shadow:0 0 0 3px rgba(34,211,238,0.08); }
.inp-field::placeholder { color:rgba(226,248,255,0.25); }

/* ── Sidebar ──────────────────────────────────────────────────── */
.sidebar-item {
  display:flex; align-items:center; gap:8px; padding:7px 9px;
  border-radius:8px; text-decoration:none; border:1px solid transparent;
  transition:background 0.15s, border-color 0.15s;
}
.sidebar-item:hover { background:rgba(34,211,238,0.05); border-color:rgba(34,211,238,0.08); }
.sidebar-item.active { background:rgba(34,211,238,0.08); border-color:rgba(34,211,238,0.14); }

.search-bar {
  width:100%; display:flex; align-items:center; gap:7px; padding:7px 9px;
  border-radius:8px; background:rgba(34,211,238,0.04);
  border:1px solid rgba(34,211,238,0.1); color:rgba(226,248,255,0.3);
  font-size:12px; cursor:pointer; font-family:'Inter',sans-serif;
  transition:background 0.15s, border-color 0.15s;
}
.search-bar:hover { background:rgba(34,211,238,0.08); border-color:rgba(34,211,238,0.2); }

.signout-btn {
  width:100%; display:flex; align-items:center; gap:7px; padding:7px 9px;
  border-radius:8px; background:transparent; border:1px solid rgba(34,211,238,0.08);
  color:rgba(226,248,255,0.3); font-size:12px; cursor:pointer;
  font-family:'Inter',sans-serif;
  transition:background 0.15s, border-color 0.15s, color 0.15s;
}
.signout-btn:hover { background:rgba(239,68,68,0.06); border-color:rgba(239,68,68,0.2); color:#EF4444; }

.topbar-btn {
  width:32px; height:32px; border-radius:8px;
  background:rgba(34,211,238,0.05); border:1px solid rgba(34,211,238,0.1);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  transition:background 0.15s, border-color 0.15s, transform 0.15s;
}
.topbar-btn:hover { background:rgba(34,211,238,0.1); border-color:rgba(34,211,238,0.28); transform:scale(1.08); }

/* ── Chat specific ────────────────────────────────────────────── */
.doc-item {
  display:flex; align-items:center; gap:7px; padding:7px 8px;
  border-radius:8px; cursor:pointer; border:1px solid transparent; margin-bottom:3px;
  transition:background 0.15s, border-color 0.15s;
}
.doc-item:hover { background:rgba(34,211,238,0.05); border-color:rgba(34,211,238,0.1); }
.doc-item.selected { background:rgba(34,211,238,0.08); border-color:rgba(34,211,238,0.2); }

.send-btn {
  width:42px; height:42px; border-radius:10px; flex-shrink:0;
  border:1px solid rgba(34,211,238,0.14); cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:background 0.15s, box-shadow 0.15s, transform 0.15s;
}
.send-btn.active { background:linear-gradient(135deg,#22D3EE,#6366F1); box-shadow:0 4px 14px rgba(34,211,238,0.3); }
.send-btn.active:hover { transform:scale(1.06); box-shadow:0 6px 20px rgba(34,211,238,0.45); }
.send-btn.inactive { background:rgba(34,211,238,0.05); }

/* ── Upload zone ──────────────────────────────────────────────── */
.upload-zone {
  border:1px dashed rgba(34,211,238,0.2); background:rgba(5,18,35,0.5);
  border-radius:14px; text-align:center; cursor:pointer;
  transition:background 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.upload-zone:hover { border-color:rgba(34,211,238,0.4); background:rgba(34,211,238,0.04); box-shadow:0 0 24px rgba(34,211,238,0.08); }
.upload-zone.dragover { border-color:#22D3EE; background:rgba(34,211,238,0.08); box-shadow:0 0 32px rgba(34,211,238,0.15); }

/* ── Utility ──────────────────────────────────────────────────── */
.transition-all { transition:all 0.15s ease; }
.no-mobile { display:flex; }
@media (max-width:768px) { .no-mobile { display:none !important; } }
`);

// ── 2. CHAT PAGE — fixed syntax (no ); inside map) ─────────────
const chat = [];
const ch = s => chat.push(s);
ch("'use client';");
ch("import { useState, useRef, useEffect, useCallback } from 'react';");
ch("import { createClient } from '@/lib/supabase/client';");
ch("import Topbar from '@/components/layout/topbar';");
ch("import { Send, FileText, Zap, Printer, CheckCircle } from 'lucide-react';");
ch("");
ch("const C: React.CSSProperties = {");
ch("  background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)',");
ch("  borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)',");
ch("};");
ch("");
ch("export default function ChatPage() {");
ch("  const [docs,    setDocs]    = useState<any[]>([]);");
ch("  const [sel,     setSel]     = useState<string[]>([]);");
ch("  const [msgs,    setMsgs]    = useState<{role:string;content:string;citations?:any[]}[]>([]);");
ch("  const [input,   setInput]   = useState('');");
ch("  const [loading, setLoading] = useState(false);");
ch("  const [steps,   setSteps]   = useState<{text:string;done:boolean}[]>([]);");
ch("  const [showAgent, setAgent] = useState(false);");
ch("  const [agentDone, setADone] = useState(false);");
ch("  const [progress,  setProg]  = useState(0);");
ch("  const bottomRef = useRef<HTMLDivElement>(null);");
ch("  const timers    = useRef<NodeJS.Timeout[]>([]);");
ch("  const supabase  = createClient();");
ch("");
ch("  useEffect(() => {");
ch("    fetch('/api/documents').then(r => r.json()).then(raw => {");
ch("      const data = Array.isArray(raw) ? raw : (raw?.data ?? []);");
ch("      setDocs(data.filter((x: any) => x.status === 'ready'));");
ch("    });");
ch("  }, []);");
ch("");
ch("  useEffect(() => {");
ch("    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });");
ch("  }, [msgs, steps]);");
ch("");
ch("  const runAgent = useCallback((docNames: string[]) => {");
ch("    timers.current.forEach(t => clearTimeout(t));");
ch("    timers.current = [];");
ch("    const STEPS = [");
ch("      { text: 'Initializing query engine...',          pct: 10 },");
ch("      { text: 'Vectorizing input (384D)...',           pct: 26 },");
ch("      { text: docNames.length > 0 ? 'Searching: ' + docNames.slice(0,2).join(', ') + (docNames.length > 2 ? ' +' + (docNames.length - 2) + ' more...' : '...') : 'Searching knowledge base...', pct: 46 },");
ch("      { text: 'Ranking semantic similarity...',        pct: 63 },");
ch("      { text: 'Extracting relevant passages...',       pct: 79 },");
ch("      { text: 'Grounding response with citations...', pct: 93 },");
ch("    ];");
ch("    setSteps([]); setAgent(true); setADone(false); setProg(0);");
ch("    STEPS.forEach(({ text, pct }, i) => {");
ch("      const t = setTimeout(() => {");
ch("        setSteps(prev => {");
ch("          const updated = prev.map((s, idx) => idx < i ? { ...s, done: true } : s);");
ch("          return [...updated, { text, done: false }];");
ch("        });");
ch("        setProg(pct);");
ch("      }, i * 480);");
ch("      timers.current.push(t);");
ch("    });");
ch("  }, []);");
ch("");
ch("  const send = async () => {");
ch("    if (!input.trim() || loading) return;");
ch("    const userMsg = { role: 'user', content: input.trim() };");
ch("    setMsgs(m => [...m, userMsg]);");
ch("    setInput('');");
ch("    setLoading(true);");
ch("    const docNames = sel.map(id => docs.find(d => d.id === id)?.filename || id);");
ch("    runAgent(docNames);");
ch("    try {");
ch("      const res = await fetch('/api/chat', {");
ch("        method: 'POST',");
ch("        headers: { 'Content-Type': 'application/json' },");
ch("        body: JSON.stringify({ message: userMsg.content, documentIds: sel, history: msgs }),");
ch("      });");
ch("      const data = await res.json();");
ch("      timers.current.forEach(t => clearTimeout(t));");
ch("      setProg(100);");
ch("      setADone(true);");
ch("      setSteps(prev => prev.map(s => ({ ...s, done: true })));");
ch("      setTimeout(() => setAgent(false), 1400);");
ch("      setMsgs(m => [...m, { role: 'assistant', content: data.answer || 'No response.', citations: data.citations }]);");
ch("    } catch {");
ch("      setAgent(false);");
ch("      setMsgs(m => [...m, { role: 'assistant', content: 'Error getting response.' }]);");
ch("    }");
ch("    setLoading(false);");
ch("  };");
ch("");
ch("  const printChat = () => {");
ch("    const w = window.open('', '_blank', 'width=800,height=600');");
ch("    if (!w) return;");
ch("    const rows = msgs.map(m => {");
ch("      const cls = m.role === 'user' ? 'u' : 'a';");
ch("      const lbl = m.role === 'user' ? 'YOU' : 'PulsarIQ AI';");
ch("      return '<div class=\"' + cls + '\"><div class=\"lbl\">' + lbl + '</div>' + m.content + '</div>';");
ch("    }).join('');");
ch("    w.document.write('<html><head><title>PulsarIQ Chat</title><style>body{font-family:Inter,sans-serif;max-width:700px;margin:32px auto;color:#111}.u{background:#f0f4ff;padding:10px 14px;border-radius:10px;margin:12px 0}.a{background:#f8f8f8;padding:10px 14px;border-radius:10px;margin:12px 0;border-left:3px solid #22D3EE}.lbl{font-size:11px;font-weight:700;color:#666;margin-bottom:4px}h1{border-bottom:2px solid #22D3EE;padding-bottom:8px}</style></head><body><h1>PulsarIQ Export \u2014 ' + new Date().toLocaleString() + '</h1>' + rows + '</body></html>');");
ch("    w.document.close();");
ch("    w.print();");
ch("  };");
ch("");
ch("  return (");
ch("    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>");
ch("      <Topbar title='AI Chat' />");
ch("      <div className='chat-layout' style={{ flex: 1, overflow: 'hidden', padding: '16px', gap: '14px' }}>");
ch("");
ch("        {/* Source selector */}");
ch("        <div className='doc-sidebar' style={{ ...C, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>");
ch("          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(34,211,238,0.07)' }}>");
ch("            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#E2F8FF', margin: '0 0 2px' }}>Sources</h3>");
ch("            <p style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', margin: 0 }}>{sel.length} selected</p>");
ch("          </div>");
ch("          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>");
ch("            {docs.length === 0 ? (");
ch("              <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: 'rgba(226,248,255,0.3)' }}>");
ch("                No ready docs.<br />");
ch("                <a href='/documents' style={{ color: '#22D3EE', textDecoration: 'none' }}>Upload first →</a>");
ch("              </div>");
ch("            ) : (");
ch("              docs.map(doc => {");
ch("                const active = sel.includes(doc.id);");
ch("                return (");
ch("                  <div key={doc.id} className={'doc-item' + (active ? ' selected' : '')} onClick={() => setSel(s => active ? s.filter(x => x !== doc.id) : [...s, doc.id])}>  ");
ch("                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid ' + (active ? '#22D3EE' : 'rgba(226,248,255,0.2)'), background: active ? 'rgba(34,211,238,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>");
ch("                      {active && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22D3EE' }} />}");
ch("                    </div>");
ch("                    <span style={{ fontSize: '11px', color: active ? '#E2F8FF' : 'rgba(226,248,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{doc.filename}</span>");
ch("                  </div>");
ch("                );");
ch("              })");
ch("            )}");
ch("          </div>");
ch("        </div>");
ch("");
ch("        {/* Chat area */}");
ch("        <div style={{ ...C, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>");
ch("          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(34,211,238,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>");
ch("            <span style={{ fontSize: '11px', color: 'rgba(226,248,255,0.35)' }}>{msgs.length} messages · {sel.length} sources</span>");
ch("            {msgs.length > 0 && (");
ch("              <button className='btn-ghost no-mobile' onClick={printChat} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px' }}>");
ch("                <Printer size={12} /> Print");
ch("              </button>");
ch("            )}");
ch("          </div>");
ch("");
ch("          <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>");
ch("            {msgs.length === 0 && !showAgent && (");
ch("              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>");
ch("                <div style={{ width: '52px', height: '52px', borderRadius: '13px', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>");
ch("                  <Zap size={22} color='rgba(34,211,238,0.5)' />");
ch("                </div>");
ch("                <p style={{ fontSize: '14px', fontWeight: 600, color: '#E2F8FF', margin: '0 0 6px' }}>Ask your documents anything</p>");
ch("                <p style={{ fontSize: '12px', color: 'rgba(226,248,255,0.35)', margin: 0 }}>Select sources on the left, then ask a question.</p>");
ch("              </div>");
ch("            )}");
ch("");
ch("            {msgs.map((m, i) => {");
ch("              return (");
ch("                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>");
ch("                  <div style={{ maxWidth: '82%' }}>");
ch("                    {m.role === 'assistant' && (");
ch("                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>");
ch("                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg,#22D3EE,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>");
ch("                          <Zap size={9} color='#fff' />");
ch("                        </div>");
ch("                        <span style={{ fontSize: '10px', color: 'rgba(34,211,238,0.6)', fontWeight: 600 }}>PulsarIQ</span>");
ch("                      </div>");
ch("                    )}");
ch("                    <div style={{ padding: '11px 14px', borderRadius: m.role === 'user' ? '13px 13px 3px 13px' : '3px 13px 13px 13px', background: m.role === 'user' ? 'rgba(34,211,238,0.09)' : 'rgba(34,211,238,0.04)', border: '1px solid ' + (m.role === 'user' ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.08)'), fontSize: '13px', color: '#E2F8FF', lineHeight: 1.6 }}>");
ch("                      {m.content}");
ch("                    </div>");
ch("                    {m.citations && m.citations.length > 0 && (");
ch("                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '7px' }}>");
ch("                        {m.citations.slice(0, 4).map((c: any, ci: number) => (");
ch("                          <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '9px', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.14)', fontSize: '9px', color: '#22D3EE' }}>");
ch("                            <FileText size={8} />{String(c.source || '').split('/').pop()?.slice(0, 22) || 'Source'}");
ch("                          </div>");
ch("                        ))}");
ch("                      </div>");
ch("                    )}");
ch("                  </div>");
ch("                </div>");
ch("              );");
ch("            })}");
ch("");
ch("            {showAgent && (");
ch("              <div style={{ borderRadius: '12px', background: 'rgba(4,14,28,0.96)', border: '1px solid rgba(34,211,238,0.2)', padding: '16px', animation: 'fadeUp 0.3s ease-out' }}>");
ch("                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>");
ch("                  <div style={{ width: '32px', height: '32px', position: 'relative', flexShrink: 0 }}>");
ch("                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(34,211,238,0.3)' }} />");
ch("                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(34,211,238,0.6)', animation: 'radarPing 1.5s ease-out 0s infinite' }} />");
ch("                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(34,211,238,0.4)', animation: 'radarPing 1.5s ease-out 0.5s infinite' }} />");
ch("                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '6px', height: '6px', borderRadius: '50%', background: agentDone ? '#22C55E' : '#22D3EE', boxShadow: '0 0 8px ' + (agentDone ? '#22C55E' : '#22D3EE') }} />");
ch("                  </div>");
ch("                  <div style={{ flex: 1 }}>");
ch("                    <div style={{ fontSize: '11px', fontWeight: 700, color: agentDone ? '#22C55E' : '#22D3EE', letterSpacing: '0.5px', marginBottom: '5px' }}>");
ch("                      {agentDone ? 'COMPLETE' : 'PROCESSING...'}");
ch("                    </div>");
ch("                    <div style={{ height: '3px', background: 'rgba(34,211,238,0.1)', borderRadius: '2px', overflow: 'hidden' }}>");
ch("                      <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg,#6366F1,#22D3EE)', borderRadius: '2px', transition: 'width 0.45s ease', boxShadow: '0 0 6px rgba(34,211,238,0.5)' }} />");
ch("                    </div>");
ch("                  </div>");
ch("                </div>");
ch("                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>");
ch("                  {steps.map((step, i) => (");
ch("                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'agentStep 0.25s ease-out' }}>");
ch("                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: step.done ? 'rgba(34,211,238,0.12)' : 'rgba(245,158,11,0.1)', border: '1px solid ' + (step.done ? 'rgba(34,211,238,0.25)' : 'rgba(245,158,11,0.25)') }}>");
ch("                        {step.done");
ch("                          ? <CheckCircle size={8} color='#22D3EE' />");
ch("                          : <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#F59E0B', animation: 'glowPulse 0.7s ease-in-out infinite' }} />}");
ch("                      </div>");
ch("                      <span style={{ fontSize: '11px', color: step.done ? 'rgba(226,248,255,0.4)' : '#E2F8FF', transition: 'color 0.3s' }}>{step.text}</span>");
ch("                    </div>");
ch("                  ))}");
ch("                </div>");
ch("              </div>");
ch("            )}");
ch("            <div ref={bottomRef} />");
ch("          </div>");
ch("");
ch("          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(34,211,238,0.07)' }}>");
ch("            <div style={{ display: 'flex', gap: '8px' }}>");
ch("              <input");
ch("                value={input}");
ch("                onChange={e => setInput(e.target.value)}");
ch("                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}");
ch("                placeholder={sel.length === 0 ? 'Select documents first...' : 'Ask anything about your documents...'}");
ch("                disabled={sel.length === 0 || loading}");
ch("                className='inp-field'");
ch("                style={{ flex: 1, boxSizing: 'border-box' as const }}");
ch("              />");
ch("              <button");
ch("                onClick={send}");
ch("                disabled={!input.trim() || loading || sel.length === 0}");
ch("                className={'send-btn ' + (input.trim() && !loading && sel.length > 0 ? 'active' : 'inactive')}");
ch("              >");
ch("                <Send size={15} color={input.trim() && !loading && sel.length > 0 ? '#fff' : 'rgba(34,211,238,0.4)'} />");
ch("              </button>");
ch("            </div>");
ch("          </div>");
ch("        </div>");
ch("      </div>");
ch("    </div>");
ch("  );");
ch("}");
write('app/(dashboard)/chat/page.tsx', chat.join('\n'));

// ── 3. DOCUMENTS PAGE — Array.isArray guard ────────────────────
write('app/(dashboard)/documents/page.tsx', `
'use client';
import { useEffect, useState, useCallback } from 'react';
import Topbar from '@/components/layout/topbar';
import { Upload, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const C: React.CSSProperties = {
  background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)',
  borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
};

export default function DocumentsPage() {
  const [docs,      setDocs]      = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [drag,      setDrag]      = useState(false);
  const [expanded,  setExpanded]  = useState<string|null>(null);
  const [chunks,    setChunks]    = useState<{[id:string]:string[]}>({});

  const fetchDocs = useCallback(async () => {
    try {
      const r = await fetch('/api/documents');
      if (r.ok) {
        const raw = await r.json();
        const arr = Array.isArray(raw) ? raw : (raw?.data ?? raw?.documents ?? []);
        setDocs(arr);
      }
    } catch (e) {
      console.error('Failed to fetch documents', e);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    const t = setInterval(() => {
      setDocs(prev => {
        if (prev.some(d => d.status === 'processing' || d.status === 'embedding')) fetchDocs();
        return prev;
      });
    }, 3000);
    return () => clearInterval(t);
  }, [fetchDocs]);

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', f);
      await fetch('/api/documents', { method: 'POST', body: fd });
    }
    setUploading(false);
    fetchDocs();
  };

  const remove = async (id: string) => {
    await fetch('/api/documents/' + id, { method: 'DELETE' });
    fetchDocs();
  };

  const toggleExpand = async (docId: string) => {
    if (expanded === docId) { setExpanded(null); return; }
    setExpanded(docId);
    if (chunks[docId]) return;
    try {
      const r = await fetch('/api/documents/' + docId);
      if (r.ok) {
        const d = await r.json();
        setChunks(p => ({ ...p, [docId]: d.chunks || [] }));
      }
    } catch {
      setChunks(p => ({ ...p, [docId]: [] }));
    }
  };

  const sc = (s: string) => s === 'ready' ? '#22C55E' : s === 'failed' ? '#EF4444' : '#22D3EE';
  const si = (s: string) => s === 'ready' ? <CheckCircle size={10} /> : s === 'failed' ? <AlertCircle size={10} /> : <Clock size={10} />;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Topbar title='Documents' />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        <div
          className={'upload-zone' + (drag ? ' dragover' : '')}
          style={{ padding: '36px' }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          onClick={() => {
            const i = document.createElement('input');
            i.type = 'file'; i.multiple = true;
            i.accept = '.pdf,.docx,.xlsx,.pptx,.csv,.txt,.html';
            i.onchange = e => upload((e.target as HTMLInputElement).files);
            i.click();
          }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '13px', background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {uploading ? <RefreshCw size={22} color='#22D3EE' style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={22} color='#22D3EE' />}
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#E2F8FF', margin: '0 0 4px' }}>
            {uploading ? 'Uploading...' : drag ? 'Drop to upload' : 'Drag & drop files here'}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(226,248,255,0.3)', margin: 0 }}>PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML · Max 50MB</p>
        </div>

        <div style={C}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(34,211,238,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E2F8FF', margin: 0 }}>Knowledge Base</h3>
            <span style={{ fontSize: '11px', color: 'rgba(34,211,238,0.5)' }}>{docs.length} documents</span>
          </div>
          <div style={{ padding: '10px' }}>
            {docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'rgba(226,248,255,0.3)', fontSize: '13px' }}>
                No documents yet. Upload above to get started.
              </div>
            ) : (
              docs.map(doc => (
                <div key={doc.id} style={{ marginBottom: '6px', borderRadius: '10px', border: '1px solid rgba(34,211,238,0.07)', overflow: 'hidden' }}>
                  <div
                    className='list-row'
                    style={{ borderRadius: 0, border: 'none', margin: 0 }}
                    onClick={() => toggleExpand(doc.id)}
                  >
                    <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(34,211,238,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#22D3EE', flexShrink: 0 }}>
                      {doc.file_type?.toUpperCase()?.slice(0, 3) || 'DOC'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '12px', color: '#E2F8FF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', marginTop: '1px' }}>
                        {doc.chunk_count ? doc.chunk_count + ' chunks · ' : ''}{new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '9px', fontSize: '9px', fontWeight: 600, background: sc(doc.status) + '12', color: sc(doc.status), border: '1px solid ' + sc(doc.status) + '25', flexShrink: 0 }}>
                      {si(doc.status)}{doc.status}
                    </div>
                    <div style={{ color: 'rgba(226,248,255,0.3)', flexShrink: 0 }}>
                      {expanded === doc.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </div>
                    <button
                      className='btn-danger'
                      style={{ width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0 }}
                      onClick={e => { e.stopPropagation(); remove(doc.id); }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  {expanded === doc.id && (
                    <div style={{ padding: '12px 14px', background: 'rgba(34,211,238,0.02)', borderTop: '1px solid rgba(34,211,238,0.06)', maxHeight: '200px', overflowY: 'auto' }}>
                      {!chunks[doc.id] ? (
                        <div style={{ fontSize: '11px', color: 'rgba(226,248,255,0.4)', textAlign: 'center', padding: '12px' }}>Loading...</div>
                      ) : chunks[doc.id].length === 0 ? (
                        <div style={{ fontSize: '11px', color: 'rgba(226,248,255,0.4)', textAlign: 'center', padding: '12px' }}>No content preview yet — document may still be processing.</div>
                      ) : (
                        chunks[doc.id].slice(0, 3).map((chunk, i) => (
                          <div key={i} style={{ marginBottom: '8px', padding: '8px 10px', background: 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.08)', borderRadius: '7px' }}>
                            <div style={{ fontSize: '9px', color: 'rgba(34,211,238,0.4)', fontWeight: 600, marginBottom: '4px' }}>CHUNK {i + 1}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(226,248,255,0.6)', lineHeight: 1.5 }}>{String(chunk).slice(0, 220)}...</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`.trimStart());

console.log('\n  \u2705 patch.js complete!\n');
console.log('  Root causes fixed:');
console.log('  \u2713 globals.css       - Full rewrite (no guards, all CSS guaranteed)');
console.log('  \u2713 Nav dropdowns     - orbitA/B/C/D + nav-item/dropdown CSS now present');
console.log('  \u2713 Orbital panels    - Animation keyframes now guaranteed in CSS');
console.log('  \u2713 Chat page         - JSX syntax error removed (no ); inside map)');
console.log('  \u2713 Documents page    - Array.isArray guard + clean rewrite');
console.log('  \u2713 Login button      - btn-glass now rgba(34,211,238,0.1) not 0.08, visible');
console.log('\n  Run:');
console.log('  node patch.js');
console.log('  rmdir /s /q .next');
console.log('  npm run dev\n');
