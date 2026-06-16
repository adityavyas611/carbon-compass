import { vi } from 'vitest';

export const appMockState = {
  hasCompletedOnboarding: false,
  currentView: 'dashboard' as string,
  setView: vi.fn(),
};

vi.mock('@/components/onboarding/AssessmentFlow', () => ({
  default: () => <div data-testid="assessment-flow">AssessmentFlow</div>,
}));
vi.mock('@/components/dashboard/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>,
}));
vi.mock('@/components/actions/ActionHub', () => ({
  default: () => <div data-testid="action-hub">ActionHub</div>,
}));
vi.mock('@/components/tracker/HabitTracker', () => ({
  default: () => <div data-testid="habit-tracker">HabitTracker</div>,
}));
vi.mock('@/components/progress/ProgressPage', () => ({
  default: () => <div data-testid="progress-page">ProgressPage</div>,
}));

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => appMockState),
}));

export const getApp = () => import('@/App').then((m) => m.default);

export function resetAppMocks() {
  appMockState.hasCompletedOnboarding = false;
  appMockState.currentView = 'dashboard';
  localStorage.clear();
  vi.clearAllMocks();
}
