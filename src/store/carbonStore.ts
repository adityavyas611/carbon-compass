import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  AppView,
  AssessmentData,
  LoggedAction,
  ActivityLog,
  Badge,
} from '@/types';
import { calcFullFootprint } from '@/utils/calculations';
import { ALL_ACTIONS } from '@/utils/actions';
import { AssessmentSchema, ActivityLogInputSchema, LogActionSchema } from '@/lib/schemas';
import { format } from 'date-fns';

const INITIAL_BADGES: Badge[] = [
  { id: 'first-log', title: 'First Step', description: 'Logged your first activity', icon: '🌱', earned: false, category: 'general' },
  { id: 'assessment-done', title: 'Know Thyself', description: 'Completed the carbon assessment', icon: '📊', earned: false, category: 'general' },
  { id: '7-day-streak', title: 'Week Warrior', description: '7-day logging streak', icon: '🔥', earned: false, category: 'general' },
  { id: '30-day-streak', title: 'Month Master', description: '30-day logging streak', icon: '⚡', earned: false, category: 'general' },
  { id: 'plant-meal', title: 'Plant Pioneer', description: 'Logged 10 plant-based meals', icon: '🥗', earned: false, category: 'diet' },
  { id: 'meat-reducer', title: '30-Day Meat Reducer', description: 'Reduced meat 30 days in a row', icon: '🌿', earned: false, category: 'diet' },
  { id: 'first-flight-offset', title: 'Flight Offset', description: 'Offset your first flight', icon: '✈️', earned: false, category: 'transport' },
  { id: 'green-energy', title: 'Solar Pledge', description: 'Switched to renewable energy', icon: '☀️', earned: false, category: 'energy' },
  { id: 'bike-commuter', title: 'Pedal Power', description: 'Biked to work 5 times', icon: '🚲', earned: false, category: 'transport' },
  { id: 'ton-saved', title: '1 Tonne Club', description: 'Saved 1,000 kg CO₂ total', icon: '🏆', earned: false, category: 'general' },
];

interface CarbonStore extends AppState {
  setView: (view: AppView) => void;
  completeAssessment: (data: AssessmentData) => void;
  logAction: (actionId: string, co2SavedKg: number) => void;
  logActivity: (activity: Omit<ActivityLog, 'id'>) => void;
  addInsight: (insight: string) => void;
  setWeeklyReport: (report: string) => void;
  checkAndAwardBadges: () => void;
  resetAll: () => void;
  getTotalSaved: () => number;
}

export const useCarbonStore = create<CarbonStore>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      assessment: null,
      footprint: null,
      loggedActions: [],
      activityLogs: [],
      badges: INITIAL_BADGES,
      streak: { currentDays: 0, longestDays: 0, lastLogDate: null },
      monthlyHistory: [],
      currentView: 'onboarding',
      insights: [],
      weeklyReport: null,

      setView: (view) => set({ currentView: view }),

      completeAssessment: (data) => {
        const parsed = AssessmentSchema.safeParse(data);
        if (!parsed.success) {
          if (import.meta.env.DEV) console.error(parsed.error);
          return;
        }

        const footprint = calcFullFootprint(parsed.data);
        const today = format(new Date(), 'yyyy-MM');

        set((state) => {
          const monthExists = state.monthlyHistory.find((m) => m.month === today);
          const monthlyHistory = monthExists
            ? state.monthlyHistory.map((m) =>
                m.month === today ? { ...m, footprintKg: footprint.total } : m
              )
            : [
                ...state.monthlyHistory,
                { month: today, footprintKg: footprint.total, actionsCompleted: 0, co2SavedKg: 0 },
              ];

          const badges = state.badges.map((b) =>
            b.id === 'assessment-done' ? { ...b, earned: true, earnedDate: new Date().toISOString() } : b
          );

          return {
            hasCompletedOnboarding: true,
            assessment: parsed.data,
            footprint,
            currentView: 'dashboard',
            monthlyHistory,
            badges,
          };
        });
      },

      logAction: (actionId, co2SavedKg) => {
        const parsed = LogActionSchema.safeParse({ actionId, co2SavedKg });
        if (!parsed.success) {
          if (import.meta.env.DEV) console.error(parsed.error);
          return;
        }

        const knownAction = ALL_ACTIONS.find((a) => a.id === parsed.data.actionId);
        if (!knownAction) return;

        const today = format(new Date(), 'yyyy-MM-dd');
        const month = format(new Date(), 'yyyy-MM');

        set((state) => {
          const entry: LoggedAction = {
            actionId: parsed.data.actionId,
            date: today,
            co2SavedKg: parsed.data.co2SavedKg,
          };

          const updatedMonthly = state.monthlyHistory.map((m) =>
            m.month === month
              ? {
                  ...m,
                  actionsCompleted: m.actionsCompleted + 1,
                  co2SavedKg: m.co2SavedKg + parsed.data.co2SavedKg,
                }
              : m
          );

          if (!updatedMonthly.find((m) => m.month === month)) {
            updatedMonthly.push({
              month,
              footprintKg: state.footprint?.total ?? 0,
              actionsCompleted: 1,
              co2SavedKg: parsed.data.co2SavedKg,
            });
          }

          return {
            loggedActions: [...state.loggedActions, entry],
            monthlyHistory: updatedMonthly,
          };
        });

        get().checkAndAwardBadges();
      },

      logActivity: (activity) => {
        const parsed = ActivityLogInputSchema.safeParse(activity);
        if (!parsed.success) {
          if (import.meta.env.DEV) console.error(parsed.error);
          return;
        }

        const today = format(new Date(), 'yyyy-MM-dd');

        set((state) => {
          const log: ActivityLog = {
            ...parsed.data,
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          };

          const { streak } = state;
          const newStreak = { ...streak };
          if (streak.lastLogDate !== today) {
            const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
            if (streak.lastLogDate === yesterday) {
              newStreak.currentDays += 1;
            } else {
              newStreak.currentDays = 1;
            }
            newStreak.longestDays = Math.max(newStreak.currentDays, newStreak.longestDays);
            newStreak.lastLogDate = today;
          }

          const badges = state.badges.map((b) => {
            if (b.id === 'first-log' && !b.earned) {
              return { ...b, earned: true, earnedDate: new Date().toISOString() };
            }
            return b;
          });

          return {
            activityLogs: [log, ...state.activityLogs],
            streak: newStreak,
            badges,
          };
        });

        get().checkAndAwardBadges();
      },

      addInsight: (insight) =>
        set((state) => ({
          insights: [insight, ...state.insights].slice(0, 10),
        })),

      setWeeklyReport: (report) => set({ weeklyReport: report }),

      checkAndAwardBadges: () => {
        set((state) => {
          const { loggedActions, activityLogs, streak, badges } = state;
          const totalSaved = loggedActions.reduce((sum, a) => sum + a.co2SavedKg, 0);
          const plantMeals = activityLogs.filter(
            (a) => a.type === 'meal' && a.label.toLowerCase().includes('plant')
          ).length;
          const bikeCommutes = activityLogs.filter(
            (a) => a.type === 'commute' && a.label.toLowerCase().includes('bike')
          ).length;

          const updated = badges.map((b) => {
            if (b.earned) return b;
            const now = new Date().toISOString();
            if (b.id === '7-day-streak' && streak.currentDays >= 7) return { ...b, earned: true, earnedDate: now };
            if (b.id === '30-day-streak' && streak.currentDays >= 30) return { ...b, earned: true, earnedDate: now };
            if (b.id === 'plant-meal' && plantMeals >= 10) return { ...b, earned: true, earnedDate: now };
            if (b.id === 'bike-commuter' && bikeCommutes >= 5) return { ...b, earned: true, earnedDate: now };
            if (b.id === 'ton-saved' && totalSaved >= 1000) return { ...b, earned: true, earnedDate: now };
            if (b.id === 'green-energy' && loggedActions.find((a) => a.actionId === 'green-energy')) {
              return { ...b, earned: true, earnedDate: now };
            }
            return b;
          });

          return { badges: updated };
        });
      },

      getTotalSaved: () => {
        return get().loggedActions.reduce((sum, a) => sum + a.co2SavedKg, 0);
      },

      resetAll: () =>
        set({
          hasCompletedOnboarding: false,
          assessment: null,
          footprint: null,
          loggedActions: [],
          activityLogs: [],
          badges: INITIAL_BADGES,
          streak: { currentDays: 0, longestDays: 0, lastLogDate: null },
          monthlyHistory: [],
          currentView: 'onboarding',
          insights: [],
          weeklyReport: null,
        }),
    }),
    {
      name: 'carbon-tracker-v1',
    }
  )
);
