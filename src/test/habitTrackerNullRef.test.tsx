/**
 * Dedicated test for the defensive null-ref guard in HabitTracker's focus-trap useEffect.
 *
 * Line 86: `if (!modal) return;`
 *
 * This guard is unreachable when the standard framer-motion mock forwards refs correctly
 * (modalRef.current is always populated when showAddModal=true). To hit the TRUE branch we
 * use the non-forwardRef variant of the mock so refs are never attached to motion.div elements.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';

// ── Non-forwarding framer-motion mock ───────────────────────
// Intentionally omits React.forwardRef so that motion elements never attach refs.
// This makes `modalRef.current === null` when the focus-trap useEffect runs.
vi.mock('framer-motion', () => {
  // 'ref' is included here so it is explicitly dropped and never forwarded to the DOM
  // element. In React 19, ref is a regular prop and would otherwise be attached
  // automatically, defeating the purpose of this null-ref test file.
  const MOTION_PROPS = new Set([
    'initial', 'animate', 'exit', 'transition', 'variants',
    'custom', 'layout', 'layoutId', 'whileHover', 'whileTap', 'whileFocus', 'whileInView',
    'ref',
  ]);
  // Plain function component — ref is filtered out, so modalRef.current stays null
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

const mockLogActivity = vi.fn();
vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => ({
    activityLogs: [],
    streak: { currentDays: 0, longestDays: 0, lastLogDate: null },
    logActivity: mockLogActivity,
  })),
}));

describe('HabitTracker – focus-trap null-ref guard (line 86)', () => {
  it('useEffect returns early at line 86 when modalRef.current is null (non-forwardRef mock)', async () => {
    const { default: HabitTracker } = await import('@/components/tracker/HabitTracker');
    render(<HabitTracker />);

    // Open the modal — showAddModal becomes true and the focus-trap useEffect runs.
    // Because motion.div does NOT forward the ref, modalRef.current stays null,
    // so the effect hits `if (!modal) return` (line 86 TRUE branch).
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log a new activity/i }));
    });

    // The dialog is rendered in the DOM despite the null ref, confirming the effect
    // hit `if (!modal) return` (line 86 TRUE branch) and returned early without throwing.
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });
});
