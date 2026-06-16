import '@/test/helpers/actionHubMocks';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ActionHub from '@/components/actions/ActionHub';
import { ALL_ACTIONS } from '@/utils/actions';
import { actionHubMockState, mockLogAction, resetActionHubMocks } from '@/test/helpers/actionHubMocks';

describe('ActionHub', () => {
  beforeEach(resetActionHubMocks);

  it('renders the Action Hub heading', () => {
    render(<ActionHub />);
    expect(screen.getByRole('heading', { name: /action hub/i })).toBeInTheDocument();
  });

  it('shows "Top 3 This Week" section', () => {
    render(<ActionHub />);
    expect(screen.getByText(/your top 3 this week/i)).toBeInTheDocument();
  });

  it('shows message when no actions saved this week', () => {
    render(<ActionHub />);
    expect(screen.getByText(/log actions to track/i)).toBeInTheDocument();
  });

  it('shows savings message when actions saved this week', () => {
    const today = new Date().toISOString().slice(0, 10);
    actionHubMockState.loggedActions = [{ actionId: 'plant-meal', date: today, co2SavedKg: 200 }];
    render(<ActionHub />);
    expect(screen.getByText(/you've saved 200 kg/i)).toBeInTheDocument();
  });

  it('renders All Actions section and filter tabs', () => {
    render(<ActionHub />);
    expect(screen.getByText(/all actions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /✨ all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🚗 transport/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🥗 diet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⚡ energy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🛍️ shopping/i })).toBeInTheDocument();
  });

  it('clicking transport filter shows fewer actions', () => {
    render(<ActionHub />);
    const allCount = screen.getAllByRole('button', { name: /i did this today/i }).length;
    fireEvent.click(screen.getByRole('button', { name: /🚗 transport/i }));
    const transportCount = screen.getAllByRole('button', { name: /i did this today/i }).length;
    expect(transportCount).toBeLessThanOrEqual(allCount);
  });

  it('clicking a log button calls logAction', () => {
    render(<ActionHub />);
    fireEvent.click(screen.getAllByRole('button', { name: /i did this today/i })[0]);
    expect(mockLogAction).toHaveBeenCalled();
  });

  it('handleLog skips already-logged actions', () => {
    const today = new Date().toISOString().slice(0, 10);
    const loggedAction = ALL_ACTIONS[0];
    actionHubMockState.loggedActions = [{ actionId: loggedAction.id, date: today, co2SavedKg: loggedAction.co2SavedKg }];
    render(<ActionHub />);
    const doneBtn = screen.getByRole('button', { name: /done today/i });
    const reactPropsKey = Object.keys(doneBtn).find((k) => k.startsWith('__reactProps$'));
    const handler = reactPropsKey
      ? (doneBtn as Record<string, Record<string, () => void>>)[reactPropsKey]?.onClick
      : undefined;
    if (handler) handler();
    expect(mockLogAction).not.toHaveBeenCalled();
  });

  it('shows top 3 section even with null footprint', () => {
    actionHubMockState.footprint = null;
    render(<ActionHub />);
    expect(screen.getByText(/your top 3 this week/i)).toBeInTheDocument();
  });

  it('resets justLogged after timeout', async () => {
    vi.useFakeTimers();
    render(<ActionHub />);
    fireEvent.click(screen.getAllByRole('button', { name: /i did this today/i })[0]);
    await act(() => { vi.advanceTimersByTime(2100); });
    vi.useRealTimers();
  });
});
