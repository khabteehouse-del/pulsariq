'use client';
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
      {cmd && <CommandPalette open={cmd} onClose={() => setCmd(false)} />}
      <div className="sidebar-wrap" style={{ position: 'relative', zIndex: 10 }}>
        <Sidebar onSearch={() => setCmd(true)} />
      </div>
      <main className="main-content" style={{ position: 'relative', zIndex: 5 }}>{children}</main>
      <MobileNav />
    </div>
  );
}
