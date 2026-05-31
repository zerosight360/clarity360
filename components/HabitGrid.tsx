'use client';

import { cn } from '@/lib/utils';
import { HabitEntry } from '@/types';
import { useState } from 'react';

interface HabitGridProps {
  habits: HabitEntry[];
  onToggleDay: (habitId: string, day: string) => void;
  onAdd: (name: string) => void;
  onRemove: (habitId: string) => void;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HabitGrid({ habits, onToggleDay, onAdd, onRemove }: HabitGridProps) {
  const [newHabit, setNewHabit] = useState('');

  const handleAdd = () => {
    if (!newHabit.trim()) return;
    onAdd(newHabit.trim());
    setNewHabit('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a habit..."
          className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!newHabit.trim()}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {habits.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 pr-4">Habit</th>
                {DAY_LABELS.map((label, i) => (
                  <th key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 pb-2 w-9">
                    {label}
                  </th>
                ))}
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => {
                const completedDays = DAYS.filter(d => habit.days[d]).length;
                return (
                  <tr key={habit.id} className="group">
                    <td className="py-1.5 pr-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{habit.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{completedDays}/7</span>
                    </td>
                    {DAYS.map(day => (
                      <td key={day} className="text-center py-1.5">
                        <button
                          onClick={() => onToggleDay(habit.id, day)}
                          className={cn(
                            'w-7 h-7 rounded-md transition-all text-xs',
                            habit.days[day]
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          )}
                          aria-label={`${habit.name} ${day} ${habit.days[day] ? 'completed' : 'not completed'}`}
                        >
                          {habit.days[day] ? '✓' : ''}
                        </button>
                      </td>
                    ))}
                    <td className="py-1.5">
                      <button
                        onClick={() => onRemove(habit.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
                        aria-label={`Remove ${habit.name}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {habits.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
          No habits tracked yet. Add one above.
        </p>
      )}
    </div>
  );
}
