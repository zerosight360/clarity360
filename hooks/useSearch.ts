'use client';

import { useMemo, useState } from 'react';
import { useProductivityStore } from '@/lib/store';

export function useSearch() {
  const [query, setQuery] = useState('');
  const dailyEntries = useProductivityStore(s => s.dailyEntries);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    return dailyEntries.filter(entry => {
      const matchDate = entry.date.includes(q);
      const matchPriority = entry.priorities.some(p => p.toLowerCase().includes(q));
      const matchTask = entry.tasks.some(t => t.title.toLowerCase().includes(q));
      const matchNotes = entry.notes.wentWell.toLowerCase().includes(q) ||
        entry.notes.improvements.toLowerCase().includes(q);
      return matchDate || matchPriority || matchTask || matchNotes;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [query, dailyEntries]);

  return { query, setQuery, results };
}
