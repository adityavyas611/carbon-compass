import type {
  TransportInput,
  EnergyInput,
  DietInput,
  ShoppingInput,
  AssessmentInput,
  ActivityLogInput,
  LogActionInput,
  FootprintBreakdown,
} from '@/lib/schemas';

// ──────────────────────────────────────────────
// Assessment / Onboarding (Zod-inferred — single source of truth)
// ──────────────────────────────────────────────
export type TransportData = TransportInput;
export type EnergyData = EnergyInput;
export type DietData = DietInput;
export type ShoppingData = ShoppingInput;
export type AssessmentData = AssessmentInput;
export type { ActivityLogInput, LogActionInput, FootprintBreakdown };

// ──────────────────────────────────────────────
// Actions
// ──────────────────────────────────────────────
export type ActionCategory = 'transport' | 'diet' | 'energy' | 'shopping';
export type ActionDifficulty = 'Easy' | 'Medium' | 'Habit Change';

export interface Action {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  difficulty: ActionDifficulty;
  co2SavedKg: number;
  icon: string;
  tips: string[];
}

export interface LoggedAction {
  actionId: string;
  date: string;
  co2SavedKg: number;
}

// ──────────────────────────────────────────────
// Activity Logs
// ──────────────────────────────────────────────
export type ActivityType = 'meal' | 'commute' | 'purchase' | 'energy';

export interface ActivityLog {
  id: string;
  date: string;
  type: ActivityType;
  label: string;
  co2Kg: number;
  note?: string;
}

// ──────────────────────────────────────────────
// Gamification
// ──────────────────────────────────────────────
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: ActionCategory | 'general';
}

export interface Streak {
  currentDays: number;
  longestDays: number;
  lastLogDate: string | null;
}

// ──────────────────────────────────────────────
// Monthly Stats
// ──────────────────────────────────────────────
export interface MonthlyData {
  month: string;
  footprintKg: number;
  actionsCompleted: number;
  co2SavedKg: number;
}

// ──────────────────────────────────────────────
// App State
// ──────────────────────────────────────────────
export type AppView = 'onboarding' | 'dashboard' | 'actions' | 'tracker' | 'progress';

export interface AppState {
  hasCompletedOnboarding: boolean;
  assessment: AssessmentData | null;
  footprint: FootprintBreakdown | null;
  loggedActions: LoggedAction[];
  activityLogs: ActivityLog[];
  badges: Badge[];
  streak: Streak;
  monthlyHistory: MonthlyData[];
  currentView: AppView;
  insights: string[];
  weeklyReport: string | null;
}
