import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecentLogGroups } from '@/hooks/useRecentLogGroups';
import type { ActivityLog } from '@/types';

const logs: ActivityLog[] = [
  { id: '1', date: '2026-06-15', type: 'meal', label: 'Lunch', co2Kg: 0.5 },
  { id: '2', date: '2026-06-14', type: 'commute', label: 'Walk', co2Kg: 0 },
  { id: '3', date: '2026-06-14', type: 'meal', label: 'Dinner', co2Kg: 1 },
];

describe('useRecentLogGroups', () => {
  it('groups logs by date and sorts descending', () => {
    const { result } = renderHook(() => useRecentLogGroups(logs));
    expect(result.current.dates[0]).toBe('2026-06-15');
    expect(result.current.dates[1]).toBe('2026-06-14');
    expect(result.current.groups['2026-06-14']).toHaveLength(2);
  });
});
