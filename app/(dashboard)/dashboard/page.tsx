'use client';
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
      // Real column is 'name', not 'filename'.
      const { data: dd } = await supabase.from('documents').select('*').order('created_at', { ascending: false }).limit(6);
      setDocs(dd || []);
    });
  }, []);

  const stats = [
    { icon: FileText,      label: 'Documents',  value: String(docs.length), trend: 'neutral' as const, accent: '#22D3EE', sublabel: 'uploaded' },
    { icon: Database,      label: 'Chunks',     value: '—',                trend: 'neutral' as const, accent: '#F59E0B', sublabel: 'vector embeddings' },
    { icon: MessageSquare, label: 'AI Queries', value: '—',                trend: 'neutral' as const, accent: '#6366F1', sublabel: 'questions answered' },
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
                No documents yet. <a href="/documents" style={{ color: '#22D3EE', textDecoration: 'none' }}>Upload your first →</a>
              </div>
            ) : docs.map(doc => {
              const sc = doc.status === 'ready' ? '#22C55E' : doc.status === 'failed' ? '#EF4444' : '#22D3EE';
              return (
                <div key={doc.id} className="list-row" style={{ marginBottom: '5px', cursor: 'default' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 800, color: '#22D3EE', flexShrink: 0 }}>
                    {(doc.file_type || 'DOC').toUpperCase().slice(0, 3)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', color: '#E2F8FF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
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
