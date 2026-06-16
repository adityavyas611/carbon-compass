import '@/test/helpers/appMocks';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/test/test-utils';
import { appMockState, getApp, resetAppMocks } from '@/test/helpers/appMocks';

describe('App — view routing', () => {
  beforeEach(resetAppMocks);

  it('renders AssessmentFlow when onboarding not complete', async () => {
    appMockState.hasCompletedOnboarding = false;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByTestId('assessment-flow')).toBeInTheDocument();
  });

  it('renders Dashboard when currentView=dashboard', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
  });

  it('renders ActionHub when currentView=actions', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'actions';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('action-hub')).toBeInTheDocument();
  });

  it('renders HabitTracker when currentView=tracker', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'tracker';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('habit-tracker')).toBeInTheDocument();
  });

  it('renders ProgressPage when currentView=progress', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'progress';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('progress-page')).toBeInTheDocument();
  });

  it('does not render navigation during onboarding', async () => {
    appMockState.hasCompletedOnboarding = false;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.queryByRole('navigation', { name: /main navigation/i })).not.toBeInTheDocument();
  });

  it('does not render header during onboarding', async () => {
    appMockState.hasCompletedOnboarding = false;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.queryByText('CarbonTrack')).not.toBeInTheDocument();
  });
});
