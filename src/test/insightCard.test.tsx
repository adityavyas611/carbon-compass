import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InsightCard from '@/components/common/InsightCard';

describe('InsightCard', () => {
  it('renders insight text', () => {
    render(<InsightCard insight="Switch to a plant-based diet" />);
    expect(screen.getByText('Switch to a plant-based diet')).toBeInTheDocument();
  });

  it('renders AI Insight label', () => {
    render(<InsightCard insight="Some insight" />);
    expect(screen.getByText('AI Insight')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading=true', () => {
    render(<InsightCard insight="" loading />);
    expect(screen.getByRole('status', { name: /generating ai insight/i })).toBeInTheDocument();
  });

  it('renders AI Insight label in loading state too', () => {
    render(<InsightCard insight="" loading />);
    expect(screen.getByText('AI Insight')).toBeInTheDocument();
  });

  it('does not show skeleton when not loading', () => {
    const { container } = render(<InsightCard insight="Real insight" />);
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });
});
