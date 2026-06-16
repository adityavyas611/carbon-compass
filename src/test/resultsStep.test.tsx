import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultsStep from '@/components/onboarding/ResultsStep';

// ── ResultsStep ─────────────────────────────────────────────

const makeResultsProps = (total: number) => ({
  transport: total * 0.4,
  energy: total * 0.25,
  diet: total * 0.25,
  shopping: total * 0.1,
  total,
  onFinish: vi.fn(),
  onBack: vi.fn(),
});

describe('ResultsStep', () => {
  it('renders footprint breakdown', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText(/footprint breakdown/i)).toBeInTheDocument();
  });

  it('renders the comparison section', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText(/how you compare/i)).toBeInTheDocument();
    expect(screen.getByText(/global average/i)).toBeInTheDocument();
    expect(screen.getByText(/us average/i)).toBeInTheDocument();
    expect(screen.getByText(/paris 2030/i)).toBeInTheDocument();
  });

  it('shows "below global average" message when tonnes < 4.8', () => {
    render(<ResultsStep {...makeResultsProps(2000)} />);
    // 2000 kg = 2 tonnes < 4.8 global average
    expect(screen.getByText(/already below the global average/i)).toBeInTheDocument();
  });

  it('shows "above global average" message when tonnes >= 4.8', () => {
    render(<ResultsStep {...makeResultsProps(9000)} />);
    // 9000 kg = 9 tonnes > 4.8 global average
    expect(screen.getByText(/biggest wins/i)).toBeInTheDocument();
  });

  it('calls onFinish when action plan button clicked', () => {
    const props = makeResultsProps(5000);
    render(<ResultsStep {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /see my action plan/i }));
    expect(props.onFinish).toHaveBeenCalled();
  });

  it('calls onBack when back button clicked', () => {
    const props = makeResultsProps(5000);
    render(<ResultsStep {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /go back to shopping/i }));
    expect(props.onBack).toHaveBeenCalled();
  });

  it('renders all four categories in breakdown', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText(/transport/i)).toBeInTheDocument();
    expect(screen.getByText(/energy/i)).toBeInTheDocument();
    expect(screen.getByText(/diet/i)).toBeInTheDocument();
    expect(screen.getByText(/shopping/i)).toBeInTheDocument();
  });

  it('shows A+ grade for very low footprints', () => {
    render(<ResultsStep {...makeResultsProps(1000)} />);
    expect(screen.getByText('A+')).toBeInTheDocument();
  });

  it('shows B grade for moderate footprints (5 tonnes)', () => {
    render(<ResultsStep {...makeResultsProps(5000)} />);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows F grade for very high footprints (15 tonnes)', () => {
    render(<ResultsStep {...makeResultsProps(15000)} />);
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('applies forest color class for high grades', () => {
    const { container } = render(<ResultsStep {...makeResultsProps(1000)} />);
    expect(container.querySelector('.text-forest-600')).not.toBeNull();
  });

  it('applies earth color class for C grade (6-8 tonnes)', () => {
    // 7000 kg = 7 tonnes → grade C → color earth
    const { container } = render(<ResultsStep {...makeResultsProps(7000)} />);
    expect(container.querySelector('.text-earth-600')).not.toBeNull();
  });
});

