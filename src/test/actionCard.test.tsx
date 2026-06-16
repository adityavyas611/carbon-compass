import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionCard from '@/components/actions/ActionCard';
import type { Action } from '@/types';

const SAMPLE_ACTION: Action = {
  id: 'plant-meal',
  title: 'Eat plant-based 3x/week',
  description: 'Reducing meat intake is one of the most impactful diet changes.',
  co2SavedKg: 180,
  difficulty: 'Easy',
  category: 'diet',
  icon: '🥗',
  tips: ['Start with Meatless Monday', 'Try lentil soups', 'Explore tofu stir-fry'],
};

const EV_ACTION: Action = {
  id: 'ev-switch',
  title: 'Switch to electric vehicle',
  description: 'EVs significantly reduce transport emissions.',
  co2SavedKg: 1500,
  difficulty: 'Habit Change',
  category: 'transport',
  icon: '⚡',
  tips: ['Check government incentives', 'Consider a hybrid first'],
};

describe('ActionCard', () => {
  const onLog = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  const defaultProps = {
    action: SAMPLE_ACTION,
    isLoggedToday: false,
    isEverLogged: false,
    justLogged: false,
    onLog,
  };

  it('renders the action title', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText('Eat plant-based 3x/week')).toBeInTheDocument();
  });

  it('renders the action description', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText(/reducing meat intake/i)).toBeInTheDocument();
  });

  it('shows rank badge when rank prop is provided', () => {
    render(<ActionCard {...defaultProps} rank={2} />);
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('shows emoji icon when no rank', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText('🥗')).toBeInTheDocument();
  });

  it('shows CO2 savings in kg for small values', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText(/save ~180 kg/i)).toBeInTheDocument();
  });

  it('shows CO2 savings in tonnes for values >= 1000 kg', () => {
    render(<ActionCard {...defaultProps} action={EV_ACTION} />);
    expect(screen.getByText(/save ~1\.5t/i)).toBeInTheDocument();
  });

  it('shows difficulty badges', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText('Easy')).toBeInTheDocument();
    render(<ActionCard {...defaultProps} action={EV_ACTION} />);
    expect(screen.getByText('Habit Change')).toBeInTheDocument();
  });

  it('shows "Done before" when isEverLogged=true', () => {
    render(<ActionCard {...defaultProps} isEverLogged />);
    expect(screen.getByText(/done before/i)).toBeInTheDocument();
  });

  it('does NOT show "Done before" when isEverLogged=false', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.queryByText(/done before/i)).not.toBeInTheDocument();
  });

  it('shows log button states', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.getByText(/i did this today/i)).toBeInTheDocument();
    render(<ActionCard {...defaultProps} isLoggedToday />);
    expect(screen.getByText(/done today/i)).toBeInTheDocument();
    render(<ActionCard {...defaultProps} justLogged />);
    expect(screen.getByText(/logged/i)).toBeInTheDocument();
  });

  it('log button is disabled when isLoggedToday=true', () => {
    render(<ActionCard {...defaultProps} isLoggedToday />);
    expect(screen.getByRole('button', { name: /done today/i })).toBeDisabled();
  });

  it('log button calls onLog when clicked', () => {
    render(<ActionCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /i did this today/i }));
    expect(onLog).toHaveBeenCalledWith(SAMPLE_ACTION);
  });

  it('expand button toggles tips section', () => {
    render(<ActionCard {...defaultProps} />);
    expect(screen.queryByText('How to get started:')).not.toBeInTheDocument();
    const expandBtn = screen.getAllByRole('button').find((b) => !b.disabled && b !== screen.queryByRole('button', { name: /i did this today/i }));
    if (!expandBtn) throw new Error('expected expand button');
    fireEvent.click(expandBtn);
    expect(screen.getByText('How to get started:')).toBeInTheDocument();
    expect(screen.getByText('Start with Meatless Monday')).toBeInTheDocument();
  });

  it('highlighted prop adds border class', () => {
    const { container } = render(<ActionCard {...defaultProps} highlighted />);
    expect(container.querySelector('.border-forest-200')).not.toBeNull();
  });

  it('Medium difficulty gets earth styling', () => {
    const mediumAction: Action = { ...SAMPLE_ACTION, difficulty: 'Medium' };
    const { container } = render(<ActionCard {...defaultProps} action={mediumAction} />);
    expect(container.querySelector('.bg-earth-100')).not.toBeNull();
  });
});
