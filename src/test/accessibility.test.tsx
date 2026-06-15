import { describe, it, expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { renderWithTheme } from '@/test/test-utils';
import TransportStep from '@/components/onboarding/TransportStep';
import ActionHub from '@/components/actions/ActionHub';
import Navigation from '@/components/common/Navigation';
import AssessmentFlow from '@/components/onboarding/AssessmentFlow';
import { DEFAULT_TRANSPORT, LARGE_FOOTPRINT } from '@/test/fixtures';

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => ({
    footprint: LARGE_FOOTPRINT,
    loggedActions: [],
    logAction: vi.fn(),
    currentView: 'dashboard',
    setView: vi.fn(),
    completeAssessment: vi.fn(),
  })),
}));

describe('accessibility (axe)', () => {
  it('TransportStep has no detectable a11y violations', async () => {
    const { container } = renderWithTheme(
      <TransportStep data={DEFAULT_TRANSPORT} onChange={vi.fn()} onNext={vi.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ActionHub has no detectable a11y violations', async () => {
    const { container } = renderWithTheme(<ActionHub />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Navigation has no detectable a11y violations', async () => {
    const { container } = renderWithTheme(<Navigation />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AssessmentFlow has no detectable a11y violations', async () => {
    const { container } = renderWithTheme(<AssessmentFlow />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
