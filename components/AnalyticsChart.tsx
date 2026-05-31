'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useProductivityStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';

export function FocusChart() {
  const dailyEntries = useProductivityStore(s => s.dailyEntries);

  const data = useMemo(() => {
    const last14 = [...dailyEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map(e => ({
        date: format(parseISO(e.date), 'MMM d'),
        focus: e.focusScore,
      }));
    return last14;
  }, [dailyEntries]);

  if (data.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">No data yet. Start tracking daily entries.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
        <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Line type="monotone" dataKey="focus" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CompletionChart() {
  const dailyEntries = useProductivityStore(s => s.dailyEntries);

  const data = useMemo(() => {
    const last14 = [...dailyEntries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map(e => ({
        date: format(parseISO(e.date), 'MMM d'),
        completion: e.completionPercentage,
      }));
    return last14;
  }, [dailyEntries]);

  if (data.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Bar dataKey="completion" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
