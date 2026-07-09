// PulsarIQ — constellation-motion.js
// Constellation clusters rotating on their own axes + fine nebula particles
// scattered across all dashboard pages. Pure CSS/SVG, no JS runtime.
// Same backup pattern — run restore-motion.js to revert instantly.
// Run: node constellation-motion.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Constellation Motion\n');

// ── 1. BACKUP LAYOUT (preserve true original) ────────────────────
const layoutPath = path.join(root, 'app', '(dashboard)', 'layout.tsx');
const backupPath = layoutPath + '.bak';
if (!fs.existsSync(layoutPath)) {
  console.log('  \u26a0\ufe0f  layout.tsx not found. Run from C:\\pulsariq');
  process.exit(1);
}
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(layoutPath, backupPath);
  console.log('  \u2713 Backed up layout.tsx \u2014> layout.tsx.bak');
} else {
  console.log('  \u2713 Backup already exists (not overwritten)');
}

// ── 2. ADD KEYFRAMES TO GLOBALS.CSS ──────────────────────────────
const gPath = path.join(root, 'app', 'globals.css');
let gcss = fs.readFileSync(gPath, 'utf8');
if (!gcss.includes('@keyframes starTwinkle')) {
  gcss += '\n@keyframes starTwinkle { 0%,100%{opacity:0.05} 50%{opacity:0.38} }\n@keyframes cSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }\n@keyframes cSpinRev { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }\n';
  fs.writeFileSync(gPath, gcss, 'utf8');
  console.log('  \u2713 globals.css (starTwinkle + cSpin keyframes added)');
} else {
  console.log('  \u2713 globals.css keyframes already exist');
}

// ── 3. BUILD SVG CONTENT PROGRAMMATICALLY ────────────────────────

// Constellation clusters: { cx, cy, dur (s), dir, stars [[x,y],...], lines [[a,b],...] }
const CLUSTERS = [
  {
    cx: 200, cy: 150, dur: 45, dir: 'cSpin',
    stars: [[-30,-20],[5,-38],[38,-12],[22,28],[-18,22]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]]
  },
  {
    cx: 1260, cy: 110, dur: 58, dir: 'cSpinRev',
    stars: [[-28,18],[8,-32],[42,2],[18,32]],
    lines: [[0,1],[1,2],[2,3],[3,0]]
  },
  {
    cx: 110, cy: 520, dur: 68, dir: 'cSpin',
    stars: [[2,-42],[32,2],[12,38],[-32,22],[-36,-18]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0]]
  },
  {
    cx: 1330, cy: 400, dur: 52, dir: 'cSpinRev',
    stars: [[-36,-8],[2,32],[36,8],[-8,-36],[25,-20]],
    lines: [[0,1],[1,2],[2,3],[3,4],[0,2]]
  },
  {
    cx: 700, cy: 800, dur: 72, dir: 'cSpin',
    stars: [[-42,2],[-16,-32],[18,-22],[44,12],[12,36],[-22,28]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]
  },
  {
    cx: 950, cy: 240, dur: 62, dir: 'cSpinRev',
    stars: [[-22,-28],[14,-36],[42,8],[20,36],[-26,16]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]]
  },
];

// Fine scattered particles [x, y]
const PARTICLES = [
  [100,80],[350,40],[580,90],[800,50],[1050,80],[1300,60],
  [50,250],[300,300],[500,200],[750,280],[1100,220],[1400,320],
  [200,450],[420,480],[650,520],[880,400],[1150,500],
  [80,680],[350,650],[600,720],[850,680],[1050,750],[1350,700],
  [450,850],[900,830],[140,370],[1200,650],[720,450]
];

// Nebula groups — connected dots only, no background circles
const NEBULA = [
  {
    nodes: [[555,330],[590,310],[615,342],[596,372],[565,358]],
    conns: [[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]],
    color: '34,211,238'
  },
  {
    nodes: [[960,555],[992,543],[1012,574],[992,600],[965,585]],
    conns: [[0,1],[1,2],[2,3],[3,4],[4,0]],
    color: '99,102,241'
  },
  {
    nodes: [[380,700],[408,682],[425,710],[405,728],[380,715]],
    conns: [[0,1],[1,2],[2,3],[3,4],[4,0]],
    color: '34,211,238'
  },
];

// Generate SVG string
let svg = '';

// Constellation clusters
CLUSTERS.forEach((c, ci) => {
  svg += '      <g transform="translate(' + c.cx + ',' + c.cy + ')">\n';
  svg += '        <g style={{ animation: "' + c.dir + ' ' + c.dur + 's linear infinite", transformOrigin: "0 0" }}>\n';
  c.lines.forEach(([a, b]) => {
    const sa = c.stars[a], sb = c.stars[b];
    svg += '          <line x1="' + sa[0] + '" y1="' + sa[1] + '" x2="' + sb[0] + '" y2="' + sb[1] + '" stroke="rgba(226,248,255,0.07)" strokeWidth="0.6"/>\n';
  });
  c.stars.forEach((s, si) => {
    const dur  = (2.5 + si * 0.65).toFixed(1) + 's';
    const del  = (ci * 0.45 + si * 0.38).toFixed(1) + 's';
    const r    = si === 0 ? 2.2 : si === 2 ? 2.0 : 1.5;
    const opac = si === 0 ? 0.45 : 0.32;
    const col  = si % 2 === 0 ? '226,248,255' : '34,211,238';
    svg += '          <circle cx="' + s[0] + '" cy="' + s[1] + '" r="' + r + '" fill="rgba(' + col + ',' + opac + ')" style={{ animation: "starTwinkle ' + dur + ' ' + del + ' ease-in-out infinite" }}/>\n';
  });
  svg += '        </g>\n';
  svg += '      </g>\n';
});

// Fine particles
PARTICLES.forEach((p, pi) => {
  const dur = (2.0 + (pi % 8) * 0.45).toFixed(1) + 's';
  const del = ((pi * 0.32) % 3.5).toFixed(1) + 's';
  const r   = pi % 4 === 0 ? 1.4 : 1.0;
  const col = pi % 3 === 0 ? '34,211,238' : pi % 3 === 1 ? '226,248,255' : '99,102,241';
  svg += '      <circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="rgba(' + col + ',0.28)" style={{ animation: "starTwinkle ' + dur + ' ' + del + ' ease-in-out infinite" }}/>\n';
});

// Nebula nodes — connected dots only, no background circles
NEBULA.forEach((g, gi) => {
  g.conns.forEach(([a, b]) => {
    svg += '      <line x1="' + g.nodes[a][0] + '" y1="' + g.nodes[a][1] + '" x2="' + g.nodes[b][0] + '" y2="' + g.nodes[b][1] + '" stroke="rgba(' + g.color + ',0.07)" strokeWidth="0.5"/>\n';
  });
  g.nodes.forEach((n, ni) => {
    const dur  = (3.0 + ni * 0.55).toFixed(1) + 's';
    const del  = (gi * 1.1 + ni * 0.45).toFixed(1) + 's';
    const r    = ni === 2 ? 2.4 : ni === 0 ? 2.0 : 1.5;
    const opac = ni === 2 ? 0.35 : 0.25;
    svg += '      <circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + r + '" fill="rgba(' + g.color + ',' + opac + ')" style={{ animation: "starTwinkle ' + dur + ' ' + del + ' ease-in-out infinite" }}/>\n';
  });
});

// ── 4. WRITE CONSTELLATION COMPONENT ─────────────────────────────
const component = 'export default function ConstellationBg() {\n  return (\n    <svg\n      style={{ position: \'absolute\', inset: 0, width: \'100%\', height: \'100%\', zIndex: 0, pointerEvents: \'none\' }}\n      viewBox="0 0 1440 900"\n      preserveAspectRatio="xMidYMid slice"\n    >\n' + svg + '    </svg>\n  );\n}\n';

write('components/ui/constellation-bg.tsx', component);

// ── 5. REWRITE DASHBOARD LAYOUT ───────────────────────────────────
write('app/(dashboard)/layout.tsx', `'use client';
import Sidebar from '@/components/layout/sidebar';
import MobileNav from '@/components/layout/mobile-nav';
import CommandPalette from '@/components/layout/command-palette';
import ConstellationBg from '@/components/ui/constellation-bg';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [cmd, setCmd] = useState(false);
  return (
    <div className="dash-layout" style={{ background: '#030B14', position: 'relative', overflow: 'hidden' }}>
      <ConstellationBg />
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      <div className="sidebar-wrap" style={{ position: 'relative', zIndex: 10 }}>
        <Sidebar onSearch={() => setCmd(true)} />
      </div>
      <main className="main-content" style={{ position: 'relative', zIndex: 5 }}>{children}</main>
      <MobileNav />
    </div>
  );
}
`);

// verify generated component has expected content
const written = fs.readFileSync(path.join(root, 'components', 'ui', 'constellation-bg.tsx'), 'utf8');
const clusterCount  = (written.match(/cSpin/g) || []).length;
const particleCount = (written.match(/<circle/g) || []).length;
const lineCount     = (written.match(/<line/g) || []).length;

console.log('\n  \u2705 Done!\n');
console.log('  Constellation component stats:');
console.log('    ' + clusterCount + ' rotation animations across 6 clusters');
console.log('    ' + particleCount + ' total star/particle elements');
console.log('    ' + lineCount + ' connecting lines');
console.log('\n  All pure CSS \u2014 no JS, no canvas, safe to restore anytime.');
console.log('\n  Run: rmdir /s /q .next && npm run dev');
console.log('  To revert: node restore-motion.js\n');
