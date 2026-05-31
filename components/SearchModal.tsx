'use client';

import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { query, setQuery, results } = useSearch();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-[7px] rounded-lg text-[13px] font-normal"
        style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
        aria-label="Search"
      >
        🔍 <span className="hidden sm:inline">Search</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--bg-elevated)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent outline-none text-[16px] font-normal placeholder:text-[var(--text-secondary)]"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 && query && (
                <p className="text-center py-10 text-[14px]" style={{ color: 'var(--text-secondary)' }}>No results found.</p>
              )}
              {results.map(entry => (
                <Link key={entry.id} href={`/daily?date=${entry.date}`} onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--border-light)] transition-colors">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }}>
                    {entry.completionPercentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {format(parseISO(entry.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-[12px] truncate" style={{ color: 'var(--text-secondary)' }}>
                      {entry.tasks.map(t => t.title).join(' · ')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
