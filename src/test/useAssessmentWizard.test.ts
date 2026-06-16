import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssessmentWizard } from '@/hooks/useAssessmentWizard';

vi.mock('@/store/carbonStore', () => ({
  useCarbonStore: vi.fn(() => ({ completeAssessment: vi.fn() })),
}));

describe('useAssessmentWizard', () => {
  it('starts on the transport step', () => {
    const { result } = renderHook(() => useAssessmentWizard());
    expect(result.current.currentStep).toBe('transport');
    expect(result.current.stepIndex).toBe(0);
  });

  it('advances to energy on goNext', () => {
    const { result } = renderHook(() => useAssessmentWizard());
    act(() => result.current.goNext());
    expect(result.current.currentStep).toBe('energy');
  });

  it('computes a live footprint estimate', () => {
    const { result } = renderHook(() => useAssessmentWizard());
    expect(result.current.totalKg).toBeGreaterThan(0);
    expect(result.current.liveEstimate.transport).toBeGreaterThan(0);
  });
});
