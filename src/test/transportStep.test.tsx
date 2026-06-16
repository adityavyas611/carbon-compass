import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransportStep from '@/components/onboarding/TransportStep';
import { DEFAULT_TRANSPORT } from '@/test/fixtures';

// ── TransportStep ───────────────────────────────────────────

describe('TransportStep', () => {
  const onNext = vi.fn();
  const onChange = vi.fn();

  const render_ = (data = DEFAULT_TRANSPORT) =>
    render(<TransportStep data={data} onChange={onChange} onNext={onNext} />);

  it('renders the heading', () => {
    render_();
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('renders all car type options', () => {
    render_();
    expect(screen.getByRole('button', { name: /no car/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /electric/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /petrol/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /diesel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hybrid/i })).toBeInTheDocument();
  });

  it('shows car miles slider when carType is not none', () => {
    render_();
    expect(screen.getByLabelText(/miles driven per week/i)).toBeInTheDocument();
  });

  it('hides car miles slider when carType is none', () => {
    render_({ ...DEFAULT_TRANSPORT, carType: 'none' });
    expect(screen.queryByLabelText(/miles driven per week/i)).not.toBeInTheDocument();
  });

  it('calls onChange when a car type is selected', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /electric/i }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, carType: 'electric' });
  });

  it('calls onChange when car miles slider changes', () => {
    render_();
    const slider = screen.getByLabelText(/miles driven per week/i);
    fireEvent.change(slider, { target: { value: '200' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, carMilesPerWeek: 200 });
  });

  it('calls onChange when short flight − button clicked', () => {
    render_();
    const decBtn = screen.getAllByLabelText(/decrease short flights/i)[0];
    fireEvent.click(decBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 1 });
  });

  it('calls onChange when short flight + button clicked', () => {
    render_();
    const incBtn = screen.getAllByLabelText(/increase short flights/i)[0];
    fireEvent.click(incBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 3 });
  });

  it('short flights do not go below 0', () => {
    render_({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 0 });
    const decBtn = screen.getAllByLabelText(/decrease short flights/i)[0];
    fireEvent.click(decBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsShortPerYear: 0 });
  });

  it('calls onChange when long flight − button clicked', () => {
    render_();
    const decBtn = screen.getAllByLabelText(/decrease long flights/i)[0];
    fireEvent.click(decBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsLongPerYear: 0 });
  });

  it('calls onChange when long flight + button clicked', () => {
    render_();
    const incBtn = screen.getAllByLabelText(/increase long flights/i)[0];
    fireEvent.click(incBtn);
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, flightsLongPerYear: 2 });
  });

  it('calls onChange when transit slider changes', () => {
    render_();
    const slider = screen.getByLabelText(/public transit days per week/i);
    fireEvent.change(slider, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_TRANSPORT, publicTransitDaysPerWeek: 5 });
  });

  it('calls onNext when Next button clicked', () => {
    render_();
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    expect(onNext).toHaveBeenCalled();
  });

  it('selected car type button has aria-pressed=true', () => {
    render_();
    const petrolBtn = screen.getByRole('button', { name: /petrol/i });
    expect(petrolBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('unselected car type button has aria-pressed=false', () => {
    render_();
    const electricBtn = screen.getByRole('button', { name: /electric/i });
    expect(electricBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

