import OpenAI from 'openai';
import type { z } from 'zod';
import type { FootprintBreakdownSchema } from './validation.js';

type FootprintBreakdown = z.infer<typeof FootprintBreakdownSchema>;

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function kgToTonnes(kg: number): number {
  return kg / 1000;
}

function getBiggestCategory(footprint: FootprintBreakdown): { label: string; kg: number } {
  const ranked = [
    { label: 'transport', kg: footprint.transport },
    { label: 'energy', kg: footprint.energy },
    { label: 'diet', kg: footprint.diet },
    { label: 'shopping', kg: footprint.shopping },
  ].sort((a, b) => b.kg - a.kg);
  return ranked[0] ?? { label: 'transport', kg: footprint.transport };
}

export async function createInsight(
  footprint: FootprintBreakdown,
  recentActions: string[],
  streakDays: number
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const biggestCategory = getBiggestCategory(footprint);

  const prompt = `You are a friendly, encouraging carbon footprint coach. Generate a single, actionable insight (2-3 sentences max) for someone with:
- Total footprint: ${kgToTonnes(footprint.total).toFixed(1)} tonnes CO₂e/year
- Biggest category: ${biggestCategory.label} (${kgToTonnes(biggestCategory.kg).toFixed(1)}t)
- ${streakDays > 0 ? `Currently on a ${streakDays}-day logging streak` : 'Just getting started'}
- Recent actions completed: ${recentActions.length > 0 ? recentActions.join(', ') : 'none yet'}

Be specific, positive, and science-grounded. Never preachy. End with one clear next step.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.7,
  });

  return response.choices[0].message.content ?? 'Keep logging your activities to unlock personalized insights!';
}

export async function createWeeklyReport(
  footprint: FootprintBreakdown,
  weeklyActionsCount: number,
  co2SavedKg: number
): Promise<string> {
  const client = getClient();
  if (!client) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const prompt = `Generate a brief, encouraging weekly carbon footprint summary (2-3 sentences) for someone who:
- Has a baseline of ${kgToTonnes(footprint.total).toFixed(1)} tonnes CO₂e/year
- Completed ${weeklyActionsCount} eco-actions this week
- Saved approximately ${co2SavedKg.toFixed(1)} kg CO₂ this week

Be warm, specific, and motivating. Include one concrete tip for next week.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.7,
  });

  return response.choices[0].message.content ?? '';
}
