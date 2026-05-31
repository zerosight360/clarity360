import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameWeek, parseISO } from 'date-fns';
import { DailyEntry, MonthlyEntry } from '@/types';

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatMonth(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function getWeekStart(date: Date): string {
  return formatDate(startOfWeek(date, { weekStartsOn: 1 }));
}

export function getWeekEnd(date: Date): string {
  return formatDate(endOfWeek(date, { weekStartsOn: 1 }));
}

export function getWeekDays(weekStart: string): Date[] {
  const start = parseISO(weekStart);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getTodayEntry(entries: DailyEntry[]): DailyEntry | undefined {
  const today = formatDate(new Date());
  return entries.find(e => e.date === today);
}

export function getWeeklyProgress(entries: DailyEntry[]): number {
  const now = new Date();
  const weekEntries = entries.filter(e => isSameWeek(parseISO(e.date), now, { weekStartsOn: 1 }));
  if (weekEntries.length === 0) return 0;
  const totalCompletion = weekEntries.reduce((sum, e) => sum + e.completionPercentage, 0);
  return Math.round(totalCompletion / weekEntries.length);
}

export function getMonthlyProgress(monthlyEntries: MonthlyEntry[]): number {
  const currentMonth = formatMonth(new Date());
  const entry = monthlyEntries.find(e => e.month === currentMonth);
  if (!entry || entry.goals.length === 0) return 0;
  const completed = entry.goals.filter(g => g.completed).length;
  return Math.round((completed / entry.goals.length) * 100);
}

export function getDailyTasksCompleted(entries: DailyEntry[]): number {
  const today = formatDate(new Date());
  const todayEntry = entries.find(e => e.date === today);
  if (!todayEntry) return 0;
  return todayEntry.tasks.filter(t => t.completed).length;
}

export function getStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sorted = [...entries]
    .filter(e => e.completionPercentage > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sorted.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  let checkDate = today;
  
  for (let i = 0; i < sorted.length; i++) {
    const entryDate = parseISO(sorted[i].date);
    const diff = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff <= 1) {
      streak++;
      checkDate = entryDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
