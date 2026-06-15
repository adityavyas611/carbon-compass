import { describe, it, expect } from 'vitest';
import {
  FootprintBreakdownSchema,
  InsightRequestSchema,
  WeeklyReportRequestSchema,
} from './validation';

const VALID_FOOTPRINT = {
  transport: 1000,
  energy: 500,
  diet: 800,
  shopping: 300,
  total: 2600,
};

describe('FootprintBreakdownSchema', () => {
  it('accepts a valid footprint', () => {
    expect(FootprintBreakdownSchema.safeParse(VALID_FOOTPRINT).success).toBe(true);
  });

  it('rejects negative values', () => {
    expect(FootprintBreakdownSchema.safeParse({ ...VALID_FOOTPRINT, transport: -1 }).success).toBe(false);
  });

  it('rejects values above maximum', () => {
    expect(FootprintBreakdownSchema.safeParse({ ...VALID_FOOTPRINT, total: 2_000_000 }).success).toBe(false);
  });
});

describe('InsightRequestSchema', () => {
  it('accepts a valid insight request', () => {
    const result = InsightRequestSchema.safeParse({
      footprint: VALID_FOOTPRINT,
      recentActions: ['plant-meal'],
      streakDays: 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing footprint', () => {
    expect(InsightRequestSchema.safeParse({ recentActions: [], streakDays: 0 }).success).toBe(false);
  });

  it('rejects too many recent actions', () => {
    const actions = Array.from({ length: 21 }, (_, i) => `action-${i}`);
    expect(
      InsightRequestSchema.safeParse({
        footprint: VALID_FOOTPRINT,
        recentActions: actions,
        streakDays: 0,
      }).success
    ).toBe(false);
  });

  it('rejects action strings over 200 chars', () => {
    expect(
      InsightRequestSchema.safeParse({
        footprint: VALID_FOOTPRINT,
        recentActions: ['x'.repeat(201)],
        streakDays: 0,
      }).success
    ).toBe(false);
  });

  it('rejects negative streak days', () => {
    expect(
      InsightRequestSchema.safeParse({
        footprint: VALID_FOOTPRINT,
        recentActions: [],
        streakDays: -1,
      }).success
    ).toBe(false);
  });
});

describe('WeeklyReportRequestSchema', () => {
  it('accepts a valid weekly report request', () => {
    const result = WeeklyReportRequestSchema.safeParse({
      footprint: VALID_FOOTPRINT,
      weeklyActionsCount: 3,
      co2SavedKg: 150,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    expect(WeeklyReportRequestSchema.safeParse({ footprint: VALID_FOOTPRINT }).success).toBe(false);
  });

  it('rejects negative co2SavedKg', () => {
    expect(
      WeeklyReportRequestSchema.safeParse({
        footprint: VALID_FOOTPRINT,
        weeklyActionsCount: 1,
        co2SavedKg: -5,
      }).success
    ).toBe(false);
  });

  it('rejects weeklyActionsCount above limit', () => {
    expect(
      WeeklyReportRequestSchema.safeParse({
        footprint: VALID_FOOTPRINT,
        weeklyActionsCount: 1001,
        co2SavedKg: 0,
      }).success
    ).toBe(false);
  });
});
