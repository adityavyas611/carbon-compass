import { checkRateLimit } from './rateLimit';
import { createInsight, createWeeklyReport } from './openai';
import { InsightRequestSchema, WeeklyReportRequestSchema } from './validation';

interface HandlerResult {
  status: number;
  body: { insight?: string; report?: string; error?: string };
}

export async function handleInsightRequest(
  body: unknown,
  clientId: string
): Promise<HandlerResult> {
  const rate = checkRateLimit(clientId);
  if (!rate.allowed) {
    return {
      status: 429,
      body: { error: `Rate limit exceeded. Try again in ${rate.retryAfterSec} seconds.` },
    };
  }

  const parsed = InsightRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 422, body: { error: 'Invalid request data' } };
  }

  try {
    const insight = await createInsight(
      parsed.data.footprint,
      parsed.data.recentActions,
      parsed.data.streakDays
    );
    return { status: 200, body: { insight } };
  } catch (e: unknown) {
    if (process.env.NODE_ENV !== 'production') console.error(e);
    if (e instanceof Error && e.message === 'OPENAI_API_KEY not configured') {
      return { status: 503, body: { error: 'AI insights are not configured on this server.' } };
    }
    return { status: 500, body: { error: 'Unable to generate insight. Please try again later.' } };
  }
}

export async function handleWeeklyReportRequest(
  body: unknown,
  clientId: string
): Promise<HandlerResult> {
  const rate = checkRateLimit(clientId);
  if (!rate.allowed) {
    return {
      status: 429,
      body: { error: `Rate limit exceeded. Try again in ${rate.retryAfterSec} seconds.` },
    };
  }

  const parsed = WeeklyReportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 422, body: { error: 'Invalid request data' } };
  }

  try {
    const report = await createWeeklyReport(
      parsed.data.footprint,
      parsed.data.weeklyActionsCount,
      parsed.data.co2SavedKg
    );
    return { status: 200, body: { report } };
  } catch (e: unknown) {
    if (process.env.NODE_ENV !== 'production') console.error(e);
    if (e instanceof Error && e.message === 'OPENAI_API_KEY not configured') {
      return { status: 503, body: { error: 'AI insights are not configured on this server.' } };
    }
    return { status: 500, body: { error: 'Unable to generate report. Please try again later.' } };
  }
}
