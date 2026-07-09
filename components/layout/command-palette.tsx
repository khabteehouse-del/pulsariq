'use client';
import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, BarChart2, Settings, Upload, Search, Zap } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const ACTIONS = [
  { icon: LayoutDashboard, label: 'Go to Dashboard',  href: '/dashboard',  group: 'Navigation' },
  { icon: FileText,        label: 'Go to Documents',  href: '/documents',  group: 'Navigation' },
  { icon: MessageSquare,   label: 'Go to AI Chat',    href: '/chat',       group: 'Navigation' },
  { icon: BarChart2,       label: 'Go to Analytics',  href: '/analytics',  group: 'Navigation' },
  { icon: Settings,        label: 'Go to Settings',   href: '/settings',   group: 'Navigation' },
  { icon: Upload,          label: 'Upload Document',  href: '/documents',  group: 'Actions'    },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
    setQuery('');
  };

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = query
    ? ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : ACTIONS;

  const groups = Array.from(new Set(filtered.map(a => a.group)));

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:9999, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'120px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width:'560px', maxWidth:'90vw', borderRadius:'16px', background:'rgba(13,15,28,0.97)', border:'1px solid rgba(99,102,241,0.3)', backdropFilter:'blur(24px)', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.15)' }}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 16px', borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'linear-gradient(135deg,#6366F1,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 12px rgba(99,102,241,0.4)' }}>
            <Zap size={14} color="#fff" />
          </div>
          <Search size={14} color="#64748B" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, documents, actions..."
            style={{ flex:1, background:'none', border:'none', outline:'none', color:'#F1F5F9', fontSize:'14px', fontFamily:'Inter,sans-serif' }}
          />
          <kbd style={{ fontSize:'11px', color:'#475569', padding:'2px 6px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'4px' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight:'360px', overflowY:'auto', padding:'8px' }}>
          {filtered.length === 0 && (
            <div style={{ padding:'24px', textAlign:'center', color:'#475569', fontSize:'13px' }}>
              No results for "{query}"
            </div>
          )}
          {groups.map(group => (
            <div key={group}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'1px', padding:'8px 10px 4px' }}>{group}</div>
              {filtered.filter(a => a.group === group).map(action => (
                <div
                  key={action.label}
                  onClick={() => handleSelect(action.href)}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <action.icon size={14} color="#6366F1" />
                  </div>
                  <span style={{ fontSize:'13px', color:'#F1F5F9' }}>{action.label}</span>
                  <div style={{ marginLeft:'auto', fontSize:'11px', color:'#475569', padding:'2px 6px', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px' }}>
                    Enter
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(99,102,241,0.1)', display:'flex', gap:'16px', alignItems:'center' }}>
          <span style={{ fontSize:'11px', color:'#334155' }}>
            <kbd style={{ background:'rgba(255,255,255,0.05)', borderRadius:'3px', padding:'1px 5px', marginRight:'4px' }}>Ctrl</kbd>
            <kbd style={{ background:'rgba(255,255,255,0.05)', borderRadius:'3px', padding:'1px 5px' }}>K</kbd>
            {' '}to toggle
          </span>
          <span style={{ fontSize:'11px', color:'#334155', marginLeft:'auto' }}>
            Powered by PulsarIQ
          </span>
        </div>
      </div>
    </div>
  );
}
