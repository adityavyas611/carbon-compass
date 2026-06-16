import { describe, it, expect } from 'vitest';
import { useCarbonStore } from '@/store/carbonStore';
import { setupCarbonStoreTests, store } from '@/test/helpers/carbonStoreTestUtils';

setupCarbonStoreTests();

describe('checkAndAwardBadges', () => {
  it('awards 7-day-streak badge when streak >= 7', () => {
    useCarbonStore.setState({ streak: { currentDays: 7, longestDays: 7, lastLogDate: null } });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === '7-day-streak')?.earned).toBe(true);
  });

  it('does not award 7-day-streak badge below threshold', () => {
    useCarbonStore.setState({ streak: { currentDays: 6, longestDays: 6, lastLogDate: null } });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === '7-day-streak')?.earned).toBe(false);
  });

  it('awards 30-day-streak badge when streak >= 30', () => {
    useCarbonStore.setState({ streak: { currentDays: 30, longestDays: 30, lastLogDate: null } });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === '30-day-streak')?.earned).toBe(true);
  });

  it('awards plant-meal badge after 10 plant-based meals', () => {
    const plantLogs = Array.from({ length: 10 }, (_, i) => ({
      id: `log-${i}`,
      date: '2024-01-01',
      type: 'meal' as const,
      label: 'Plant-based meal',
      co2Kg: -0.5,
    }));
    useCarbonStore.setState({ activityLogs: plantLogs });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'plant-meal')?.earned).toBe(true);
  });

  it('does not award plant-meal badge with fewer than 10', () => {
    const plantLogs = Array.from({ length: 9 }, (_, i) => ({
      id: `log-${i}`,
      date: '2024-01-01',
      type: 'meal' as const,
      label: 'Plant-based meal',
      co2Kg: -0.5,
    }));
    useCarbonStore.setState({ activityLogs: plantLogs });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'plant-meal')?.earned).toBe(false);
  });

  it('awards bike-commuter badge after 5 bike commutes', () => {
    const bikeLogs = Array.from({ length: 5 }, (_, i) => ({
      id: `log-${i}`,
      date: '2024-01-01',
      type: 'commute' as const,
      label: 'Biked / Walked',
      co2Kg: 0,
    }));
    useCarbonStore.setState({ activityLogs: bikeLogs });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'bike-commuter')?.earned).toBe(true);
  });

  it('awards ton-saved badge when total saved >= 1000 kg', () => {
    useCarbonStore.setState({
      loggedActions: [{ actionId: 'ev-switch', date: '2024-01-01', co2SavedKg: 1000 }],
    });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'ton-saved')?.earned).toBe(true);
  });

  it('does not award ton-saved below 1000 kg', () => {
    useCarbonStore.setState({
      loggedActions: [{ actionId: 'led-bulbs', date: '2024-01-01', co2SavedKg: 999 }],
    });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'ton-saved')?.earned).toBe(false);
  });

  it('awards green-energy badge when green-energy action is logged', () => {
    useCarbonStore.setState({
      loggedActions: [{ actionId: 'green-energy', date: '2024-01-01', co2SavedKg: 860 }],
    });
    store().checkAndAwardBadges();
    expect(store().badges.find((b) => b.id === 'green-energy')?.earned).toBe(true);
  });

  it('does not re-award already-earned badges', () => {
    useCarbonStore.setState({
      badges: useCarbonStore.getState().badges.map((b) =>
        b.id === '7-day-streak'
          ? { ...b, earned: true, earnedDate: '2024-01-01T00:00:00.000Z' }
          : b
      ),
      streak: { currentDays: 7, longestDays: 7, lastLogDate: null },
    });
    store().checkAndAwardBadges();
    const badge = store().badges.find((b) => b.id === '7-day-streak');
    expect(badge?.earnedDate).toBe('2024-01-01T00:00:00.000Z');
  });
});
