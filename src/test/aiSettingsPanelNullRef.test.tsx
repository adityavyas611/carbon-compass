/**
 * Covers AISettingsPanel focus-trap guard: `if (!panel) return` (line 60).
 * Uses a framer-motion mock that drops refs so panelRef.current stays null.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createFramerMotionMockNoRef } from '@/test/mocks/framerMotion';

vi.mock('framer-motion', () => createFramerMotionMockNoRef());

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

vi.mock('@/services/aiService', () => ({
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
