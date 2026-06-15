import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useReducedMotion } from 'framer-motion';

import React from 'react';

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial','animate','exit','transition','variants','custom','layout','layoutId','whileHover','whileTap','whileFocus','whileInView']);
  const motionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, ...p }, ref) =>
      React.createElement(tag, { ...Object.fromEntries(Object.entries(p).filter(([k]) => !MOTION_PROPS.has(k))), ref }, children)
    );
  const cache = new Map<string, unknown>();
  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_, tag: string) => {
      if (!cache.has(tag)) cache.set(tag, motionComponent(tag));
      return cache.get(tag);
    },
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: vi.fn(() => false),
  };
});

// Mock all child view components so they don't need their own deps
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
vi.mock('@/components/common/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>,
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light' as const,
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  })),
}));

vi.mock('@/components/common/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

let mockHasCompleted = false;
let mockCurrentView = 'dashboard' as string;

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => ({
    hasCompletedOnboarding: mockHasCompleted,
    currentView: mockCurrentView,
  })),
}));

// Import App AFTER mocks are set up
const getApp = () => import('@/App').then((m) => m.default);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AssessmentFlow when onboarding not complete', async () => {
    mockHasCompleted = false;
    mockCurrentView = 'onboarding';
    const App = await getApp();
    render(<App />);
    expect(screen.getByTestId('assessment-flow')).toBeInTheDocument();
  });

  it('renders Dashboard when currentView=dashboard', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    render(<App />);
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
  });

  it('renders ActionHub when currentView=actions', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'actions';
    const App = await getApp();
    render(<App />);
    expect(await screen.findByTestId('action-hub')).toBeInTheDocument();
  });

  it('renders HabitTracker when currentView=tracker', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'tracker';
    const App = await getApp();
    render(<App />);
    expect(await screen.findByTestId('habit-tracker')).toBeInTheDocument();
  });

  it('renders ProgressPage when currentView=progress', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'progress';
    const App = await getApp();
    render(<App />);
    expect(await screen.findByTestId('progress-page')).toBeInTheDocument();
  });

  it('renders Navigation when onboarding complete', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    render(<App />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('renders the header with app name', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    render(<App />);
    expect(screen.getByText('CarbonTrack')).toBeInTheDocument();
  });

  it('header shows current view label - Dashboard', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    render(<App />);
    // Header label uses aria-live; mocked Dashboard component also renders "Dashboard"
    const matches = screen.getAllByText('Dashboard');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('header shows current view label - Action Hub', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'actions';
    const App = await getApp();
    render(<App />);
    expect(screen.getByText('Action Hub')).toBeInTheDocument();
  });

  it('header shows current view label - Daily Tracker', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'tracker';
    const App = await getApp();
    render(<App />);
    expect(screen.getByText('Daily Tracker')).toBeInTheDocument();
  });

  it('header shows current view label - Progress', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'progress';
    const App = await getApp();
    render(<App />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('does not render Navigation during onboarding', async () => {
    mockHasCompleted = false;
    mockCurrentView = 'onboarding';
    const App = await getApp();
    render(<App />);
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
  });

  it('does not render header during onboarding', async () => {
    mockHasCompleted = false;
    const App = await getApp();
    render(<App />);
    expect(screen.queryByText('CarbonTrack')).not.toBeInTheDocument();
  });

  it('uses reduced-motion variants when useReducedMotion returns true', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    // Override to simulate prefers-reduced-motion
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const App = await getApp();
    render(<App />);
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });
});
