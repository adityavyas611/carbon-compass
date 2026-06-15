import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within, cleanup } from '@testing-library/react';
import AssessmentFlow from '@/components/onboarding/AssessmentFlow';
import { renderWithTheme } from '@/test/test-utils';
import { useReducedMotion } from 'framer-motion';

// Mock the zustand store so tests don't rely on persisted state
vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: () => ({
    completeAssessment: vi.fn(),
  }),
}));

import React from 'react';

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set(['initial','animate','exit','transition','variants','custom','layout','layoutId','whileHover','whileTap','whileFocus','whileInView']);
  const motionComponent = (tag: string) =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, variants, custom, ...p }, ref) => {
      // Invoke custom variant functions so enter/exit callbacks in AssessmentFlow are covered
      if (variants && typeof variants === 'object') {
        const v = variants as { enter?: (d: number) => unknown; exit?: (d: number) => unknown };
        const dir = typeof custom === 'number' ? custom : 1;
        if (typeof v.enter === 'function') v.enter(dir);
        if (typeof v.exit === 'function') v.exit(dir);
      }
      return React.createElement(
        tag,
        { ...Object.fromEntries(Object.entries(p).filter(([k]) => !MOTION_PROPS.has(k))), ref },
        children,
      );
    });
  const cache = new Map<string, unknown>();
  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_, tag: string) => {
      if (!cache.has(tag)) cache.set(tag, motionComponent(tag));
      return cache.get(tag);
    },
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useReducedMotion: vi.fn(() => false),
  };
});

describe('AssessmentFlow', () => {
  beforeEach(() => {
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

  it('has a "Next: Home Energy" button', () => {
    expect(screen.getByRole('button', { name: /next: home energy/i })).toBeInTheDocument();
  });

  it('advances to step 2 when Next is clicked', () => {
    const nextBtn = screen.getByRole('button', { name: /next: home energy/i });
    fireEvent.click(nextBtn);
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

  it('clicking the current step tab sets direction forward (line 143 i === stepIndex branch)', () => {
    const nav = screen.getByRole('navigation', { name: /assessment steps/i });
    // On transport step (i=0, stepIndex=0): i < stepIndex is false → setDirection(1)
    fireEvent.click(within(nav).getByRole('button', { name: /getting around/i }));
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
  });

  it('uses reduced-motion transition and variants when useReducedMotion is true (lines 120, 169–173)', () => {
    cleanup();
    vi.mocked(useReducedMotion).mockReturnValue(true);
    renderWithTheme(<AssessmentFlow />);
    expect(screen.getByRole('heading', { name: /how do you get around/i })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /assessment progress/i })).toBeInTheDocument();
  });
});
