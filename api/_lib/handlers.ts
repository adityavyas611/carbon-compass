import type { z } from 'zod';
import { checkRateLimit } from './rateLimit.js';
import { createInsight, createWeeklyReport } from './openai.js';
import { InsightRequestSchema, WeeklyReportRequestSchema } from './validation.js';
import type { HandlerResult } from './createPostHandler.js';

const OPENAI_NOT_CONFIGURED = 'OPENAI_API_KEY not configured';

async function handleAiRequest<TSchema extends z.ZodType>(
  body: unknown,
  clientId: string,
  options: {
    schema: TSchema;
    execute: (data: z.infer<TSchema>) => Promise<string>;
    responseKey: 'insight' | 'report';
    errorMessage: string;
  }
): Promise<HandlerResult> {
  const rate = checkRateLimit(clientId);
  if (!rate.allowed) {
    return {
      status: 429,
      body: { error: `Rate limit exceeded. Try again in ${rate.retryAfterSec} seconds.` },
    };
  }

  const parsed = options.schema.safeParse(body);
  if (!parsed.success) {
    return { status: 422, body: { error: 'Invalid request data' } };
  }

  try {
    const value = await options.execute(parsed.data);
    return { status: 200, body: { [options.responseKey]: value } };
  } catch (e: unknown) {
    if (process.env.NODE_ENV !== 'production') console.error(e);
    if (e instanceof Error && e.message === OPENAI_NOT_CONFIGURED) {
      return { status: 503, body: { error: 'AI insights are not configured on this server.' } };
    }
    return { status: 500, body: { error: options.errorMessage } };
  }
}

export function handleInsightRequest(body: unknown, clientId: string): Promise<HandlerResult> {
  return handleAiRequest(body, clientId, {
    schema: InsightRequestSchema,
    execute: (data) => createInsight(data.footprint, data.recentActions, data.streakDays),
    responseKey: 'insight',
    errorMessage: 'Unable to generate insight. Please try again later.',
  });
}

export function handleWeeklyReportRequest(body: unknown, clientId: string): Promise<HandlerResult> {
  return handleAiRequest(body, clientId, {
    schema: WeeklyReportRequestSchema,
    execute: (data) =>
      createWeeklyReport(data.footprint, data.weeklyActionsCount, data.co2SavedKg),
    responseKey: 'report',
    errorMessage: 'Unable to generate report. Please try again later.',
  });
}
