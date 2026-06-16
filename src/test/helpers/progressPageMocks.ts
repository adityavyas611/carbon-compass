import { vi } from 'vitest';
import { LARGE_FOOTPRINT } from '@/test/fixtures';

export const mockSetWeeklyReport = vi.fn();
export const mockLogActivity = vi.fn();

export const BASE_BADGES = [
  { id: 'first-log', earned: true, earnedDate: '2024-01-15T10:00:00.000Z', title: 'First Step', description: 'Logged your first activity', icon: '🌱', category: 'general' },
  { id: 'assessment-done', earned: false, earnedDate: undefined, title: 'Know Thyself', description: 'Completed the carbon assessment', icon: '📊', category: 'general' },
];

export const progressPageMockState = {
  footprint: LARGE_FOOTPRINT as typeof LARGE_FOOTPRINT | null,
  loggedActions: [] as { actionId: string; date: string; co2SavedKg: number }[],
  badges: BASE_BADGES,
  streak: { currentDays: 5, longestDays: 10, lastLogDate: null as string | null },
  monthlyHistory: [] as { month: string; footprintKg: number; actionsCompleted: number; co2SavedKg: number }[],
  activityLogs: [] as { id: string; date: string; type: string; label: string; co2Kg: number }[],
  weeklyReport: null as string | null,
  logActivity: mockLogActivity,
  setWeeklyReport: mockSetWeeklyReport,
};

vi.mock('@/services/aiService', () => ({
  generateWeeklyReport: vi.fn().mockResolvedValue('Great week! You saved 150 kg.'),
  canMakeAiRequest: vi.fn(() => true),
}));

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => progressPageMockState),
}));

export function resetProgressPageMocks() {
  progressPageMockState.footprint = LARGE_FOOTPRINT;
  progressPageMockState.loggedActions = [];
  progressPageMockState.badges = BASE_BADGES.map((b) => ({ ...b }));
  progressPageMockState.streak = { currentDays: 5, longestDays: 10, lastLogDate: null };
  progressPageMockState.monthlyHistory = [];
  progressPageMockState.activityLogs = [];
  progressPageMockState.weeklyReport = null;
  vi.clearAllMocks();
}
