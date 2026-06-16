import '@/test/helpers/habitTrackerMocks';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HabitTracker from '@/components/tracker/HabitTracker';
import { mockLogActivity, resetHabitTrackerMocks } from '@/test/helpers/habitTrackerMocks';

describe('HabitTracker modal — interactions', () => {
  beforeEach(resetHabitTrackerMocks);

  it('opens the modal when Log Activity button clicked', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('modal has close button', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    expect(screen.getByRole('button', { name: /close activity log/i, hidden: true })).toBeInTheDocument();
  });

  it('closes modal when close button clicked', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.click(screen.getByRole('button', { name: /close activity log/i, hidden: true }));
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('closes modal when Escape pressed', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('modal renders all four activity types', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    expect(screen.getByText('Meal')).toBeInTheDocument();
    expect(screen.getByText('Commute')).toBeInTheDocument();
    expect(screen.getByText('Purchase')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
  });

  it('switching type tab changes presets', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.click(screen.getAllByText('Commute')[0]);
    expect(screen.getByText(/drove alone/i)).toBeInTheDocument();
  });

  it('selecting a preset enables the Log It button', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.click(screen.getByText(/plant-based meal/i));
    expect(screen.getByRole('button', { name: /Add Activity/i, hidden: true })).not.toBeDisabled();
  });

  it('clicking Log It calls logActivity with correct data', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.click(screen.getByText(/plant-based meal/i));
    fireEvent.click(screen.getByRole('button', { name: /Add Activity/i, hidden: true }));
    expect(mockLogActivity).toHaveBeenCalledWith(expect.objectContaining({ label: 'Plant-based meal', type: 'meal' }));
  });

  it('shows CO2 value next to presets', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    expect(screen.getByText(/3\.6 kg/)).toBeInTheDocument();
  });

  it('Log It button disabled when no preset selected', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    expect(screen.getByRole('button', { name: /Add Activity/i, hidden: true })).toBeDisabled();
  });

  it('switches to purchase tab and shows correct presets', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.click(screen.getAllByText('Purchase')[0]);
    expect(screen.getByText(/new clothing item/i)).toBeInTheDocument();
  });

  it('switches to energy tab and shows correct presets', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.click(screen.getAllByText('Energy')[0]);
    expect(screen.getByText(/thermostat/i)).toBeInTheDocument();
  });

  it('types in the optional note field inside the modal', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    const noteInput = screen.getByPlaceholderText(/optional note/i);
    fireEvent.change(noteInput, { target: { value: 'My note' } });
    expect(noteInput).toHaveValue('My note');
  });

  it('"Log your first activity" secondary button opens the modal', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log your first activity/i }));
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('clicking backdrop closes the modal', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) fireEvent.click(backdrop, { target: backdrop });
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('handleAdd returns early when selectedPreset is null', async () => {
    const { act } = await import('@testing-library/react');
    render(<HabitTracker />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    });
    const addBtn = screen.getByRole('button', { name: /Add Activity/i, hidden: true });
    const reactPropsKey = Object.keys(addBtn).find((k) => k.startsWith('__reactProps$'));
    const handler = reactPropsKey ? (addBtn as Record<string, Record<string, () => void>>)[reactPropsKey]?.onClick : undefined;
    if (handler) await act(async () => { handler(); });
    expect(mockLogActivity).not.toHaveBeenCalled();
  });

  it('logging a positive co2Kg preset calls logActivity', () => {
    render(<HabitTracker />);
    fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    fireEvent.click(screen.getByText(/beef meal/i));
    fireEvent.click(screen.getByRole('button', { name: /Add Activity/i, hidden: true }));
    expect(mockLogActivity).toHaveBeenCalledWith(expect.objectContaining({ label: 'Beef meal', co2Kg: 3.6 }));
  });
});
