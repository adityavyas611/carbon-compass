import { vi } from 'vitest';

export const mockSetView = vi.fn();
export const mockAddInsight = vi.fn();
export const mockResetAll = vi.fn();

export const mockCommonState = {
  currentView: 'dashboard' as const,
  footprint: null as null | { transport: number; energy: number; diet: number; shopping: number; total: number },
  loggedActions: [] as { actionId: string; date: string; co2SavedKg: number }[],
  streak: { currentDays: 3, longestDays: 5, lastLogDate: null },
  insights: [] as string[],
  setView: mockSetView,
  addInsight: mockAddInsight,
  resetAll: mockResetAll,
};

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => mockCommonState),
}));

vi.mock('@/services/aiService', () => ({
  generateInsight: vi.fn().mockRejectedValue(new Error('API error')),
  canMakeAiRequest: vi.fn().mockReturnValue(true),
}));

vi.mock('@/utils/actions', () => ({
  ALL_ACTIONS: [
    { id: 'a1', actionId: 'a1', category: 'transport', co2SavedKg: 100, title: 'Walk more', description: '', tips: [], difficulty: 'Easy', icon: '🚶' },
  ],
}));
