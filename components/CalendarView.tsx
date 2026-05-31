'use client';

import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { useProductivityStore } from '@/lib/store';
import { cn, formatDate, formatMonth } from '@/lib/utils';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const dailyEntries = useProductivityStore(s => s.dailyEntries);
  const monthlyEntries = useProductivityStore(s => s.monthlyEntries);
  const createDailyEntry = useProductivityStore(s => s.createDailyEntry);
  const updateDailyEntry = useProductivityStore(s => s.updateDailyEntry);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  const startDayOfWeek = getDay(monthStart);
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getEntryForDay = (day: Date) => {
    return dailyEntries.find(e => isSameDay(parseISO(e.date), day));
  };

  const getColorForCompletion = (pct: number) => {
    if (pct === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (pct < 30) return 'bg-red-100 dark:bg-red-900/30';
    if (pct < 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (pct < 80) return 'bg-blue-100 dark:bg-blue-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  const handleDayTap = (day: Date) => {
    const dateStr = formatDate(day);
    setEditingDay(editingDay === dateStr ? null : dateStr);
  };

  const handleSetPercentage = (day: Date, pct: number) => {
    const dateStr = formatDate(day);
    let entry = dailyEntries.find(e => e.date === dateStr);
    if (!entry) {
      entry = createDailyEntry(dateStr);
    }
    updateDailyEntry(entry.id, { completionPercentage: pct });
    setEditingDay(null);
  };

  // Calculate weekly averages
  const weeklyAverages = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const weekEntries = weekDays
        .map(d => dailyEntries.find(e => isSameDay(parseISO(e.date), d)))
        .filter(Boolean);

      if (weekEntries.length === 0) return null;

      const totalTasks = weekEntries.reduce((sum, e) => sum + e!.tasks.length, 0);
      const completedTasks = weekEntries.reduce((sum, e) => sum + e!.tasks.filter(t => t.completed).length, 0);
      const avgPct = Math.round(weekEntries.reduce((sum, e) => sum + e!.completionPercentage, 0) / weekEntries.length);

      return { weekStart: format(weekStart, 'MMM d'), totalTasks, completedTasks, avgPct, daysLogged: weekEntries.length };
    }).filter(Boolean);
  }, [dailyEntries, monthStart, monthEnd]);

  // Monthly average
  const monthlyAverage = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    const monthEntries = dailyEntries.filter(e => e.date.startsWith(monthStr));
    if (monthEntries.length === 0) return null;

    const totalTasks = monthEntries.reduce((sum, e) => sum + e.tasks.length, 0);
    const completedTasks = monthEntries.reduce((sum, e) => sum + e.tasks.filter(t => t.completed).length, 0);
    const avgPct = Math.round(monthEntries.reduce((sum, e) => sum + e.completionPercentage, 0) / monthEntries.length);

    return { totalTasks, completedTasks, avgPct, daysLogged: monthEntries.length };
  }, [dailyEntries, currentMonth]);

  // Monthly goals
  const monthlyGoals = useMemo(() => {
    const monthStr = formatMonth(currentMonth);
    const entry = monthlyEntries.find(e => e.month === monthStr);
    return entry?.goals || [];
  }, [monthlyEntries, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const entry = getEntryForDay(day);
          const isToday = isSameDay(day, new Date());
          const dateStr = formatDate(day);
          const isEditing = editingDay === dateStr;
          const completedTasks = entry ? entry.tasks.filter(t => t.completed).length : 0;
          const totalTasks = entry ? entry.tasks.length : 0;

          return (
            <div key={day.toISOString()} className="relative">
              <button
                onClick={() => handleDayTap(day)}
                className={cn(
                  'w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all p-0.5',
                  entry ? getColorForCompletion(entry.completionPercentage) : 'bg-gray-50 dark:bg-gray-800/50',
                  isToday && 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-950',
                  'hover:scale-105 active:scale-95'
                )}
                aria-label={`${format(day, 'MMM d')} - ${entry ? `${completedTasks}/${totalTasks} tasks, ${entry.completionPercentage}%` : 'No entry'}`}
              >
                <span className={cn(
                  'font-semibold text-sm leading-none',
                  isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {format(day, 'd')}
                </span>
                {entry && totalTasks > 0 && (
                  <span className="text-[8px] font-bold text-gray-700 dark:text-gray-200 mt-0.5 leading-none">
                    {completedTasks}/{totalTasks}
                  </span>
                )}
                {entry && (
                  <span className={cn(
                    'text-[8px] font-bold mt-0.5 leading-none',
                    entry.completionPercentage >= 80 ? 'text-green-600 dark:text-green-400' :
                    entry.completionPercentage >= 50 ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-500 dark:text-gray-400'
                  )}>
                    {entry.completionPercentage}%
                  </span>
                )}
              </button>

              {/* Quick percentage setter popup */}
              {isEditing && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[140px]">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mb-1.5 font-medium">Set completion</p>
                  <div className="grid grid-cols-3 gap-1">
                    {[25, 50, 75, 80, 90, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => handleSetPercentage(day, pct)}
                        className={cn(
                          'py-1.5 rounded-lg text-xs font-bold transition-all active:scale-90',
                          pct === 100
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                        )}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" />
          <span className="text-[10px] text-gray-500">No data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
          <span className="text-[10px] text-gray-500">&lt;30%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30" />
          <span className="text-[10px] text-gray-500">30-59%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30" />
          <span className="text-[10px] text-gray-500">60-79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" />
          <span className="text-[10px] text-gray-500">80%+</span>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
        Tap any day to manually set completion
      </p>

      {/* Weekly Averages */}
      {weeklyAverages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">📅 Weekly Summary</h4>
          <div className="space-y-1.5">
            {weeklyAverages.map((week, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50">
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Week of {week!.weekStart}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{week!.daysLogged} days logged</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {week!.completedTasks}/{week!.totalTasks} tasks
                  </span>
                  <span className={cn(
                    'text-xs font-bold px-2 py-1 rounded-lg',
                    week!.avgPct >= 80
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : week!.avgPct >= 50
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  )}>
                    {week!.avgPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Average */}
      {monthlyAverage && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/30 dark:border-indigo-800/30">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">📊 Month Average — {format(currentMonth, 'MMMM')}</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{monthlyAverage.completedTasks}/{monthlyAverage.totalTasks}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Tasks Done</p>
            </div>
            <div className="text-center">
              <p className={cn(
                'text-xl font-bold',
                monthlyAverage.avgPct >= 80 ? 'text-green-600 dark:text-green-400' :
                monthlyAverage.avgPct >= 50 ? 'text-blue-600 dark:text-blue-400' :
                'text-orange-600 dark:text-orange-400'
              )}>
                {monthlyAverage.avgPct}%
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Avg Completion</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{monthlyAverage.daysLogged}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Days Logged</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Goals */}
      {monthlyGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">🎯 Monthly Goals</h4>
          <div className="space-y-1.5">
            {monthlyGoals.map(goal => (
              <div key={goal.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50">
                <span className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                  goal.completed
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}>
                  {goal.completed ? '✓' : '○'}
                </span>
                <span className={cn(
                  'flex-1 text-sm',
                  goal.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {goal.title}
                </span>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-lg',
                  goal.completed
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                )}>
                  {goal.completed ? 'Achieved ✓' : 'In Progress'}
                </span>
              </div>
            ))}
            {/* Goals summary */}
            <div className="flex items-center justify-between pt-2 px-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {monthlyGoals.filter(g => g.completed).length}/{monthlyGoals.length} goals achieved
              </span>
              <span className={cn(
                'text-xs font-bold',
                monthlyGoals.filter(g => g.completed).length === monthlyGoals.length
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              )}>
                {Math.round((monthlyGoals.filter(g => g.completed).length / monthlyGoals.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
