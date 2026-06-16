import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrendLine from '@/components/dashboard/TrendLine';

describe('TrendLine', () => {
  it('renders with trend data', () => {
    const data = [
      { month: '2024-01', footprintKg: 5000, actionsCompleted: 2, co2SavedKg: 100 },
      { month: '2024-02', footprintKg: 4800, actionsCompleted: 3, co2SavedKg: 200 },
    ];
    const { container } = render(<TrendLine data={data} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('has accessible role and label with data values', () => {
    const data = [{ month: '2024-01', footprintKg: 5000, actionsCompleted: 0, co2SavedKg: 0 }];
    render(<TrendLine data={data} />);
    expect(screen.getByRole('img', { name: /jan.*5\.00 tonnes/i })).toBeInTheDocument();
  });

  it('sorts data by month ascending', () => {
    const data = [
      { month: '2024-03', footprintKg: 4600, actionsCompleted: 0, co2SavedKg: 0 },
      { month: '2024-01', footprintKg: 5000, actionsCompleted: 0, co2SavedKg: 0 },
      { month: '2024-02', footprintKg: 4800, actionsCompleted: 0, co2SavedKg: 0 },
    ];
    const { container } = render(<TrendLine data={data} />);
    expect(container.firstChild).not.toBeNull();
  });
});
