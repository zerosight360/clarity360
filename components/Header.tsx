'use client';

import { format } from 'date-fns';
import SearchModal from './SearchModal';
import { useTheme } from '@/hooks/useStore';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20">
      {/* Motivational Banner - Instagram gradient */}
      <div className="banner-gradient text-center py-2 px-4">
        <p className="text-[12px] font-semibold text-white tracking-wide">
          People become what they think of themselves
        </p>
      </div>

      {/* Main Header */}
      <div className="border-b flex items-center justify-between h-[52px] px-5" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
        <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
        <div className="flex items-center gap-3">
          <SearchModal />
          <button
            onClick={toggleTheme}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--border-light)]"
            aria-label="Toggle theme"
          >
            <span className="text-[18px]">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
