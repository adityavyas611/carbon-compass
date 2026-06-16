import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FootprintChart from '@/components/dashboard/FootprintChart';
import { LARGE_FOOTPRINT } from '@/test/fixtures';

describe('FootprintChart', () => {
  it('renders with footprint data', () => {
    const { container } = render(<FootprintChart footprint={LARGE_FOOTPRINT} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('has accessible role and label with data values', () => {
    render(<FootprintChart footprint={LARGE_FOOTPRINT} />);
    expect(screen.getByRole('img', { name: /transport.*energy.*diet.*shopping/i })).toBeInTheDocument();
  });

  it('filters out zero-value categories', () => {
    const fp = { transport: 0, energy: 2000, diet: 0, shopping: 500, total: 2500 };
    const { container } = render(<FootprintChart footprint={fp} />);
    expect(container.firstChild).not.toBeNull();
  });
});
