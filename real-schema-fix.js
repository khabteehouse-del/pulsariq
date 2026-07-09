// PulsarIQ — real-schema-fix.js
// DEFINITIVE FIX based on actual verified schema from information_schema.columns:
//   documents.name          (NOT filename)
//   documents.uploaded_by   (NOT user_id)
//   documents.updated_at    (exists, now used properly)
// Run: node real-schema-fix.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Definitive Schema Fix\n');

write('app/api/documents/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin-inline';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
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

    if (profile?.org_id) {
      query = query.eq('org_id', profile.org_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Documents GET error:', error);
      return NextResponse.json([], { status: 200 });
    }

    // Alias real DB column 'name' -> 'filename' for the frontend,
    // which was built expecting .filename. Keeps all page code unchanged.
    const aliased = (data || []).map((doc: any) => ({ ...doc, filename: doc.name }));

    return NextResponse.json(aliased);
  } catch (err: any) {
    console.error('Documents GET exception:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized \u2014 please sign in again' }, { status: 401 });
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

    const adminClient = getAdminClient();

    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Storage: ' + uploadError.message }, { status: 500 });
    }

    // Real columns: name (not filename), uploaded_by (not user_id).
    const { data: doc, error: dbError } = await adminClient
      .from('documents')
      .insert({
        name: file.name,
        file_type: ext,
        file_size: file.size,
        storage_path: storagePath,
        org_id: profile?.org_id || null,
        uploaded_by: user.id,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Database: ' + dbError.message }, { status: 500 });
    }

    fetch(new URL('/api/ingest', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') || '' },
      body: JSON.stringify({ documentId: doc.id }),
    }).catch(console.error);

    return NextResponse.json({ ...doc, filename: doc.name });
  } catch (err: any) {
    console.error('Documents POST exception:', err);
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 });
  }
}
`);

write('app/api/documents/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin-inline';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: doc } = await supabase.from('documents').select('*').eq('id', params.id).single();
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: chunkRows } = await supabase
      .from('document_chunks')
      .select('content')
      .eq('document_id', params.id)
      .order('chunk_index', { ascending: true })
      .limit(5);

    const chunks = (chunkRows || []).map((c: any) => c.content);
    return NextResponse.json({ ...doc, filename: doc.name, chunks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminClient = getAdminClient();
    const { data: doc } = await adminClient.from('documents').select('*').eq('id', params.id).single();
    if (doc?.storage_path) {
      await adminClient.storage.from('documents').remove([doc.storage_path]);
    }
    await adminClient.from('document_chunks').delete().eq('document_id', params.id);
    await adminClient.from('documents').delete().eq('id', params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Documents DELETE exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

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
      // Real column is 'name', not 'filename'.
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
`);

write('components/layout/topbar.tsx', `'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bell, LogOut, Settings as SettingsIcon, CheckCircle, AlertCircle } from 'lucide-react';

export default function Topbar({ title }: { title: string }) {
  const [user, setUser]         = useState<any>(null);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifs, setNotifs]     = useState<any[]>([]);
  const [unseen, setUnseen]     = useState(0);
  const notifRef  = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const supabase  = createClient();
  const router    = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      // Real columns: name (not filename), updated_at (exists — use it for "recent activity").
      const { data } = await supabase
        .from('documents')
        .select('id, name, status, updated_at')
        .in('status', ['ready', 'failed'])
        .order('updated_at', { ascending: false })
        .limit(8);
      const items = data || [];
      setNotifs(items);
      const lastSeen = typeof window !== 'undefined' ? localStorage.getItem('pulsariq_notif_seen') : null;
      const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
      const unseenCount = items.filter((d: any) => new Date(d.updated_at).getTime() > lastSeenTime).length;
      setUnseen(unseenCount);
    };
    fetchNotifs();
    const t = setInterval(fetchNotifs, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleNotifs = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    setAvatarOpen(false);
    if (next) {
      localStorage.setItem('pulsariq_notif_seen', new Date().toISOString());
      setUnseen(0);
    }
  };

  const toggleAvatar = () => {
    setAvatarOpen(o => !o);
    setNotifOpen(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  };

  return (
    <header style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(34,211,238,0.07)', background: 'rgba(3,8,18,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div>
        <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#E2F8FF', letterSpacing: '-0.3px', lineHeight: 1 }}>{title}</h1>
        <p style={{ fontSize: '10px', color: 'rgba(34,211,238,0.4)', marginTop: '2px' }}>PulsarIQ Enterprise</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="topbar-btn" onClick={toggleNotifs} style={{ position: 'relative' }}>
            <Bell size={13} color="rgba(34,211,238,0.5)" />
            {unseen > 0 && (
              <div style={{ position: 'absolute', top: '-3px', right: '-3px', minWidth: '14px', height: '14px', borderRadius: '7px', background: '#EF4444', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }}>
                {unseen > 9 ? '9+' : unseen}
              </div>
            )}
          </button>
          <div
            className="nav-dropdown"
            style={{
              width: '280px', right: 0, left: 'auto', top: 'calc(100% + 10px)',
              opacity: notifOpen ? 1 : 0,
              pointerEvents: notifOpen ? 'all' : 'none',
              transform: notifOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
            }}
          >
            <div className="dd-title">RECENT ACTIVITY</div>
            {notifs.length === 0 ? (
              <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: '11px', color: 'rgba(226,248,255,0.3)' }}>
                No recent activity yet.
              </div>
            ) : notifs.map((n: any) => (
              <div key={n.id} className="dd-item">
                <div className="dd-icon" style={{ background: n.status === 'ready' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: n.status === 'ready' ? '#22C55E' : '#EF4444' }}>
                  {n.status === 'ready' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                </div>
                <div>
                  <div className="dd-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>{n.name}</div>
                  <div className="dd-desc">{n.status === 'ready' ? 'Ready to query' : 'Processing failed'} &middot; {timeAgo(n.updated_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={avatarRef} style={{ position: 'relative' }}>
          <div
            onClick={toggleAvatar}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#22D3EE,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', boxShadow: '0 0 10px rgba(34,211,238,0.3)', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div
            className="nav-dropdown"
            style={{
              width: '200px', right: 0, left: 'auto', top: 'calc(100% + 10px)',
              opacity: avatarOpen ? 1 : 0,
              pointerEvents: avatarOpen ? 'all' : 'none',
              transform: avatarOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
            }}
          >
            <div style={{ padding: '2px 9px 10px', borderBottom: '1px solid rgba(34,211,238,0.07)', marginBottom: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#E2F8FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
            <a href="/settings" className="dd-link">
              <span>Settings</span>
              <SettingsIcon size={12} color="rgba(34,211,238,0.4)" />
            </a>
            <div onClick={logout} className="dd-link" style={{ cursor: 'pointer' }}>
              <span style={{ color: '#EF4444' }}>Sign out</span>
              <LogOut size={12} color="#EF4444" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
`);

console.log('\n  \u2705 Definitive fix applied!\n');
console.log('  Real schema now matched exactly everywhere:');
console.log('  \u2713 POST insert uses name + uploaded_by (verified real columns)');
console.log('  \u2713 GET /api/documents aliases name\u2192filename in its JSON response');
console.log('    so Documents + Chat pages need ZERO further changes');
console.log('  \u2713 Dashboard (direct Supabase query) now reads doc.name correctly');
console.log('  \u2713 Topbar notifications (direct Supabase query) now reads doc.name');
console.log('    and uses the real updated_at column for proper "recent" sorting\n');
console.log('  Run: rmdir /s /q .next && npm run dev');
console.log('  Then upload again \u2014 this should be the real fix.\n');
