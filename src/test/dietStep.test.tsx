import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { DietData } from '@/types';
import DietStep from '@/components/onboarding/DietStep';

// ── DietStep ────────────────────────────────────────────────

const DEFAULT_DIET: DietData = {
  dietType: 'omnivore',
  localFoodPercent: 30,
  foodWasteLevel: 'medium',
};

describe('DietStep', () => {
  const onNext = vi.fn();
  const onBack = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_DIET) =>
    render(<DietStep data={data} onChange={onChange} onNext={onNext} onBack={onBack} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /how do you eat/i })).toBeInTheDocument();
  });

  it('renders all diet types', () => {
    render_();
    const types = ['Vegan', 'Vegetarian', 'Pescatarian', 'Flexitarian', 'Omnivore', 'Meat-heavy'];
    for (const t of types) {
      expect(screen.getByRole('button', { name: new RegExp(t, 'i') })).toBeInTheDocument();
    }
  });

  it('renders all waste levels', () => {
    render_();
    expect(screen.getByRole('button', { name: /very little/i })).toBeInTheDocument();
    // accessible name includes the description text
    expect(screen.getByRole('button', { name: /average household waste/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quite a bit/i })).toBeInTheDocument();
  });

  it('calls onChange when diet type selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /vegan/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, dietType: 'vegan' });
  });

  it('calls onChange when local food slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/how much of your food is locally grown/i), {
      target: { value: '60' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, localFoodPercent: 60 });
  });

  it('calls onChange when waste level selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /very little/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, foodWasteLevel: 'low' });
  });

  it('calls onChange for high waste level', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /quite a bit/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_DIET, foodWasteLevel: 'high' });
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /next: shopping/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /go back to home energy/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('selected diet has aria-pressed=true', () => {
    render_();
    expect(screen.getByRole('button', { name: /omnivore/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('unselected diet has aria-pressed=false', () => {
    render_();
    expect(screen.getByRole('button', { name: /vegan/i })).toHaveAttribute('aria-pressed', 'false');
  });
});

