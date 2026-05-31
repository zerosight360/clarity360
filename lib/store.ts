import { create } from 'zustand';
import { DailyEntry, WeeklyEntry, MonthlyEntry, Task, WeeklyGoal, HabitEntry, MonthlyGoal, HabitChallenge, Quote, PhotoEntry } from '@/types';
import { storage } from './storage';
import { generateId, formatDate, formatMonth, getWeekStart } from './utils';

interface ProductivityStore {
  dailyEntries: DailyEntry[];
  weeklyEntries: WeeklyEntry[];
  monthlyEntries: MonthlyEntry[];
  habitChallenges: HabitChallenge[];
  quotes: Quote[];
  photos: PhotoEntry[];
  theme: 'light' | 'dark';
  initialized: boolean;

  initialize: () => void;
  toggleTheme: () => void;

  // Daily
  createDailyEntry: (date?: string) => DailyEntry;
  updateDailyEntry: (id: string, updates: Partial<DailyEntry>) => void;
  addTask: (entryId: string, title: string) => void;
  toggleTask: (entryId: string, taskId: string) => void;
  removeTask: (entryId: string, taskId: string) => void;
  updatePriorities: (entryId: string, priorities: string[]) => void;
  updateFocusScore: (entryId: string, score: number) => void;
  updateNotes: (entryId: string, notes: { wentWell?: string; improvements?: string }) => void;

  // Weekly
  createWeeklyEntry: (weekStart?: string) => WeeklyEntry;
  addWeeklyGoal: (entryId: string, title: string) => void;
  toggleWeeklyGoal: (entryId: string, goalId: string) => void;
  removeWeeklyGoal: (entryId: string, goalId: string) => void;
  addHabit: (entryId: string, name: string) => void;
  toggleHabitDay: (entryId: string, habitId: string, day: string) => void;
  removeHabit: (entryId: string, habitId: string) => void;
  updateWeeklyReflection: (entryId: string, reflection: string) => void;

  // Monthly
  createMonthlyEntry: (month?: string) => MonthlyEntry;
  addMonthlyGoal: (entryId: string, title: string, category: MonthlyGoal['category']) => void;
  toggleMonthlyGoal: (entryId: string, goalId: string) => void;
  removeMonthlyGoal: (entryId: string, goalId: string) => void;
  updateMonthlyReview: (entryId: string, review: string) => void;

  // Habit Challenges (21/90 day)
  addHabitChallenge: (name: string, emoji: string, duration: 21 | 90) => void;
  toggleChallengeDay: (challengeId: string, day: number) => void;
  removeHabitChallenge: (challengeId: string) => void;

  // Quotes & Photos
  addQuote: (text: string, author: string) => void;
  removeQuote: (id: string) => void;
  addPhoto: (url: string, caption: string) => void;
  removePhoto: (id: string) => void;
}

function calculateCompletion(entry: DailyEntry): number {
  if (entry.tasks.length === 0) return 0;
  const completed = entry.tasks.filter(t => t.completed).length;
  return Math.round((completed / entry.tasks.length) * 100);
}

export const useProductivityStore = create<ProductivityStore>((set, get) => ({
  dailyEntries: [],
  weeklyEntries: [],
  monthlyEntries: [],
  habitChallenges: [],
  quotes: [],
  photos: [],
  theme: 'dark',
  initialized: false,

  initialize: () => {
    set({
      dailyEntries: storage.getDailyEntries(),
      weeklyEntries: storage.getWeeklyEntries(),
      monthlyEntries: storage.getMonthlyEntries(),
      habitChallenges: storage.getHabitChallenges(),
      quotes: storage.getQuotes(),
      photos: storage.getPhotos(),
      theme: storage.getTheme(),
      initialized: true,
    });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    storage.saveTheme(newTheme);
  },

  // Daily
  createDailyEntry: (date?: string) => {
    const entryDate = date || formatDate(new Date());
    const existing = get().dailyEntries.find(e => e.date === entryDate);
    if (existing) return existing;

    const newEntry: DailyEntry = {
      id: generateId(),
      date: entryDate,
      priorities: ['Gym / Workout', 'Deep Work Session', 'Read 30 mins'],
      tasks: [
        { id: generateId(), title: '🏋️ Gym / Exercise', completed: false, createdAt: new Date().toISOString() },
        { id: generateId(), title: '💼 Focused Work Block', completed: false, createdAt: new Date().toISOString() },
        { id: generateId(), title: '📖 Read 30 minutes', completed: false, createdAt: new Date().toISOString() },
        { id: generateId(), title: '🧘 Meditate 10 minutes', completed: false, createdAt: new Date().toISOString() },
        { id: generateId(), title: '💧 Drink 3L water', completed: false, createdAt: new Date().toISOString() },
      ],
      focusScore: 5,
      notes: { wentWell: '', improvements: '' },
      completionPercentage: 0,
    };

    const entries = [...get().dailyEntries, newEntry];
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
    return newEntry;
  },

  updateDailyEntry: (id, updates) => {
    const entries = get().dailyEntries.map(e => e.id === id ? { ...e, ...updates } : e);
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
  },

  addTask: (entryId, title) => {
    const entries = get().dailyEntries.map(e => {
      if (e.id !== entryId) return e;
      const newTask: Task = { id: generateId(), title, completed: false, createdAt: new Date().toISOString() };
      const updated = { ...e, tasks: [...e.tasks, newTask] };
      updated.completionPercentage = calculateCompletion(updated);
      return updated;
    });
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
  },

  toggleTask: (entryId, taskId) => {
    const entries = get().dailyEntries.map(e => {
      if (e.id !== entryId) return e;
      const tasks = e.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const updated = { ...e, tasks };
      updated.completionPercentage = calculateCompletion(updated);
      return updated;
    });
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
  },

  removeTask: (entryId, taskId) => {
    const entries = get().dailyEntries.map(e => {
      if (e.id !== entryId) return e;
      const tasks = e.tasks.filter(t => t.id !== taskId);
      const updated = { ...e, tasks };
      updated.completionPercentage = calculateCompletion(updated);
      return updated;
    });
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
  },

  updatePriorities: (entryId, priorities) => {
    const entries = get().dailyEntries.map(e => e.id === entryId ? { ...e, priorities } : e);
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
  },

  updateFocusScore: (entryId, score) => {
    const entries = get().dailyEntries.map(e => e.id === entryId ? { ...e, focusScore: score } : e);
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
  },

  updateNotes: (entryId, notes) => {
    const entries = get().dailyEntries.map(e => e.id === entryId ? { ...e, notes: { ...e.notes, ...notes } } : e);
    set({ dailyEntries: entries });
    storage.saveDailyEntries(entries);
  },

  // Weekly
  createWeeklyEntry: (weekStart?: string) => {
    const ws = weekStart || getWeekStart(new Date());
    const existing = get().weeklyEntries.find(e => e.weekStart === ws);
    if (existing) return existing;

    const newEntry: WeeklyEntry = {
      id: generateId(),
      weekStart: ws,
      goals: [
        { id: generateId(), title: 'Workout 5 days this week', completed: false, weekStart: ws },
        { id: generateId(), title: 'Complete work project milestone', completed: false, weekStart: ws },
        { id: generateId(), title: 'Read 1 chapter of a book', completed: false, weekStart: ws },
      ],
      habits: [
        { id: generateId(), name: '🏋️ Gym', weekStart: ws, days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false } },
        { id: generateId(), name: '🧘 Meditate', weekStart: ws, days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false } },
        { id: generateId(), name: '📖 Read', weekStart: ws, days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false } },
        { id: generateId(), name: '💧 Water 3L', weekStart: ws, days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false } },
      ],
      reflection: '',
    };

    const entries = [...get().weeklyEntries, newEntry];
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
    return newEntry;
  },

  addWeeklyGoal: (entryId, title) => {
    const entries = get().weeklyEntries.map(e => {
      if (e.id !== entryId || e.goals.length >= 5) return e;
      const newGoal: WeeklyGoal = { id: generateId(), title, completed: false, weekStart: e.weekStart };
      return { ...e, goals: [...e.goals, newGoal] };
    });
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
  },

  toggleWeeklyGoal: (entryId, goalId) => {
    const entries = get().weeklyEntries.map(e => {
      if (e.id !== entryId) return e;
      return { ...e, goals: e.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g) };
    });
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
  },

  removeWeeklyGoal: (entryId, goalId) => {
    const entries = get().weeklyEntries.map(e => {
      if (e.id !== entryId) return e;
      return { ...e, goals: e.goals.filter(g => g.id !== goalId) };
    });
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
  },

  addHabit: (entryId, name) => {
    const entries = get().weeklyEntries.map(e => {
      if (e.id !== entryId) return e;
      const newHabit: HabitEntry = {
        id: generateId(), name, weekStart: e.weekStart,
        days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
      };
      return { ...e, habits: [...e.habits, newHabit] };
    });
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
  },

  toggleHabitDay: (entryId, habitId, day) => {
    const entries = get().weeklyEntries.map(e => {
      if (e.id !== entryId) return e;
      const habits = e.habits.map(h => h.id !== habitId ? h : { ...h, days: { ...h.days, [day]: !h.days[day] } });
      return { ...e, habits };
    });
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
  },

  removeHabit: (entryId, habitId) => {
    const entries = get().weeklyEntries.map(e => {
      if (e.id !== entryId) return e;
      return { ...e, habits: e.habits.filter(h => h.id !== habitId) };
    });
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
  },

  updateWeeklyReflection: (entryId, reflection) => {
    const entries = get().weeklyEntries.map(e => e.id === entryId ? { ...e, reflection } : e);
    set({ weeklyEntries: entries });
    storage.saveWeeklyEntries(entries);
  },

  // Monthly
  createMonthlyEntry: (month?: string) => {
    const m = month || formatMonth(new Date());
    const existing = get().monthlyEntries.find(e => e.month === m);
    if (existing) return existing;

    const newEntry: MonthlyEntry = {
      id: generateId(),
      month: m,
      goals: [
        { id: generateId(), title: 'Workout 20+ days', category: 'health', completed: false, month: m },
        { id: generateId(), title: 'Complete project deliverable', category: 'work', completed: false, month: m },
        { id: generateId(), title: 'Read 2 books', category: 'learning', completed: false, month: m },
        { id: generateId(), title: 'Meditate daily', category: 'personal', completed: false, month: m },
      ],
      review: '',
      metrics: { completedTasks: 0, habitSuccessRate: 0, goalsCompleted: 0 },
    };

    const entries = [...get().monthlyEntries, newEntry];
    set({ monthlyEntries: entries });
    storage.saveMonthlyEntries(entries);
    return newEntry;
  },

  addMonthlyGoal: (entryId, title, category) => {
    const entries = get().monthlyEntries.map(e => {
      if (e.id !== entryId) return e;
      const newGoal: MonthlyGoal = { id: generateId(), title, category, completed: false, month: e.month };
      return { ...e, goals: [...e.goals, newGoal] };
    });
    set({ monthlyEntries: entries });
    storage.saveMonthlyEntries(entries);
  },

  toggleMonthlyGoal: (entryId, goalId) => {
    const entries = get().monthlyEntries.map(e => {
      if (e.id !== entryId) return e;
      const goals = e.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
      return { ...e, goals, metrics: { ...e.metrics, goalsCompleted: goals.filter(g => g.completed).length } };
    });
    set({ monthlyEntries: entries });
    storage.saveMonthlyEntries(entries);
  },

  removeMonthlyGoal: (entryId, goalId) => {
    const entries = get().monthlyEntries.map(e => {
      if (e.id !== entryId) return e;
      return { ...e, goals: e.goals.filter(g => g.id !== goalId) };
    });
    set({ monthlyEntries: entries });
    storage.saveMonthlyEntries(entries);
  },

  updateMonthlyReview: (entryId, review) => {
    const entries = get().monthlyEntries.map(e => e.id === entryId ? { ...e, review } : e);
    set({ monthlyEntries: entries });
    storage.saveMonthlyEntries(entries);
  },

  // Habit Challenges
  addHabitChallenge: (name, emoji, duration) => {
    const challenge: HabitChallenge = {
      id: generateId(),
      name, emoji, duration,
      startDate: formatDate(new Date()),
      days: {},
      createdAt: new Date().toISOString(),
    };
    const challenges = [...get().habitChallenges, challenge];
    set({ habitChallenges: challenges });
    storage.saveHabitChallenges(challenges);
  },

  toggleChallengeDay: (challengeId, day) => {
    const challenges = get().habitChallenges.map(c => {
      if (c.id !== challengeId) return c;
      const dayKey = String(day);
      return { ...c, days: { ...c.days, [dayKey]: !c.days[dayKey] } };
    });
    set({ habitChallenges: challenges });
    storage.saveHabitChallenges(challenges);
  },

  removeHabitChallenge: (challengeId) => {
    const challenges = get().habitChallenges.filter(c => c.id !== challengeId);
    set({ habitChallenges: challenges });
    storage.saveHabitChallenges(challenges);
  },

  // Quotes & Photos
  addQuote: (text, author) => {
    const quote: Quote = { id: generateId(), text, author, createdAt: new Date().toISOString() };
    const quotes = [...get().quotes, quote];
    set({ quotes });
    storage.saveQuotes(quotes);
  },

  removeQuote: (id) => {
    const quotes = get().quotes.filter(q => q.id !== id);
    set({ quotes });
    storage.saveQuotes(quotes);
  },

  addPhoto: (url, caption) => {
    const photo: PhotoEntry = { id: generateId(), url, caption, createdAt: new Date().toISOString() };
    const photos = [...get().photos, photo];
    set({ photos });
    storage.savePhotos(photos);
  },

  removePhoto: (id) => {
    const photos = get().photos.filter(p => p.id !== id);
    set({ photos });
    storage.savePhotos(photos);
  },
}));
