// PulsarIQ — Phase 3: Auth + RBAC + Dashboard
// Run from C:\pulsariq: node phase3.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(filePath, content) {
  const full = path.join(root, filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('  \u2713', filePath);
}

console.log('\n  PulsarIQ \u2014 Phase 3: Auth + RBAC\n');

[
  'app/(auth)/login',
  'app/(auth)/signup',
  'app/(dashboard)/dashboard',
  'app/api/auth/signup',
  'components/layout',
].forEach(d => fs.mkdirSync(path.join(root, d), { recursive: true }));
console.log('  \u2713 Directories\n');

// ── 1. Auth Layout ────────────────────────────────────────────
write('app/(auth)/layout.tsx', String.raw`
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#07080F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
    }}>
      {children}
    </main>
  );
}
`);

// ── 2. Login Page ─────────────────────────────────────────────
write('app/(auth)/login/page.tsx', String.raw`
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router  = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else router.push('/dashboard');
  };

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
          <Zap size={24} color="#fff" />
        </div>
        <h1 style={{ color: '#F1F5F9', fontSize: 24, fontWeight: 800, margin: 0 }}>PulsarIQ</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Sign in to your workspace</p>
      </div>

      {/* Card */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 32, backdropFilter: 'blur(24px)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#F1F5F9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#F1F5F9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, margin: 0, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            style={{ padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748B', fontSize: 13, marginTop: 20, marginBottom: 0 }}>
          No account?{' '}
          <a href="/signup" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>Create workspace</a>
        </p>
      </div>
    </div>
  );
}
`);

// ── 3. Signup Page ────────────────────────────────────────────
write('app/(auth)/signup/page.tsx', String.raw`
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', orgName: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Create user + org via API
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json() as { error?: string };

    if (!res.ok) {
      setError(data.error ?? 'Signup failed');
      setLoading(false);
      return;
    }

    // 2. Sign in
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInErr) { setError(signInErr.message); setLoading(false); return; }

    router.push('/dashboard');
  };

  const fields: { key: string; label: string; type: string; placeholder: string }[] = [
    { key: 'fullName', label: 'Your Name',        type: 'text',     placeholder: 'John Smith' },
    { key: 'orgName',  label: 'Organisation Name', type: 'text',     placeholder: 'Acme Corp' },
    { key: 'email',    label: 'Work Email',        type: 'email',    placeholder: 'john@acme.com' },
    { key: 'password', label: 'Password',          type: 'password', placeholder: 'Min 8 characters' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
          <Zap size={24} color="#fff" />
        </div>
        <h1 style={{ color: '#F1F5F9', fontSize: 24, fontWeight: 800, margin: 0 }}>Create Workspace</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Set up PulsarIQ for your organisation</p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 32, backdropFilter: 'blur(24px)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type} required placeholder={f.placeholder}
                value={(form as Record<string,string>)[f.key]}
                onChange={set(f.key)}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#F1F5F9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, margin: 0, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            style={{ padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748B', fontSize: 13, marginTop: 20, marginBottom: 0 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
`);

// ── 4. Signup API Route ───────────────────────────────────────
write('app/api/auth/signup/route.ts', String.raw`
import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    fullName: string;
    orgName:  string;
    email:    string;
    password: string;
  };

  const { fullName, orgName, email, password } = body;

  if (!fullName || !orgName || !email || !password)
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

  // 1. Create auth user
  const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authErr || !authData.user)
    return NextResponse.json({ error: authErr?.message ?? 'Failed to create user' }, { status: 400 });

  const userId = authData.user.id;

  // 2. Create organisation
  const slug = slugify(orgName) + '-' + Date.now();
  const { data: org, error: orgErr } = await adminClient
    .from('organizations')
    .insert({ name: orgName, slug })
    .select()
    .single();

  if (orgErr || !org) {
    await adminClient.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 });
  }

  // 3. Update profile (created by DB trigger on signup)
  const { error: profileErr } = await adminClient
    .from('profiles')
    .update({ org_id: org.id, full_name: fullName, role: 'admin' })
    .eq('id', userId);

  if (profileErr) {
    await adminClient.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Failed to set up profile' }, { status: 500 });
  }

  return NextResponse.json({ success: true, orgId: org.id });
}
`);

// ── 5. Sidebar Component ─────────────────────────────────────
write('components/layout/sidebar.tsx', String.raw`
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FolderOpen, MessageSquare, BarChart2, Shield, Settings, Zap, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const nav = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/documents',  icon: FolderOpen,       label: 'Documents' },
  { href: '/chat',       icon: MessageSquare,    label: 'AI Chat' },
  { href: '/analytics',  icon: BarChart2,        label: 'Analytics' },
  { href: '/access',     icon: Shield,           label: 'Access' },
  { href: '/settings',   icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside style={{ width: 210, flexShrink: 0, height: '100vh', position: 'fixed', top: 0, left: 0, background: 'rgba(13,15,28,0.9)', borderRight: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', padding: '20px 10px', zIndex: 50 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px', marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(99,102,241,0.4)', flexShrink: 0 }}>
          <Zap size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#F1F5F9', lineHeight: 1 }}>PulsarIQ</div>
          <div style={{ fontSize: 9, color: '#64748B', letterSpacing: '1px' }}>ENTERPRISE AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: active ? 'rgba(99,102,241,0.1)' : 'transparent', border: '1px solid ' + (active ? 'rgba(99,102,241,0.2)' : 'transparent'), cursor: 'pointer', transition: 'all 0.2s' }}>
                <Icon size={15} color={active ? '#6366F1' : 'rgba(255,255,255,0.35)'} />
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#F1F5F9' : 'rgba(255,255,255,0.45)' }}>{label}</span>
                {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#6366F1', boxShadow: '0 0 6px #6366F1' }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 8 }}>
        <LogOut size={14} color="rgba(255,255,255,0.25)" />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Sign Out</span>
      </button>
    </aside>
  );
}
`);

// ── 6. Topbar Component ───────────────────────────────────────
write('components/layout/topbar.tsx', String.raw`
'use client';
import { Bell } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(7,8,15,0.8)', borderBottom: '1px solid rgba(99,102,241,0.12)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', margin: 0, lineHeight: 1 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Bell size={16} color="#64748B" style={{ cursor: 'pointer' }} />
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>F</div>
      </div>
    </header>
  );
}
`);

// ── 7. Dashboard Layout ───────────────────────────────────────
write('app/(dashboard)/layout.tsx', String.raw`
import Sidebar from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07080F', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 210, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
`);

// ── 8. Dashboard Home Page ────────────────────────────────────
write('app/(dashboard)/dashboard/page.tsx', String.raw`
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Topbar from '@/components/layout/topbar';
import { FileText, MessageSquare, Database, Users } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, org_id')
    .eq('id', user.id)
    .single();

  const { count: docCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile?.org_id ?? '');

  const stats = [
    { label: 'Documents',    value: String(docCount ?? 0),  icon: FileText,       color: '#6366F1' },
    { label: 'AI Queries',   value: '0',                    icon: MessageSquare,  color: '#22D3EE' },
    { label: 'Vector Chunks',value: '0',                    icon: Database,       color: '#A855F7' },
    { label: 'Team Members', value: '1',                    icon: Users,          color: '#F59E0B' },
  ];

  const name = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <>
      <Topbar title="Dashboard" subtitle={'Welcome back, ' + name} />
      <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Role badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', width: 'fit-content' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 6px #22D3EE' }} />
          <span style={{ fontSize: 12, color: '#22D3EE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{profile?.role ?? 'viewer'}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ padding: '20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.12)', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: color + '14', border: '1px solid ' + color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#F1F5F9', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div style={{ padding: '48px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(99,102,241,0.1)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FileText size={22} color="#6366F1" />
          </div>
          <h3 style={{ color: '#F1F5F9', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>No documents yet</h3>
          <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 20px' }}>Upload your first document to start using PulsarIQ</p>
          <a href="/documents" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#22D3EE)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Upload Document
          </a>
        </div>
      </main>
    </>
  );
}
`);

// ── 9. Restore middleware ─────────────────────────────────────
try {
  const bak = path.join(root, 'middleware.ts.bak');
  const mw  = path.join(root, 'middleware.ts');
  if (fs.existsSync(bak) && !fs.existsSync(mw)) {
    fs.renameSync(bak, mw);
    console.log('  \u2713 middleware.ts restored');
  }
} catch {}

console.log('\n  \u2705 Phase 3 complete!\n');
console.log('  Steps:');
console.log('  1. npm run dev');
console.log('  2. Open http://localhost:3000/signup');
console.log('  3. Create your account + organisation');
console.log('  4. You should land on /dashboard\n');
