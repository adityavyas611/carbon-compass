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
import { awardEligibleBadges, earnBadge } from '@/services/badgeService';
import { computeStreakUpdate } from '@/services/streakService';
import { recordLoggedActionMonth, upsertAssessmentMonth } from '@/services/monthlyHistoryService';
import { format } from 'date-fns';

const INITIAL_BADGES: Badge[] = [
  { id: 'first-log', title: 'First Step', description: 'Logged your first activity', icon: '🌱', earned: false, category: 'general' },
  { id: 'assessment-done', title: 'Know Thyself', description: 'Completed the carbon assessment', icon: '📊', earned: false, category: 'general' },
  { id: '7-day-streak', title: 'Week Warrior', description: '7-day logging streak', icon: '🔥', earned: false, category: 'general' },
  { id: '30-day-streak', title: 'Month Master', description: '30-day logging streak', icon: '⚡', earned: false, category: 'general' },
  { id: 'plant-meal', title: 'Plant Pioneer', description: 'Logged 10 plant-based meals', icon: '🥗', earned: false, category: 'diet' },
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

        set((state) => ({
          hasCompletedOnboarding: true,
          assessment: parsed.data,
          footprint,
          currentView: 'dashboard',
          monthlyHistory: upsertAssessmentMonth(state.monthlyHistory, today, footprint.total),
          badges: earnBadge(state.badges, 'assessment-done'),
        }));
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

          return {
            loggedActions: [...state.loggedActions, entry],
            monthlyHistory: recordLoggedActionMonth(
              state.monthlyHistory,
              month,
              state.footprint?.total ?? 0,
              parsed.data.co2SavedKg
            ),
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

          return {
            activityLogs: [log, ...state.activityLogs],
            streak: computeStreakUpdate(state.streak, today),
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
        set((state) => ({
          badges: awardEligibleBadges(
            state.badges,
            state.loggedActions,
            state.activityLogs,
            state.streak
          ),
        }));
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
