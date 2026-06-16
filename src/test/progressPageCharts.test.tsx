import '@/test/helpers/progressPageMocks';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressPage from '@/components/progress/ProgressPage';
import { progressPageMockState, resetProgressPageMocks } from '@/test/helpers/progressPageMocks';

describe('ProgressPage — monthly chart', () => {
  beforeEach(resetProgressPageMocks);

  it('shows bar chart when there is monthly history', () => {
    progressPageMockState.monthlyHistory = [
      { month: '2024-01', footprintKg: 7000, actionsCompleted: 2, co2SavedKg: 200 },
    ];
    render(<ProgressPage />);
    expect(screen.getByText(/CO₂ saved by month/i)).toBeInTheDocument();
  });

  it('sorts unsorted monthly history chronologically for chart', () => {
    progressPageMockState.monthlyHistory = [
      { month: '2024-03', footprintKg: 7000, actionsCompleted: 3, co2SavedKg: 300 },
      { month: '2024-01', footprintKg: 7000, actionsCompleted: 1, co2SavedKg: 100 },
      { month: '2024-02', footprintKg: 7000, actionsCompleted: 2, co2SavedKg: 200 },
    ];
    render(<ProgressPage />);
    expect(screen.getByText(/CO₂ saved by month/i)).toBeInTheDocument();
  });

  it('does NOT show bar chart when monthly history is empty', () => {
    render(<ProgressPage />);
    expect(screen.queryByText(/CO₂ saved by month/i)).not.toBeInTheDocument();
  });
});
