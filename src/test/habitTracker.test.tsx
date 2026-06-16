import '@/test/helpers/habitTrackerMocks';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HabitTracker from '@/components/tracker/HabitTracker';
import { habitTrackerMockState, resetHabitTrackerMocks } from '@/test/helpers/habitTrackerMocks';

describe('HabitTracker', () => {
  beforeEach(resetHabitTrackerMocks);

  it('renders the heading', () => {
    render(<HabitTracker />);
    expect(screen.getByRole('heading', { name: /daily tracker/i })).toBeInTheDocument();
  });

  it('shows current streak', () => {
    render(<HabitTracker />);
    expect(screen.getByText(/3 day streak/i)).toBeInTheDocument();
  });

  it('renders Log Activity button', () => {
    render(<HabitTracker />);
    expect(screen.getByRole('button', { name: /log a new activity/i })).toBeInTheDocument();
  });

  it('shows week calendar grid with day initial letters', () => {
    render(<HabitTracker />);
    expect(screen.getAllByText('M').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state text when no activities today', () => {
    render(<HabitTracker />);
    expect(screen.getByText(/nothing logged yet today/i)).toBeInTheDocument();
  });

  it('renders existing activity logs', () => {
    const today = new Date().toISOString().slice(0, 10);
    habitTrackerMockState.activityLogs = [
      { id: 'log-1', date: today, type: 'meal', label: 'Vegan meal', co2Kg: 0.3 },
    ];
    render(<HabitTracker />);
    expect(screen.getByText('Vegan meal')).toBeInTheDocument();
  });

  it('groups multiple activity logs on the same date', () => {
    const today = new Date().toISOString().slice(0, 10);
    habitTrackerMockState.activityLogs = [
      { id: 'log-a', date: today, type: 'meal', label: 'Lunch', co2Kg: 0.5 },
      { id: 'log-b', date: today, type: 'commute', label: 'Walked home', co2Kg: 0 },
    ];
    render(<HabitTracker />);
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Walked home')).toBeInTheDocument();
  });

  it('shows "Today" heading section', () => {
    render(<HabitTracker />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders a negative co2Kg log entry with saved styling', () => {
    const today = new Date().toISOString().slice(0, 10);
    habitTrackerMockState.activityLogs = [
      { id: 'log-saved', date: today, type: 'meal', label: 'Plant-based meal', co2Kg: -0.5 },
    ];
    render(<HabitTracker />);
    expect(screen.getByLabelText(/saved 0\.5 kg co₂/i)).toBeInTheDocument();
  });

  it('renders a log entry with an optional note', () => {
    const today = new Date().toISOString().slice(0, 10);
    habitTrackerMockState.activityLogs = [
      { id: 'log-noted', date: today, type: 'meal', label: 'Salad', co2Kg: 0.2, note: 'From the garden' },
    ];
    render(<HabitTracker />);
    expect(screen.getByText('From the garden')).toBeInTheDocument();
  });

  it('week calendar renders when tests run mid-week', () => {
    vi.setSystemTime(new Date('2026-06-17T12:00:00.000Z'));
    render(<HabitTracker />);
    expect(screen.getByRole('list', { name: /this week/i })).toBeInTheDocument();
    vi.useRealTimers();
  });
});

afterEach(() => {
  vi.useRealTimers();
});
