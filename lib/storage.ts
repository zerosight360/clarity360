import { DailyEntry, WeeklyEntry, MonthlyEntry, HabitChallenge, Quote, PhotoEntry } from '@/types';

const STORAGE_KEYS = {
  DAILY: 'productivity_daily_entries',
  WEEKLY: 'productivity_weekly_entries',
  MONTHLY: 'productivity_monthly_entries',
  HABITS: 'productivity_habit_challenges',
  QUOTES: 'productivity_quotes',
  PHOTOS: 'productivity_photos',
  THEME: 'productivity_theme',
} as const;

export interface StorageAdapter {
  getDailyEntries(): DailyEntry[];
  saveDailyEntries(entries: DailyEntry[]): void;
  getWeeklyEntries(): WeeklyEntry[];
  saveWeeklyEntries(entries: WeeklyEntry[]): void;
  getMonthlyEntries(): MonthlyEntry[];
  saveMonthlyEntries(entries: MonthlyEntry[]): void;
  getHabitChallenges(): HabitChallenge[];
  saveHabitChallenges(challenges: HabitChallenge[]): void;
  getQuotes(): Quote[];
  saveQuotes(quotes: Quote[]): void;
  getPhotos(): PhotoEntry[];
  savePhotos(photos: PhotoEntry[]): void;
  getTheme(): 'light' | 'dark';
  saveTheme(theme: 'light' | 'dark'): void;
}

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const localStorageAdapter: StorageAdapter = {
  getDailyEntries: () => safeGetItem<DailyEntry[]>(STORAGE_KEYS.DAILY, []),
  saveDailyEntries: (entries) => safeSetItem(STORAGE_KEYS.DAILY, entries),
  getWeeklyEntries: () => safeGetItem<WeeklyEntry[]>(STORAGE_KEYS.WEEKLY, []),
  saveWeeklyEntries: (entries) => safeSetItem(STORAGE_KEYS.WEEKLY, entries),
  getMonthlyEntries: () => safeGetItem<MonthlyEntry[]>(STORAGE_KEYS.MONTHLY, []),
  saveMonthlyEntries: (entries) => safeSetItem(STORAGE_KEYS.MONTHLY, entries),
  getHabitChallenges: () => safeGetItem<HabitChallenge[]>(STORAGE_KEYS.HABITS, []),
  saveHabitChallenges: (challenges) => safeSetItem(STORAGE_KEYS.HABITS, challenges),
  getQuotes: () => safeGetItem<Quote[]>(STORAGE_KEYS.QUOTES, []),
  saveQuotes: (quotes) => safeSetItem(STORAGE_KEYS.QUOTES, quotes),
  getPhotos: () => safeGetItem<PhotoEntry[]>(STORAGE_KEYS.PHOTOS, []),
  savePhotos: (photos) => safeSetItem(STORAGE_KEYS.PHOTOS, photos),
  getTheme: () => safeGetItem<'light' | 'dark'>(STORAGE_KEYS.THEME, 'dark'),
  saveTheme: (theme) => safeSetItem(STORAGE_KEYS.THEME, theme),
};

export const storage: StorageAdapter = localStorageAdapter;
