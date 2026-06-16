import '@/test/helpers/appMocks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { useReducedMotion } from 'framer-motion';
import { renderWithTheme } from '@/test/test-utils';
import { appMockState, getApp, resetAppMocks } from '@/test/helpers/appMocks';

describe('App — chrome and accessibility', () => {
  beforeEach(resetAppMocks);

  it('renders main navigation when onboarding complete', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders the header with app name', async () => {
    appMockState.hasCompletedOnboarding = true;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText('CarbonTrack')).toBeInTheDocument();
  });

  it('header shows current view label - Dashboard', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
  });

  it('header shows current view label - Action Hub', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'actions';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText('Action Hub')).toBeInTheDocument();
  });

  it('header shows current view label - Daily Tracker', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'tracker';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText('Daily Tracker')).toBeInTheDocument();
  });

  it('header shows current view label - Progress', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'progress';
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getAllByText('Progress').length).toBeGreaterThanOrEqual(1);
  });

  it('renders skip link to main content when onboarding complete', async () => {
    appMockState.hasCompletedOnboarding = true;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main-content');
  });

  it('renders footer when onboarding complete', async () => {
    appMockState.hasCompletedOnboarding = true;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByText(/measure, understand, reduce/i)).toBeInTheDocument();
  });

  it('renders theme toggle in header', async () => {
    appMockState.hasCompletedOnboarding = true;
    const App = await getApp();
    renderWithTheme(<App />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('navigation setView is called when nav item clicked', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'dashboard';
    const App = await getApp();
    renderWithTheme(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^actions$/i }));
    expect(appMockState.setView).toHaveBeenCalledWith('actions');
  });

  it('uses reduced-motion variants when useReducedMotion returns true', async () => {
    appMockState.hasCompletedOnboarding = true;
    appMockState.currentView = 'dashboard';
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const App = await getApp();
    renderWithTheme(<App />);
    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });
});
