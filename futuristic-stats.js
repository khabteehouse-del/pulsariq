// PulsarIQ — futuristic-stats.js
// Upgrades the shared StatCard component (used on Dashboard + Analytics)
// with a sci-fi HUD look: scanning light sweep, glowing corner brackets,
// rotating ring around the icon, pulsing "live" dot, glowing numbers.
// Pure CSS — reuses existing scanLine/glowPulse/spin keyframes already
// proven stable elsewhere in the app.
// Run: node futuristic-stats.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const content = `'use client';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  accent: string;
  sublabel?: string;
}

export default function StatCard({ icon: Icon, label, value, change, trend = 'neutral', accent, sublabel = 'this month' }: StatCardProps) {
  const trendColor = trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : 'rgba(226,248,255,0.4)';

  return (
    <div className="stat-card" style={{ ['--accent' as string]: accent, position: 'relative', overflow: 'hidden' } as React.CSSProperties}>

      {/* Scanning light sweep */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, ' + accent + '70, transparent)',
        animation: 'scanLine 4s linear infinite',
        top: 0, pointerEvents: 'none',
      }} />

      {/* Corner brackets — HUD targeting reticle style */}
      <div style={{ position: 'absolute', top: '6px', left: '6px', width: '10px', height: '10px', borderTop: '1.5px solid ' + accent + '55', borderLeft: '1.5px solid ' + accent + '55', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '10px', height: '10px', borderBottom: '1.5px solid ' + accent + '55', borderRight: '1.5px solid ' + accent + '55', pointerEvents: 'none' }} />

      {/* Header row: icon (with rotating ring) + trend badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ position: 'relative', width: '34px', height: '34px', flexShrink: 0 }}>
          {/* Slow rotating dashed ring around the icon */}
          <div style={{
            position: 'absolute', inset: '-4px', borderRadius: '50%',
            border: '1px dashed ' + accent + '40',
            animation: 'spin 14s linear infinite',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '9px', background: accent + '14', border: '1px solid ' + accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={accent} />
          </div>
        </div>

        {change && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, color: trendColor, background: trendColor + '14', padding: '2px 7px', borderRadius: '8px', border: '1px solid ' + trendColor + '28' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: trendColor, boxShadow: '0 0 5px ' + trendColor, animation: 'glowPulse 1.6s ease-in-out infinite' }} />
            {change}
          </div>
        )}
      </div>

      {/* Value — tabular numerals, subtle glow, wider tracking for a readout feel */}
      <div style={{
        fontSize: '26px', fontWeight: 900, color: '#E2F8FF', letterSpacing: '0.5px',
        lineHeight: 1, marginBottom: '4px',
        fontVariantNumeric: 'tabular-nums' as const,
        textShadow: '0 0 16px ' + accent + '30',
      }}>
        {value}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(226,248,255,0.7)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.32)', letterSpacing: '0.3px' }}>{sublabel}</div>
    </div>
  );
}
`;

const outPath = path.join(root, 'components', 'ui', 'stat-card.tsx');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');

console.log('\n  PulsarIQ \u2014 Futuristic Stat Cards\n');
console.log('  \u2713 components/ui/stat-card.tsx \u2014 ' + content.length + ' bytes');
console.log('\n  Applied automatically to BOTH Dashboard and Analytics');
console.log('  (both already use this shared component):');
console.log('  \u2713 Scanning light sweep across the top (4s loop)');
console.log('  \u2713 Glowing corner brackets \u2014 HUD targeting style');
console.log('  \u2713 Slow rotating dashed ring around each icon (14s loop)');
console.log('  \u2713 Pulsing "live" dot next to the trend badge');
console.log('  \u2713 Subtle glow + wider tracking on the big numbers\n');
console.log('  All pure CSS \u2014 reuses your existing scanLine/glowPulse/spin');
console.log('  keyframes, zero new JavaScript, zero crash risk.\n');
console.log('  Run: rmdir /s /q .next && npm run dev\n');
