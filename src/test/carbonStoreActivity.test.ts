import { describe, it, expect } from 'vitest';
import { useCarbonStore } from '@/store/carbonStore';
import { setupCarbonStoreTests, store } from '@/test/helpers/carbonStoreTestUtils';

setupCarbonStoreTests();

describe('logActivity — streak tracking', () => {
  const activity = {
    date: new Date().toISOString().slice(0, 10),
    type: 'meal' as const,
    label: 'Plant-based meal',
    co2Kg: -0.5,
  };

  it('adds to activityLogs', () => {
    store().logActivity(activity);
    expect(store().activityLogs).toHaveLength(1);
  });

  it('rejects invalid activity input', () => {
    store().logActivity({ ...activity, label: '' });
    expect(store().activityLogs).toHaveLength(0);
  });

  it('assigns a unique id to each log entry', () => {
    store().logActivity(activity);
    store().logActivity(activity);
    const ids = store().activityLogs.map((l) => l.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('starts streak at 1 on first log', () => {
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(1);
    expect(store().streak.longestDays).toBe(1);
  });

  it('does not increment streak for same-day duplicate logs', () => {
    store().logActivity(activity);
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(1);
  });

  it('increments streak when logging on the next consecutive day', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    useCarbonStore.setState({
      streak: { currentDays: 1, longestDays: 1, lastLogDate: yesterday },
    });
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(2);
    expect(store().streak.longestDays).toBe(2);
  });

  it('resets streak to 1 when logging after a gap', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    useCarbonStore.setState({
      streak: { currentDays: 5, longestDays: 10, lastLogDate: threeDaysAgo },
    });
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(1);
    expect(store().streak.longestDays).toBe(10);
  });

  it('updates longestDays when new streak exceeds it', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    useCarbonStore.setState({
      streak: { currentDays: 6, longestDays: 6, lastLogDate: yesterday },
    });
    store().logActivity(activity);
    expect(store().streak.currentDays).toBe(7);
    expect(store().streak.longestDays).toBe(7);
  });

  it('earns first-log badge on first activity', () => {
    store().logActivity(activity);
    const badge = store().badges.find((b) => b.id === 'first-log');
    expect(badge?.earned).toBe(true);
  });

  it('does not re-earn first-log badge on subsequent logs', () => {
    store().logActivity(activity);
    const beforeDate = store().badges.find((b) => b.id === 'first-log')?.earnedDate;
    store().logActivity(activity);
    const afterDate = store().badges.find((b) => b.id === 'first-log')?.earnedDate;
    expect(afterDate).toBe(beforeDate);
  });
});
