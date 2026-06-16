import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { EnergyData } from '@/types';
import EnergyStep from '@/components/onboarding/EnergyStep';

const DEFAULT_ENERGY: EnergyData = {
  electricitySource: 'grid',
  heatingType: 'gas',
  homeSizeSqft: 1200,
  numPeople: 2,
};

describe('EnergyStep', () => {
  const onNext = vi.fn();
  const onBack = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_ENERGY) =>
    render(<EnergyStep data={data} onChange={onChange} onNext={onNext} onBack={onBack} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /what powers your home/i })).toBeInTheDocument();
  });

  it('renders all electricity sources', () => {
    render_();
    expect(screen.getByRole('button', { name: /standard grid/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /part renewable/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /green tariff/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solar panels/i })).toBeInTheDocument();
  });

  it('renders all heating types', () => {
    render_();
    expect(screen.getByRole('button', { name: /natural gas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heating oil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /heat pump/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no heating/i })).toBeInTheDocument();
  });

  it('calls onChange when electricity source selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /solar panels/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, electricitySource: 'solar' });
  });

  it('calls onChange when heating type selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /heat pump/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, heatingType: 'heat-pump' });
  });

  it('calls onChange when home size slider changes', () => {
    render_();
    fireEvent.change(screen.getByLabelText(/home size/i), { target: { value: '2000' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, homeSizeSqft: 2000 });
  });

  it('calls onChange when people count decremented', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/decrease number of people/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, numPeople: 1 });
  });

  it('numPeople does not go below 1', () => {
    render_({ ...DEFAULT_ENERGY, numPeople: 1 });
    fireEvent.click(screen.getByLabelText(/decrease number of people/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, numPeople: 1 });
  });

  it('calls onChange when people count incremented', () => {
    render_();
    fireEvent.click(screen.getByLabelText(/increase number of people/i));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ENERGY, numPeople: 3 });
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /next: food/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /go back to transport/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('selected electricity source has aria-pressed=true', () => {
    render_();
    expect(screen.getByRole('button', { name: /standard grid/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
