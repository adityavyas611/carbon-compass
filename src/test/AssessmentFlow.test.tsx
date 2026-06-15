import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within, cleanup } from '@testing-library/react';
import AssessmentFlow from '@/components/onboarding/AssessmentFlow';
import { renderWithTheme } from '@/test/test-utils';
import { useReducedMotion } from 'framer-motion';

const mockCompleteAssessment = vi.fn();

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: () => ({
    completeAssessment: mockCompleteAssessment,
  }),
}));

describe('AssessmentFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useReducedMotion).mockReturnValue(false);
    renderWithTheme(<AssessmentFlow />);
  });

  it('renders the first step heading', () => {
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('shows step 1 of 5 progress', () => {
    expect(screen.getByText(/step 1 of 5/i)).toBeInTheDocument();
  });

  it('shows the live estimate banner', () => {
    expect(screen.getByText(/live estimate/i)).toBeInTheDocument();
  });

  it('shows the step progress bar', () => {
    expect(screen.getByRole('progressbar', { name: /assessment progress/i })).toBeInTheDocument();
  });

  it('shows Getting Around tab as current step on mount', () => {
    expect(screen.getByRole('button', { name: /getting around/i })).toHaveAttribute('aria-current', 'step');
  });

  it('has a "Next: Home Energy" button', () => {
    expect(screen.getByRole('button', { name: /next: home energy/i })).toBeInTheDocument();
  });

  it('advances to step 2 when Next is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    expect(screen.getByRole('heading', { name: /what powers your home/i })).toBeInTheDocument();
  });

  it('has correct aria progressbar', () => {
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
  });

  it('renders step navigation tabs', () => {
    expect(screen.getByRole('navigation', { name: /assessment steps/i })).toBeInTheDocument();
  });

  it('step tab navigation back: clicking previous tab navigates back', () => {
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    const nav = screen.getByRole('navigation', { name: /assessment steps/i });
    fireEvent.click(within(nav).getByRole('button', { name: /getting around/i }));
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('clicking a future tab does nothing', () => {
    const nav = screen.getByRole('navigation', { name: /assessment steps/i });
    fireEvent.click(within(nav).getByRole('button', { name: /home energy/i }));
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('clicking the current step tab keeps the current step', () => {
    const nav = screen.getByRole('navigation', { name: /assessment steps/i });
    fireEvent.click(within(nav).getByRole('button', { name: /getting around/i }));
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('calls completeAssessment when results step finishes', () => {
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: food/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: shopping/i }));
    fireEvent.click(screen.getByRole('button', { name: /see my results/i }));
    fireEvent.click(screen.getByRole('button', { name: /see my action plan/i }));
    expect(mockCompleteAssessment).toHaveBeenCalledTimes(1);
  });

  it('goBack returns to transport from energy step', () => {
    fireEvent.click(screen.getByRole('button', { name: /next: home energy/i }));
    fireEvent.click(screen.getByRole('button', { name: /go back to transport/i }));
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('uses reduced-motion when useReducedMotion is true', () => {
    cleanup();
    vi.mocked(useReducedMotion).mockReturnValue(true);
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /assessment progress/i })).toBeInTheDocument();
  });

  it('renders onboarding footer', () => {
    expect(screen.getByText(/measure, understand, reduce/i)).toBeInTheDocument();
  });
});
