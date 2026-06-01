export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface DailyEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  priorities: string[];
  tasks: Task[];
  focusScore: number; // 1-10
  notes: {
    wentWell: string;
    improvements: string;
  };
  completionPercentage: number;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  completed: boolean;
  weekStart: string; // ISO date string
}

export interface HabitEntry {
  id: string;
  name: string;
  weekStart: string;
  days: { [key: string]: boolean }; // mon, tue, wed, thu, fri, sat, sun
}

export interface WeeklyEntry {
  id: string;
  weekStart: string;
  goals: WeeklyGoal[];
  habits: HabitEntry[];
  reflection: string;
}

export type GoalCategory = 'work' | 'personal' | 'learning' | 'health';

export interface MonthlyGoal {
  id: string;
  title: string;
  category: GoalCategory;
  completed: boolean;
  month: string; // YYYY-MM
}

export interface MonthlyEntry {
  id: string;
  month: string; // YYYY-MM
  goals: MonthlyGoal[];
  review: string;
  metrics: {
    completedTasks: number;
    habitSuccessRate: number;
    goalsCompleted: number;
  };
}

// 14/21/90-day Habit Tracker
export interface HabitChallenge {
  id: string;
  name: string;
  emoji: string;
  duration: 14 | 21 | 90;
  startDate: string; // ISO date
  days: { [dayNumber: string]: boolean }; // "1" to "21" or "90"
  createdAt: string;
}

// Quotes & Photos
export interface Quote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface PhotoEntry {
  id: string;
  url: string; // base64 data URL
  caption: string;
  createdAt: string;
}

export interface AppState {
  dailyEntries: DailyEntry[];
  weeklyEntries: WeeklyEntry[];
  monthlyEntries: MonthlyEntry[];
  habitChallenges: HabitChallenge[];
  quotes: Quote[];
  photos: PhotoEntry[];
  theme: 'light' | 'dark';
}
