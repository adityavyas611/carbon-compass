import '@/test/helpers/habitTrackerMocks';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HabitTracker from '@/components/tracker/HabitTracker';
import { habitTrackerMockState, resetHabitTrackerMocks } from '@/test/helpers/habitTrackerMocks';

describe('HabitTracker history', () => {
  beforeEach(resetHabitTrackerMocks);

  it('shows Recent History section for activities from yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    habitTrackerMockState.activityLogs = [
      { id: 'old-1', date: yesterdayStr, type: 'meal', label: 'Beef burger', co2Kg: 3.6 },
    ];
    render(<HabitTracker />);
    expect(screen.getByText('Recent History')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('Beef burger')).toBeInTheDocument();
  });

  it('shows Recent History with formatted date for entries older than yesterday', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10);
    habitTrackerMockState.activityLogs = [
      { id: 'old-2', date: twoDaysAgoStr, type: 'commute', label: 'Drove alone (car)', co2Kg: 4.2 },
    ];
    render(<HabitTracker />);
    expect(screen.getByText('Recent History')).toBeInTheDocument();
    expect(screen.queryByText('Yesterday')).not.toBeInTheDocument();
    expect(screen.getByText('Drove alone (car)')).toBeInTheDocument();
  });

  it('sorts recent history dates descending', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    habitTrackerMockState.activityLogs = [
      { id: 'old-1', date: yesterday.toISOString().slice(0, 10), type: 'meal', label: 'Plant-based meal', co2Kg: -2 },
      { id: 'old-2', date: twoDaysAgo.toISOString().slice(0, 10), type: 'commute', label: 'Bike commute', co2Kg: -3 },
    ];
    render(<HabitTracker />);
    expect(screen.getByText('Recent History')).toBeInTheDocument();
    expect(screen.getByText('Plant-based meal')).toBeInTheDocument();
    expect(screen.getByText('Bike commute')).toBeInTheDocument();
  });
});
