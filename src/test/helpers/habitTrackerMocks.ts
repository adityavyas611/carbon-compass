import { vi } from 'vitest';
import { LARGE_FOOTPRINT } from '@/test/fixtures';

export const mockLogActivity = vi.fn();

export const habitTrackerMockState = {
  footprint: LARGE_FOOTPRINT as typeof LARGE_FOOTPRINT | null,
  loggedActions: [] as { actionId: string; date: string; co2SavedKg: number }[],
  badges: [] as { id: string; earned: boolean; title: string; description: string; icon: string; category: string }[],
  streak: { currentDays: 3, longestDays: 5, lastLogDate: null as string | null },
  monthlyHistory: [] as { month: string; footprintKg: number; actionsCompleted: number; co2SavedKg: number }[],
  activityLogs: [] as { id: string; date: string; type: string; label: string; co2Kg: number; note?: string }[],
  weeklyReport: null as string | null,
  logActivity: mockLogActivity,
  setWeeklyReport: vi.fn(),
};

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => habitTrackerMockState),
}));

export function resetHabitTrackerMocks() {
  habitTrackerMockState.activityLogs = [];
  habitTrackerMockState.streak = { currentDays: 3, longestDays: 5, lastLogDate: null };
  vi.clearAllMocks();
}
