/**
 * Covers AISettingsPanel focus-trap guard: `if (!panel) return` (line 60).
 * Uses a framer-motion mock that drops refs so panelRef.current stays null.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('framer-motion', () => {
  const MOTION_PROPS = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'custom', 'layout', 'layoutId', 'whileHover', 'whileTap', 'whileFocus', 'whileInView',
    'ref',
  ]);
  const motionComponent =
    (tag: string) =>
    ({ children, ...p }: Record<string, unknown>) =>
      React.createElement(
        tag,
        Object.fromEntries(Object.entries(p).filter(([k]) => !MOTION_PROPS.has(k))),
        children,
      );
  const cache = new Map<string, unknown>();
  const motion = new Proxy({} as Record<string, unknown>, {
    get: (_, tag: string) => {
      if (!cache.has(tag)) cache.set(tag, motionComponent(tag));
      return cache.get(tag);
    },
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
  };
});

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => ({
    footprint: null,
    loggedActions: [],
    streak: { currentDays: 0, longestDays: 0, lastLogDate: null },
    addInsight: vi.fn(),
    insights: [],
    resetAll: vi.fn(),
  })),
}));

vi.mock('@/utils/aiInsights', () => ({
  generateInsight: vi.fn(),
  canMakeAiRequest: vi.fn().mockReturnValue(true),
}));

vi.mock('@/utils/actions', () => ({
  ALL_ACTIONS: [],
}));

describe('AISettingsPanel – focus-trap null-ref guard (line 60)', () => {
  it('Tab keydown returns early when panelRef.current is null', async () => {
    const { default: AISettingsPanel } = await import('@/components/common/AISettingsPanel');
    const onClose = vi.fn();
    render(<AISettingsPanel isOpen onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(onClose).not.toHaveBeenCalled();
  });
});
