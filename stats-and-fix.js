// PulsarIQ — stats-and-fix.js
// 1. Documents not showing -> more forgiving org_id/user_id query
// 2. Modern chart bars (no more "metal rods")
// 3. Reusable StatCard component used on Dashboard + Analytics consistently
// Run: node stats-and-fix.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Stats + Documents Fix\n');

// ── 1. REUSABLE STAT CARD COMPONENT ───────────────────────────
write('components/ui/stat-card.tsx', `'use client';
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
    <div className="stat-card" style={{ ['--accent' as string]: accent } as React.CSSProperties}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: accent + '14', border: '1px solid ' + accent + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={accent} />
        </div>
        {change && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 700, color: trendColor, background: trendColor + '14', padding: '2px 7px', borderRadius: '8px', border: '1px solid ' + trendColor + '28' }}>
            {change}
          </div>
        )}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 900, color: '#E2F8FF', letterSpacing: '-1px', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(226,248,255,0.7)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.32)' }}>{sublabel}</div>
    </div>
  );
}
`);

// ── 2. ANALYTICS PAGE — uses StatCard, modern thin bars ───────
write('app/(dashboard)/analytics/page.tsx', `'use client';
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
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E2F8FF', margin: 0 }}>Query Volume \u2014 Last 14 Days</h3>
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
`);

// ── 3. DASHBOARD PAGE — same StatCard, consistent design ──────
write('app/(dashboard)/dashboard/page.tsx', `'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Topbar from '@/components/layout/topbar';
import StatCard from '@/components/ui/stat-card';
import { FileText, MessageSquare, Database, TrendingUp, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

const card: React.CSSProperties = {
  background: 'rgba(5,18,35,0.9)',
  border: '1px solid rgba(34,211,238,0.12)',
  borderRadius: '14px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: dd } = await supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(6);
      setDocs(dd || []);
    });
  }, []);

  const stats = [
    { icon: FileText,      label: 'Documents',  value: String(docs.length), trend: 'neutral' as const, accent: '#22D3EE', sublabel: 'uploaded' },
    { icon: Database,      label: 'Chunks',     value: '\u2014',                trend: 'neutral' as const, accent: '#F59E0B', sublabel: 'vector embeddings' },
    { icon: MessageSquare, label: 'AI Queries', value: '\u2014',                trend: 'neutral' as const, accent: '#6366F1', sublabel: 'questions answered' },
    { icon: TrendingUp,    label: 'Accuracy',   value: '94.2%',             trend: 'up' as const,      accent: '#22C55E', sublabel: 'citation precision' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <Topbar title="Dashboard" />
      <div style={{ padding: '24px' }}>

        <div style={{ ...card, padding: '20px 24px', marginBottom: '18px', background: 'linear-gradient(135deg,rgba(34,211,238,0.06),rgba(5,18,35,0.95))', border: '1px solid rgba(34,211,238,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E', animation: 'glowPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '10px', color: 'rgba(34,211,238,0.6)', fontWeight: 600, letterSpacing: '1px' }}>SYSTEM ONLINE</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#E2F8FF', letterSpacing: '-0.5px', margin: '0 0 3px' }}>
              Welcome back{profile?.full_name ? ', ' + profile.full_name : ''}.
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(226,248,255,0.4)', margin: 0 }}>Your enterprise knowledge base is ready.</p>
          </div>
          {profile?.role && (
            <div style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', fontSize: '11px', color: '#22D3EE', fontWeight: 700 }}>
              {profile.role.toUpperCase()}
            </div>
          )}
        </div>

        <div className="stat-grid" style={{ marginBottom: '18px' }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        <div style={{ ...card, padding: '0' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(34,211,238,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#E2F8FF', margin: 0 }}>Recent Documents</h3>
            <a href="/documents" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#22D3EE', textDecoration: 'none', fontWeight: 500 }}>View all <ArrowUpRight size={11} /></a>
          </div>
          <div style={{ padding: '10px' }}>
            {docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(226,248,255,0.3)', fontSize: '13px' }}>
                No documents yet. <a href="/documents" style={{ color: '#22D3EE', textDecoration: 'none' }}>Upload your first \u2192</a>
              </div>
            ) : docs.map(doc => {
              const sc = doc.status === 'ready' ? '#22C55E' : doc.status === 'failed' ? '#EF4444' : '#22D3EE';
              return (
                <div key={doc.id} className="list-row" style={{ marginBottom: '5px', cursor: 'default' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#22D3EE', flexShrink: 0 }}>
                    {(doc.file_type || 'DOC').toUpperCase().slice(0, 3)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', color: '#E2F8FF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(226,248,255,0.3)', marginTop: '1px' }}>{new Date(doc.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '9px', fontSize: '9px', fontWeight: 600, background: sc + '12', color: sc, border: '1px solid ' + sc + '25', flexShrink: 0 }}>
                    {doc.status === 'ready' ? <CheckCircle size={9} /> : <Clock size={9} />}
                    {doc.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ── 4. DOCUMENTS API — more forgiving query, fixes "not showing" ──
write('app/api/documents/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json([], { status: 200 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    // More forgiving: match EITHER org_id OR user_id, so documents
    // inserted before org_id was reliably set still show up.
    if (profile?.org_id) {
      query = query.or('org_id.eq.' + profile.org_id + ',user_id.eq.' + user.id);
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Documents GET error:', error);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Documents GET exception:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    const ext = file.name.split('.').pop() || 'bin';
    const storagePath = user.id + '/' + Date.now() + '.' + ext;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        file_type: ext,
        file_size: file.size,
        storage_path: storagePath,
        user_id: user.id,
        org_id: profile?.org_id || null,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    fetch(new URL('/api/ingest', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') || '' },
      body: JSON.stringify({ documentId: doc.id }),
    }).catch(console.error);

    return NextResponse.json(doc);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

console.log('\n  \u2705 Done!\n');
console.log('  Fixed:');
console.log('  \u2713 Documents API   - now matches org_id OR user_id (more forgiving)');
console.log('  \u2713 StatCard         - new reusable component, used everywhere');
console.log('  \u2713 Analytics bars   - thinner, gradient, glowing, no border (modern)');
console.log('  \u2713 Analytics stats  - now use StatCard with %, value, label, "this month"');
console.log('  \u2713 Dashboard stats  - now use the SAME StatCard for consistency');
console.log('\n  Run: rmdir /s /q .next && npm run dev\n');
