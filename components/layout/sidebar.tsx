'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart2, FileText, MessageSquare, Settings, LogOut, Search, Shield } from 'lucide-react';

const nav = [
  { href: '/dashboard', icon: BarChart2,     label: 'Dashboard' },
  { href: '/documents', icon: FileText,      label: 'Documents'  },
  { href: '/chat',      icon: MessageSquare, label: 'AI Chat'    },
  { href: '/access',    icon: Shield,        label: 'Access'     },
  { href: '/analytics', icon: BarChart2,     label: 'Analytics'  },
  { href: '/settings',  icon: Settings,      label: 'Settings'   },
];

function LogoMark() {
  return (
    <div style={{ width: '30px', height: '30px', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, border: '1.5px solid #22D3EE', borderRadius: '50%', boxShadow: '0 0 10px rgba(34,211,238,0.4)', animation: 'glowPulse 2.5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: '5px', border: '1px solid rgba(99,102,241,0.5)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '7px', height: '7px', borderRadius: '50%', background: 'radial-gradient(circle,#fff,#22D3EE)', boxShadow: '0 0 6px #22D3EE' }} />
    </div>
  );
}

export default function Sidebar({ onSearch }: { onSearch?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside style={{ width: '220px', height: '100vh', display: 'flex', flexDirection: 'column', background: 'rgba(3,8,18,0.97)', borderRight: '1px solid rgba(34,211,238,0.08)', position: 'sticky', top: 0, backdropFilter: 'blur(20px)' }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(34,211,238,0.06)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <LogoMark />
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#E2F8FF', lineHeight: 1 }}>PulsarIQ</div>
            <div style={{ fontSize: '9px', color: 'rgba(34,211,238,0.45)', letterSpacing: '1.5px', marginTop: '2px' }}>ENTERPRISE AI</div>
          </div>
        </Link>
      </div>

      <div style={{ padding: '10px 10px 6px' }}>
        <button onClick={onSearch} className="search-bar">
          <Search size={12} color="rgba(34,211,238,0.5)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
          <span style={{ fontSize: '10px', color: 'rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.06)', padding: '1px 5px', borderRadius: '4px' }}>Ctrl K</span>
        </button>
      </div>

      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <div style={{ fontSize: '9px', color: 'rgba(34,211,238,0.3)', letterSpacing: '1.5px', padding: '8px 4px 4px', fontWeight: 600 }}>NAVIGATION</div>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={'sidebar-item' + (active ? ' active' : '')}>
              <Icon size={14} color={active ? '#22D3EE' : 'rgba(226,248,255,0.28)'} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? '#E2F8FF' : 'rgba(226,248,255,0.38)' }}>{label}</span>
              {active && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 6px #22D3EE' }} />}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '10px', borderTop: '1px solid rgba(34,211,238,0.06)' }}>
        <button onClick={logout} className="signout-btn">
          <LogOut size={13} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
