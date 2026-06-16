import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ShoppingData } from '@/types';
import ShoppingStep from '@/components/onboarding/ShoppingStep';

// ── ShoppingStep ────────────────────────────────────────────

const DEFAULT_SHOPPING: ShoppingData = {
  newClothingItemsPerMonth: 3,
  electronicsPerYear: 1,
  onlineOrdersPerWeek: 2,
  buySecondhand: false,
};

describe('ShoppingStep', () => {
  const onNext = vi.fn();
  const onBack = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_SHOPPING) =>
    render(<ShoppingStep data={data} onChange={onChange} onNext={onNext} onBack={onBack} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /what do you buy/i })).toBeInTheDocument();
  });

  it('calls onChange when clothing slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/new clothing items per month/i), {
      target: { value: '5' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, newClothingItemsPerMonth: 5 });
  });

  it('calls onChange when electronics + button clicked', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/increase electronics per year/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, electronicsPerYear: 2 });
  });

  it('calls onChange when electronics − button clicked', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/decrease electronics per year/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, electronicsPerYear: 0 });
  });

  it('electronics do not go below 0', () => {
    render_({ ...DEFAULT_SHOPPING, electronicsPerYear: 0 });
    fireEvent.click(screen.getByLabelText(/decrease electronics per year/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, electronicsPerYear: 0 });
  });

  it('calls onChange when online orders slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/online orders per week/i), {
      target: { value: '7' },
    });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, onlineOrdersPerWeek: 7 });
  });

  it('calls onChange when secondhand toggle clicked (off → on)', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /i regularly buy secondhand/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, buySecondhand: true });
  });

  it('calls onChange when secondhand toggle clicked (on → off)', () => {
    render_({ ...DEFAULT_SHOPPING, buySecondhand: true });
    fireEvent.click(screen.getByRole('button', { name: /i regularly buy secondhand/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SHOPPING, buySecondhand: false });
  });

  it('secondhand toggle has correct aria-pressed when on', () => {
    render_({ ...DEFAULT_SHOPPING, buySecondhand: true });
    expect(screen.getByRole('button', { name: /i regularly buy secondhand/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('secondhand toggle has correct aria-pressed when off', () => {
    render_();
    expect(screen.getByRole('button', { name: /i regularly buy secondhand/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows singular device label when electronics=1', () => {
    render_();
    expect(screen.getByText('device')).toBeInTheDocument();
  });

  it('shows plural devices label when electronics=2', () => {
    render_({ ...DEFAULT_SHOPPING, electronicsPerYear: 2 });
    expect(screen.getByText('devices')).toBeInTheDocument();
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /see my results/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /go back to diet/i }));
    expect(onBack).toHaveBeenCalled();
  });
});

