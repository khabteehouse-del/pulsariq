'use client';
import Topbar from '@/components/layout/topbar';
import StatCard from '@/components/ui/stat-card';
import { FileText, MessageSquare, Database, Zap } from 'lucide-react';

const card: React.CSSProperties = {
  background: 'rgba(5,18,35,0.9)',
  border: '1px solid rgba(34,211,238,0.12)',
  borderRadius: '14px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const metrics = [
  { icon: FileText,      label: 'Documents',   value: '2,847', change: '+12%', trend: 'up' as const,   accent: '#22D3EE', sublabel: 'this month' },
  { icon: MessageSquare, label: 'AI Queries',  value: '3,419', change: '+23%', trend: 'up' as const,   accent: '#F59E0B', sublabel: 'this month' },
  { icon: Database,      label: 'Chunks',      value: '1.2M',  change: '+8%',  trend: 'up' as const,   accent: '#6366F1', sublabel: 'this month' },
  { icon: Zap,           label: 'Avg Latency', value: '187ms', change: '-15%', trend: 'down' as const, accent: '#22C55E', sublabel: 'this month' },
];

const BARS = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 65, 100];
const DAYS = ['14d', '13d', '12d', '11d', '10d', '9d', '8d', '7d', '6d', '5d', '4d', '3d', '2d', '1d'];

export default function AnalyticsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Topbar title="Analytics" />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        <div className="stat-grid">
          {metrics.map(m => <StatCard key={m.label} {...m} />)}
        </div>

        <div style={{ ...card, padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E2F8FF', margin: 0 }}>Query Volume — Last 14 Days</h3>
            <span style={{ fontSize: '11px', color: 'rgba(34,211,238,0.5)' }}>3,419 total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', height: '120px', padding: '0 2px' }}>
            {BARS.map((h, i) => (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: h + '%',
                  background: 'linear-gradient(180deg, rgba(34,211,238,0.6) 0%, rgba(99,102,241,0.3) 65%, rgba(99,102,241,0.04) 100%)',
                  borderRadius: '6px 6px 3px 3px',
                  boxShadow: '0 0 14px rgba(34,211,238,0.12)',
                  transition: 'height 0.3s ease',
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            {DAYS.map(d => <span key={d} style={{ fontSize: '9px', color: 'rgba(226,248,255,0.2)', flex: 1, textAlign: 'center' }}>{d}</span>)}
          </div>
        </div>

        <div style={{ ...card, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E2F8FF', margin: '0 0 14px' }}>System Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[
              { l: 'Vector Search (pgvector)', s: 'Operational', c: '#22C55E' },
              { l: 'Ollama AI (tinyllama)',     s: 'Running',     c: '#22C55E' },
              { l: 'Document Ingestion',        s: 'Active',      c: '#22C55E' },
              { l: 'Supabase Storage',          s: 'Connected',   c: '#22C55E' },
            ].map(({ l, s, c }) => (
              <div key={l} className="list-row" style={{ cursor: 'default' }}>
                <span style={{ fontSize: '12px', color: 'rgba(226,248,255,0.55)', flex: 1 }}>{l}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: c, boxShadow: '0 0 5px ' + c, animation: 'glowPulse 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '11px', color: c, fontWeight: 600 }}>{s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
