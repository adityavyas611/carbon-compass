// ──────────────────────────────────────────────
// Assessment / Onboarding
// ──────────────────────────────────────────────
export interface TransportData {
  carType: 'none' | 'petrol' | 'diesel' | 'hybrid' | 'electric';
  carMilesPerWeek: number;
  flightsShortPerYear: number;
  flightsLongPerYear: number;
  publicTransitDaysPerWeek: number;
}

export interface EnergyData {
  electricitySource: 'grid' | 'renewable' | 'solar' | 'mixed';
  heatingType: 'gas' | 'oil' | 'electric' | 'heat-pump' | 'none';
  homeSizeSqft: number;
  numPeople: number;
}

export interface DietData {
  dietType: 'vegan' | 'vegetarian' | 'pescatarian' | 'flexitarian' | 'omnivore' | 'heavy-meat';
  localFoodPercent: number;
  foodWasteLevel: 'low' | 'medium' | 'high';
}

export interface ShoppingData {
  newClothingItemsPerMonth: number;
  electronicsPerYear: number;
  onlineOrdersPerWeek: number;
  buySecondhand: boolean;
}

export interface AssessmentData {
  transport: TransportData;
  energy: EnergyData;
  diet: DietData;
  shopping: ShoppingData;
}

// ──────────────────────────────────────────────
// Footprint Scores
// ──────────────────────────────────────────────
export interface FootprintBreakdown {
  transport: number;   // kg CO₂e / year
  energy: number;
  diet: number;
  shopping: number;
  total: number;
}

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
  date: string;  // ISO date string
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
  month: string;  // 'YYYY-MM'
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
