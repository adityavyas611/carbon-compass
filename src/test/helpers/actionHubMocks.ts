import { vi } from 'vitest';

export const mockLogAction = vi.fn();

export const actionHubMockState = {
  footprint: { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 } as
    | { transport: number; energy: number; diet: number; shopping: number; total: number }
    | null,
  loggedActions: [] as { actionId: string; date: string; co2SavedKg: number }[],
  logAction: mockLogAction,
};

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => actionHubMockState),
}));

export function resetActionHubMocks() {
  actionHubMockState.footprint = { transport: 3000, energy: 2000, diet: 1500, shopping: 500, total: 7000 };
  actionHubMockState.loggedActions = [];
  vi.clearAllMocks();
}
