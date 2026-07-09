// PulsarIQ — add-motion.js
// 1. Backs up app/(dashboard)/layout.tsx to layout.tsx.bak FIRST (only if no
//    backup exists yet, so the TRUE original is never overwritten by re-runs)
// 2. Adds pure CSS ambient drifting glow orbs — NO JavaScript, NO canvas,
//    NO React state. Learned from the BgParticles crash: this cannot break
//    navigation or crash the layout, worst case it's just static.
// Run: node add-motion.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const layoutPath = path.join(root, 'app', '(dashboard)', 'layout.tsx');
const backupPath = layoutPath + '.bak';

if (!fs.existsSync(layoutPath)) {
  console.log('\n  \u26a0\ufe0f  Could not find ' + layoutPath);
  console.log('  Make sure you are running this from C:\\pulsariq\n');
  process.exit(1);
}

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(layoutPath, backupPath);
  console.log('  \u2713 Backed up current layout to layout.tsx.bak');
} else {
  console.log('  \u2713 Backup already exists at layout.tsx.bak (not overwritten)');
}

const gPath = path.join(root, 'app', 'globals.css');
let gcss = fs.readFileSync(gPath, 'utf8');
if (!gcss.includes('@keyframes driftA')) {
  gcss += `
/* Ambient background motion — pure CSS, no JS, cannot crash layout */
@keyframes driftA {
  0%,100% { transform: translate(0,0) scale(1); }
  33%     { transform: translate(40px,-30px) scale(1.08); }
  66%     { transform: translate(-25px,25px) scale(0.95); }
}
@keyframes driftB {
  0%,100% { transform: translate(0,0) scale(1); }
  50%     { transform: translate(-50px,40px) scale(1.1); }
}
@keyframes driftC {
  0%,100% { transform: translate(0,0) scale(1); }
  40%     { transform: translate(30px,35px) scale(0.92); }
  70%     { transform: translate(-35px,-20px) scale(1.05); }
}
.ambient-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
`;
  fs.writeFileSync(gPath, gcss, 'utf8');
  console.log('  \u2713 globals.css (ambient drift keyframes added)');
} else {
  console.log('  \u2713 globals.css already has ambient keyframes (skipped)');
}

const content = `'use client';
import Sidebar from '@/components/layout/sidebar';
import MobileNav from '@/components/layout/mobile-nav';
import CommandPalette from '@/components/layout/command-palette';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [cmd, setCmd] = useState(false);
  return (
    <div className="dash-layout" style={{ background: '#030B14', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient drifting glow orbs — pure CSS, no JS, safe by design */}
      <div className="ambient-orb" style={{ width: '420px', height: '420px', top: '-100px', left: '15%', background: 'radial-gradient(circle, rgba(34,211,238,0.07), transparent 70%)', animation: 'driftA 38s ease-in-out infinite', zIndex: 0 }} />
      <div className="ambient-orb" style={{ width: '380px', height: '380px', top: '40%', right: '5%', background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)', animation: 'driftB 46s ease-in-out infinite', zIndex: 0 }} />
      <div className="ambient-orb" style={{ width: '320px', height: '320px', bottom: '-80px', left: '40%', background: 'radial-gradient(circle, rgba(34,211,238,0.05), transparent 70%)', animation: 'driftC 52s ease-in-out infinite', zIndex: 0 }} />

      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
      <div className="sidebar-wrap" style={{ position: 'relative', zIndex: 10 }}>
        <Sidebar onSearch={() => setCmd(true)} />
      </div>
      <main className="main-content" style={{ position: 'relative', zIndex: 5 }}>{children}</main>
      <MobileNav />
    </div>
  );
}
`;

fs.writeFileSync(layoutPath, content, 'utf8');
console.log('  \u2713 app/(dashboard)/layout.tsx \u2014 ambient motion added\n');
console.log('  3 slow-drifting glow orbs behind your content \u2014 38s/46s/52s loops,');
console.log('  very low opacity (5-7%), pure CSS, GPU-accelerated, no JS at all.\n');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
console.log('  If anything looks wrong, run: node restore-motion.js');
console.log('  to instantly revert to your exact previous layout.\n');
