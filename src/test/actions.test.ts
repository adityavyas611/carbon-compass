import { describe, it, expect } from 'vitest';
import { getTopActions, ALL_ACTIONS } from '@/utils/actions';
import type { FootprintBreakdown } from '@/types';

const makeFootprint = (overrides: Partial<FootprintBreakdown> = {}): FootprintBreakdown => ({
  transport: 1000,
  energy: 500,
  diet: 800,
  shopping: 300,
  total: 2600,
  ...overrides,
});

describe('getTopActions', () => {
  it('returns the requested number of actions', () => {
    const actions = getTopActions(makeFootprint(), 3);
    expect(actions).toHaveLength(3);
  });

  it('returns 1 action when count is 1', () => {
    const actions = getTopActions(makeFootprint(), 1);
    expect(actions).toHaveLength(1);
  });

  it('all returned actions exist in ALL_ACTIONS', () => {
    const actions = getTopActions(makeFootprint(), 3);
    for (const a of actions) {
      expect(ALL_ACTIONS.find((ac) => ac.id === a.id)).toBeDefined();
    }
  });

  it('returns no duplicates', () => {
    const actions = getTopActions(makeFootprint(), 4);
    const ids = actions.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prioritises the highest-footprint category', () => {
    // Transport is highest by far — top action should be transport-related
    const fp = makeFootprint({ transport: 5000, energy: 100, diet: 100, shopping: 100 });
    const [top] = getTopActions(fp, 3);
    expect(top.category).toBe('transport');
  });

  it('falls back to fill slots when count exceeds number of categories (fill-remaining branch)', () => {
    // Only 4 categories exist; requesting 5 forces the fill-remaining code path (lines 192-195)
    const actions = getTopActions(makeFootprint(), 5);
    expect(actions).toHaveLength(5);
    // Still no duplicates
    const ids = actions.map((a) => a.id);
    expect(new Set(ids).size).toBe(5);
  });

  it('handles count=0 gracefully', () => {
    expect(getTopActions(makeFootprint(), 0)).toHaveLength(0);
  });

  it('sorts top actions by category footprint, highest first', () => {
    // Transport is largest; its top action should be first
    const fp = makeFootprint({ transport: 9000, energy: 100, diet: 100, shopping: 100 });
    const [first] = getTopActions(fp, 3);
    expect(first.category).toBe('transport');
  });

  it('second action matches second-highest category', () => {
    const fp = makeFootprint({ transport: 9000, diet: 7000, energy: 100, shopping: 100 });
    const actions = getTopActions(fp, 3);
    expect(actions[0].category).toBe('transport');
    expect(actions[1].category).toBe('diet');
  });

  it('skips categories with no matching actions (line 187 false branch)', () => {
    const withoutShopping = ALL_ACTIONS.filter((a) => a.category !== 'shopping');
    const fp = makeFootprint({ transport: 100, energy: 100, diet: 100, shopping: 9000, total: 9300 });
    const actions = getTopActions(fp, 3, withoutShopping);
    expect(actions).toHaveLength(3);
    expect(actions.every((a) => a.category !== 'shopping')).toBe(true);
  });
});

describe('ALL_ACTIONS', () => {
  it('each action has a unique id', () => {
    const ids = ALL_ACTIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each action has the required fields', () => {
    for (const a of ALL_ACTIONS) {
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('title');
      expect(a).toHaveProperty('category');
      expect(a).toHaveProperty('co2SavedKg');
      expect(a.co2SavedKg).toBeGreaterThan(0);
    }
  });

  it('all categories are valid', () => {
    const validCategories = new Set(['transport', 'energy', 'diet', 'shopping']);
    for (const a of ALL_ACTIONS) {
      expect(validCategories.has(a.category)).toBe(true);
    }
  });
});
