'use client';
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
