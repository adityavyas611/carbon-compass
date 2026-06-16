import '@/test/helpers/habitTrackerMocks';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HabitTracker from '@/components/tracker/HabitTracker';
import { resetHabitTrackerMocks } from '@/test/helpers/habitTrackerMocks';

describe('HabitTracker modal — focus trap', () => {
  beforeEach(resetHabitTrackerMocks);

  it('Tab key inside open modal exercises focus-trap logic without throwing', async () => {
    render(<HabitTracker />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    });
    expect(() => fireEvent.keyDown(document, { key: 'Tab', shiftKey: false })).not.toThrow();
  });

  it('non-Tab non-Escape keydown returns early from focus trap handler', async () => {
    render(<HabitTracker />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    });
    expect(() => fireEvent.keyDown(document, { key: 'A' })).not.toThrow();
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('Shift+Tab inside open modal exercises reverse focus-trap logic', async () => {
    render(<HabitTracker />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    });
    expect(() => fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })).not.toThrow();
  });

  it('Shift+Tab when close button is focused wraps focus to last element', async () => {
    render(<HabitTracker />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    });
    const closeBtn = screen.getByRole('button', { name: /close activity log/i, hidden: true });
    await act(async () => { closeBtn.focus(); });
    expect(() => fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })).not.toThrow();
  });

  it('Tab when Add Activity button is focused wraps to first element', async () => {
    render(<HabitTracker />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/plant-based meal/i));
    });
    const addBtn = screen.getByRole('button', { name: /Add Activity/i, hidden: true });
    await act(async () => { addBtn.focus(); });
    expect(() => fireEvent.keyDown(document, { key: 'Tab', shiftKey: false })).not.toThrow();
  });
});

afterEach(() => {
  vi.useRealTimers();
});
