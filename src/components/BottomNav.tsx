import { NavLink } from 'react-router-dom';
import { LayoutGrid, Link2, BarChart3, Wallet, MoreHorizontal } from 'lucide-react';
import { haptic } from '@/lib/telegram';

const TABS = [
  { to: '/', label: 'Обзор', icon: LayoutGrid },
  { to: '/links', label: 'Ссылки', icon: Link2 },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { to: '/plans', label: 'Планы', icon: Wallet },
  { to: '/more', label: 'Ещё', icon: MoreHorizontal },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-white/10 bg-tg-secondary-bg pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => haptic('light')}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${isActive ? 'text-tg-link' : 'text-tg-hint'}`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
