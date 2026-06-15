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
import { createFramerMotionMockNoRef } from '@/test/mocks/framerMotion';

vi.mock('framer-motion', () => createFramerMotionMockNoRef());

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
