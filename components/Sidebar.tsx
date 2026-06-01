'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getUser } from '@/lib/auth';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/daily', label: 'Daily Log', icon: '📝' },
  { href: '/weekly', label: 'Weekly Plan', icon: '📅' },
  { href: '/monthly', label: 'Monthly Goals', icon: '📊' },
  { href: '/goals', label: 'Life Goals', icon: '🎯' },
  { href: '/habits', label: 'Habit Streaks', icon: '🔥' },
  { href: '/streaks', label: '100 Day Challenge', icon: '🏆' },
  { href: '/gym', label: 'Gym Workouts', icon: '💪' },
  { href: '/calendar', label: 'Calendar', icon: '📆' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/quotes', label: 'Motivation', icon: '💡' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

const sidebarGroups = [
  { label: null, items: [{ href: '/', label: 'Home', icon: '🏠' }] },
  { label: 'PLAN', items: [
    { href: '/daily', label: 'Daily Log', icon: '📝' },
    { href: '/weekly', label: 'Weekly Plan', icon: '📅' },
    { href: '/monthly', label: 'Monthly Goals', icon: '📊' },
  ]},
  { label: 'GROW', items: [
    { href: '/goals', label: 'Life Goals', icon: '🎯' },
    { href: '/habits', label: 'Habit Streaks', icon: '🔥' },
    { href: '/streaks', label: '100 Day Challenge', icon: '🏆' },
    { href: '/gym', label: 'Gym Workouts', icon: '💪' },
  ]},
  { label: 'REVIEW', items: [
    { href: '/calendar', label: 'Calendar', icon: '📆' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/quotes', label: 'Motivation', icon: '💡' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-[245px] md:fixed md:inset-y-0 border-r z-30" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="px-6 pt-7 pb-5">
          <h1 className="text-[22px] font-bold gradient-text">Clarity360</h1>
        </div>
        <nav className="flex-1 px-3 overflow-y-auto pb-2">
          {sidebarGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-3 pt-5 pb-1 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-secondary)' }}>{group.label}</p>
              )}
              {group.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-4 px-3 py-3 rounded-lg transition-all', isActive ? 'font-bold' : 'font-normal hover:bg-[var(--border-light)]')}>
                    <span className={cn('text-[22px] transition-transform', isActive && 'scale-110')}>{item.icon}</span>
                    <span className={cn('text-[15px]', isActive ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-primary)]')}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href="/settings" className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[var(--border-light)] transition-all">
            {user?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
                {user?.initial || 'U'}
              </div>
            )}
            <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Profile'}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-[70px] left-4 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        aria-label="Open menu"
      >
        <span className="text-[18px]">☰</span>
      </button>

      {/* Mobile Slide-out Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-[280px] overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            <div className="px-5 pt-6 pb-4 flex items-center justify-between">
              <h1 className="text-[20px] font-bold gradient-text">Clarity360</h1>
              <button onClick={() => setMobileOpen(false)} className="text-[20px]" style={{ color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <nav className="px-3 pb-6">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={cn('flex items-center gap-4 px-3 py-3 rounded-lg transition-all', isActive ? 'font-bold' : 'hover:bg-[var(--border-light)]')}>
                    <span className="text-[20px]">{item.icon}</span>
                    <span className={cn('text-[15px]', isActive ? 'font-bold' : '')} style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            {/* Profile at bottom */}
            <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
                  {user?.initial || 'U'}
                </div>
                <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Profile'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav (quick access) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <div className="flex justify-around py-2 px-1">
          {[navItems[0], navItems[1], navItems[4], navItems[5], navItems[7]].map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center py-1 px-3">
                <span className={cn('text-[24px]', isActive && 'scale-110')}>{item.icon}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
