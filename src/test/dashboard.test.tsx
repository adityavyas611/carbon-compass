import '@/test/helpers/dashboardMocks';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '@/components/dashboard/Dashboard';
import { dashboardMockState, mockSetView, resetDashboardMocks } from '@/test/helpers/dashboardMocks';

describe('Dashboard', () => {
  beforeEach(resetDashboardMocks);

  it('renders empty state when footprint is null', () => {
    dashboardMockState.footprint = null;
    render(<Dashboard />);
    expect(screen.getByText(/complete the carbon assessment/i)).toBeInTheDocument();
  });

  it('renders the dashboard heading', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /your dashboard/i })).toBeInTheDocument();
  });

  it('displays the formatted total footprint', () => {
    render(<Dashboard />);
    expect(screen.getByText('7.0t')).toBeInTheDocument();
  });

  it('shows the grade', () => {
    render(<Dashboard />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('shows streak days', () => {
    render(<Dashboard />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays total CO₂ saved from logged actions', () => {
    dashboardMockState.loggedActions = [
      { actionId: 'a1', date: '2024-01-01', co2SavedKg: 150 },
      { actionId: 'a2', date: '2024-01-02', co2SavedKg: 250 },
    ];
    render(<Dashboard />);
    expect(screen.getByText('0.4t')).toBeInTheDocument();
  });

  it('shows badge count', () => {
    render(<Dashboard />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows all four categories', () => {
    render(<Dashboard />);
    expect(screen.getAllByText('Transport').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Energy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Diet').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Shopping').length).toBeGreaterThanOrEqual(1);
  });

  it('does NOT render trend line with 0 or 1 monthly history entries', () => {
    render(<Dashboard />);
    expect(screen.queryByText(/monthly trend/i)).not.toBeInTheDocument();
  });

  it('renders trend line when monthlyHistory has more than 1 entry', () => {
    dashboardMockState.monthlyHistory = [
      { month: '2024-01', footprintKg: 7000, actionsCompleted: 0, co2SavedKg: 0 },
      { month: '2024-02', footprintKg: 6800, actionsCompleted: 1, co2SavedKg: 100 },
    ];
    render(<Dashboard />);
    expect(screen.getByText(/monthly trend/i)).toBeInTheDocument();
  });

  it('does NOT show AI insight when insights array is empty', () => {
    render(<Dashboard />);
    expect(screen.queryByText(/ai insight/i)).not.toBeInTheDocument();
  });

  it('shows AI insight card when insights are present', () => {
    dashboardMockState.insights = ['Plant 2 more meals this week.'];
    render(<Dashboard />);
    expect(screen.getByText(/ai insight/i)).toBeInTheDocument();
  });

  it('View My Action Plan button calls setView with actions', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /view my action plan/i }));
    expect(mockSetView).toHaveBeenCalledWith('actions');
  });
});
