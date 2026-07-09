'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, FileText, MessageSquare, Shield, Settings } from 'lucide-react';

const tabs = [
  { href:'/dashboard', icon:BarChart2,     label:'Home'    },
  { href:'/documents', icon:FileText,      label:'Docs'    },
  { href:'/chat',      icon:MessageSquare, label:'Chat'    },
  { href:'/access',    icon:Shield,        label:'Access'  },
  { href:'/settings',  icon:Settings,      label:'Settings'},
];

export default function MobileNav() {
  const path = usePathname();
  return (
    <div className='mobile-nav' style={{ height:'64px', background:'rgba(3,8,18,0.97)', borderTop:'1px solid rgba(34,211,238,0.1)', backdropFilter:'blur(20px)', alignItems:'center', justifyContent:'space-around', padding:'0 4px' }}>
      {tabs.map(({ href, icon:Icon, label }) => {
        const active = path===href || path.startsWith(href+'/');
        return (
          <Link key={href} href={href} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', padding:'6px 12px', borderRadius:'10px', textDecoration:'none', background:active?'rgba(34,211,238,0.08)':'transparent', flex:1 }}>
            <Icon size={18} color={active?'#22D3EE':'rgba(226,248,255,0.3)'} />
            <span style={{ fontSize:'9px', fontWeight:active?700:400, color:active?'#22D3EE':'rgba(226,248,255,0.3)', letterSpacing:'0.3px' }}>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}