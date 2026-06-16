import '@/test/helpers/progressPageMocks';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgressPage from '@/components/progress/ProgressPage';
import { progressPageMockState, resetProgressPageMocks } from '@/test/helpers/progressPageMocks';

describe('ProgressPage — report card', () => {
  beforeEach(resetProgressPageMocks);

  it('renders the heading', () => {
    render(<ProgressPage />);
    expect(screen.getByRole('heading', { name: /your progress/i })).toBeInTheDocument();
  });

  it('shows the monthly carbon report', () => {
    render(<ProgressPage />);
    expect(screen.getByText(/monthly carbon report/i)).toBeInTheDocument();
  });

  it('shows the grade', () => {
    render(<ProgressPage />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('grade color class for B grade (sage)', () => {
    progressPageMockState.footprint = { transport: 2000, energy: 1000, diet: 1000, shopping: 1000, total: 5000 };
    const { container } = render(<ProgressPage />);
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(container.querySelector('.text-sage-600')).not.toBeNull();
  });

  it('shows the annual footprint', () => {
    render(<ProgressPage />);
    expect(screen.getByText('7.0t')).toBeInTheDocument();
  });

  it('shows streak days', () => {
    render(<ProgressPage />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows "below global average" message when grade is forest color', () => {
    progressPageMockState.footprint = { transport: 200, energy: 200, diet: 300, shopping: 300, total: 1000 };
    render(<ProgressPage />);
    expect(screen.getByText(/below the global average/i)).toBeInTheDocument();
  });

  it('shows "above the global average" message when grade is not forest', () => {
    render(<ProgressPage />);
    expect(screen.getByText(/above the global average/i)).toBeInTheDocument();
  });

  it('handles null footprint gracefully (shows — grade)', () => {
    progressPageMockState.footprint = null;
    render(<ProgressPage />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('does NOT show footprint stats section when footprint is null', () => {
    progressPageMockState.footprint = null;
    render(<ProgressPage />);
    expect(screen.queryByText(/annual/i)).not.toBeInTheDocument();
  });
});

describe('ProgressPage — savings perspective', () => {
  beforeEach(resetProgressPageMocks);

  it('does NOT show real-world equivalents when totalSaved=0', () => {
    render(<ProgressPage />);
    expect(screen.queryByText(/trees worth/i)).not.toBeInTheDocument();
  });

  it('shows real-world equivalents when totalSaved > 0', () => {
    progressPageMockState.loggedActions = [{ actionId: 'plant-meal', date: '2024-01-01', co2SavedKg: 210 }];
    render(<ProgressPage />);
    expect(screen.getByText(/trees worth/i)).toBeInTheDocument();
    expect(screen.getByText(/miles not driven/i)).toBeInTheDocument();
  });
});

describe('ProgressPage — share', () => {
  beforeEach(resetProgressPageMocks);

  it('shows share section', () => {
    render(<ProgressPage />);
    expect(screen.getByText(/share your progress/i)).toBeInTheDocument();
  });

  it('copy milestone button exists and writes to clipboard', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ProgressPage />);
    fireEvent.click(screen.getByRole('button', { name: /copy milestone text/i }));
    expect(writeText).toHaveBeenCalled();
  });
});
