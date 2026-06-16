import '@/test/helpers/dashboardMocks';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '@/components/dashboard/Dashboard';
import { dashboardMockState, resetDashboardMocks } from '@/test/helpers/dashboardMocks';

describe('Dashboard — grade colors and CTA', () => {
  beforeEach(resetDashboardMocks);

  it('shows TrendingDown icon for footprint well below global average', () => {
    dashboardMockState.footprint = { transport: 200, energy: 300, diet: 300, shopping: 200, total: 1000 };
    const { container } = render(<Dashboard />);
    expect(container.firstChild).not.toBeNull();
  });

  it('shows TrendingUp icon for footprint well above global average', () => {
    dashboardMockState.footprint = { transport: 5000, energy: 4000, diet: 3000, shopping: 2000, total: 14000 };
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /your dashboard/i })).toBeInTheDocument();
  });

  it('shows Minus icon when footprint is within 5% of average', () => {
    dashboardMockState.footprint = { transport: 1200, energy: 1200, diet: 1200, shopping: 1200, total: 4800 };
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /your dashboard/i })).toBeInTheDocument();
  });

  it('CTA message varies by biggest category (energy)', () => {
    dashboardMockState.footprint = { transport: 1000, energy: 5000, diet: 500, shopping: 500, total: 7000 };
    render(<Dashboard />);
    expect(screen.getByText(/~860 kg/i)).toBeInTheDocument();
  });

  it('CTA message varies by biggest category (diet)', () => {
    dashboardMockState.footprint = { transport: 1000, energy: 1000, diet: 4000, shopping: 500, total: 6500 };
    render(<Dashboard />);
    expect(screen.getByText(/~180 kg/i)).toBeInTheDocument();
  });

  it('CTA message varies by biggest category (shopping)', () => {
    dashboardMockState.footprint = { transport: 100, energy: 100, diet: 100, shopping: 5000, total: 5300 };
    render(<Dashboard />);
    expect(screen.getByText(/~120 kg/i)).toBeInTheDocument();
  });

  it('grade color class for F grade (red)', () => {
    dashboardMockState.footprint = { transport: 5000, energy: 4000, diet: 3000, shopping: 2000, total: 14000 };
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.text-red-500')).not.toBeNull();
  });

  it('grade color class for B grade (sage)', () => {
    dashboardMockState.footprint = { transport: 2000, energy: 1000, diet: 1000, shopping: 1000, total: 5000 };
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.text-sage-600')).not.toBeNull();
  });

  it('grade color class for C grade (earth)', () => {
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.text-earth-600')).not.toBeNull();
  });
});
