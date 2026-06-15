import { z } from 'zod';

export const FootprintBreakdownSchema = z.object({
  transport: z.number().min(0).max(1000000),
  energy: z.number().min(0).max(1000000),
  diet: z.number().min(0).max(1000000),
  shopping: z.number().min(0).max(1000000),
  total: z.number().min(0).max(1000000),
});

export const InsightRequestSchema = z.object({
  footprint: FootprintBreakdownSchema,
  recentActions: z.array(z.string().trim().max(200)).max(20),
  streakDays: z.number().int().min(0).max(3650),
});

export const WeeklyReportRequestSchema = z.object({
  footprint: FootprintBreakdownSchema,
  weeklyActionsCount: z.number().int().min(0).max(1000),
  co2SavedKg: z.number().min(0).max(1000000),
});

export type InsightRequest = z.infer<typeof InsightRequestSchema>;
export type WeeklyReportRequest = z.infer<typeof WeeklyReportRequestSchema>;
