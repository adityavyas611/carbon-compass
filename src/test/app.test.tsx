import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { useReducedMotion } from 'framer-motion';
import { renderWithTheme } from '@/test/test-utils';

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

let mockHasCompleted = false;
let mockCurrentView = 'dashboard' as string;
const mockSetView = vi.fn();

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => ({
    hasCompletedOnboarding: mockHasCompleted,
    currentView: mockCurrentView,
    setView: mockSetView,
  })),
}));

const getApp = () => import('@/App').then((m) => m.default);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasCompleted = false;
    mockCurrentView = 'dashboard';
    localStorage.clear();
  });

  it('renders AssessmentFlow when onboarding not complete', async () => {
    mockHasCompleted = false;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByTestId('assessment-flow')).toBeInTheDocument();
  });

  it('renders Dashboard when currentView=dashboard', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
  });

  it('renders ActionHub when currentView=actions', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'actions';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('action-hub')).toBeInTheDocument();
  });

  it('renders HabitTracker when currentView=tracker', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'tracker';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('habit-tracker')).toBeInTheDocument();
  });

  it('renders ProgressPage when currentView=progress', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'progress';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('progress-page')).toBeInTheDocument();
  });

  it('renders main navigation when onboarding complete', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders the header with app name', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText('CarbonTrack')).toBeInTheDocument();
  });

  it('header shows current view label - Dashboard', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    const matches = screen.getAllByText('Dashboard');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('header shows current view label - Action Hub', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'actions';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText('Action Hub')).toBeInTheDocument();
  });

  it('header shows current view label - Daily Tracker', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'tracker';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText('Daily Tracker')).toBeInTheDocument();
  });

  it('header shows current view label - Progress', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'progress';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getAllByText('Progress').length).toBeGreaterThanOrEqual(1);
  });

  it('does not render navigation during onboarding', async () => {
    mockHasCompleted = false;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.queryByRole('navigation', { name: /main navigation/i })).not.toBeInTheDocument();
  });

  it('does not render header during onboarding', async () => {
    mockHasCompleted = false;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.queryByText('CarbonTrack')).not.toBeInTheDocument();
  });

  it('renders skip link to main content when onboarding complete', async () => {
    mockHasCompleted = true;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main-content');
  });

  it('renders footer when onboarding complete', async () => {
    mockHasCompleted = true;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText(/measure, understand, reduce/i)).toBeInTheDocument();
  });

  it('renders theme toggle in header', async () => {
    mockHasCompleted = true;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('navigation setView is called when nav item clicked', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^actions$/i }));
    expect(mockSetView).toHaveBeenCalledWith('actions');
  });

  it('uses reduced-motion variants when useReducedMotion returns true', async () => {
    mockHasCompleted = true;
    mockCurrentView = 'dashboard';
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });
});
