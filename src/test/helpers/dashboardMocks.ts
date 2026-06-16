import { vi } from 'vitest';
import { LARGE_FOOTPRINT } from '@/test/fixtures';

export const mockSetView = vi.fn();

export const dashboardMockState = {
  footprint: LARGE_FOOTPRINT as typeof LARGE_FOOTPRINT | null,
  loggedActions: [] as { actionId: string; date: string; co2SavedKg: number }[],
  streak: { currentDays: 3, longestDays: 7, lastLogDate: null as string | null },
  badges: [
    { id: 'first-log', earned: true, earnedDate: new Date().toISOString(), title: 'First Step', description: 'desc', icon: '🌱', category: 'general' },
    { id: 'assessment-done', earned: false, earnedDate: undefined, title: 'Know Thyself', description: 'desc', icon: '📊', category: 'general' },
  ],
  monthlyHistory: [] as { month: string; footprintKg: number; actionsCompleted: number; co2SavedKg: number }[],
  insights: [] as string[],
  setView: mockSetView,
};

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => dashboardMockState),
}));

export function resetDashboardMocks() {
  dashboardMockState.footprint = LARGE_FOOTPRINT;
  dashboardMockState.loggedActions = [];
  dashboardMockState.streak = { currentDays: 3, longestDays: 7, lastLogDate: null };
  dashboardMockState.badges = [
    { id: 'first-log', earned: true, earnedDate: new Date().toISOString(), title: 'First Step', description: 'desc', icon: '🌱', category: 'general' },
    { id: 'assessment-done', earned: false, earnedDate: undefined, title: 'Know Thyself', description: 'desc', icon: '📊', category: 'general' },
  ];
  dashboardMockState.monthlyHistory = [];
  dashboardMockState.insights = [];
  vi.clearAllMocks();
}
