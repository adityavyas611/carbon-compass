import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { FootprintBreakdown } from '@/types';
import { generateInsight, canMakeAiRequest } from '@/services/aiService';
import { ALL_ACTIONS } from '@/utils/actions';
import InsightCard from '@/components/common/InsightCard';

interface Props {
  footprint: FootprintBreakdown | null;
  loggedActions: { actionId: string; date: string; co2SavedKg: number }[];
  streakDays: number;
  insights: string[];
  onAddInsight: (insight: string) => void;
}

export default function AIInsightsSection({
  footprint,
  loggedActions,
  streakDays,
  insights,
  onAddInsight,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateInsight = async () => {
    if (!footprint || loading) return;
    if (!canMakeAiRequest()) {
      setError('Please wait a few seconds before generating another insight.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const recentActionNames = loggedActions
        .slice(-5)
        .map((a) => ALL_ACTIONS.find((ac) => ac.id === a.actionId)?.title ?? a.actionId);
      const insight = await generateInsight(footprint, recentActionNames, streakDays);
      onAddInsight(insight);
    } catch (e: unknown) {
      if (import.meta.env.DEV) console.error(e);
      setError('Unable to generate insight. AI may not be configured on this server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="insights-heading" className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-earth-500" aria-hidden="true" />
          <h3 id="insights-heading" className="text-sm font-semibold text-forest-800 dark:text-cream">
            AI Insights
          </h3>
        </div>
        <button
          onClick={handleGenerateInsight}
          disabled={!footprint || loading}
          aria-label={loading ? 'Generating insight…' : 'Generate new insight'}
          aria-busy={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-forest-600 dark:text-forest-300 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-forest-400 rounded"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`}
            aria-hidden="true"
          />
          Generate
        </button>
      </div>

      <p className="text-xs text-sage-500 dark:text-sage-400 mb-3">
        AI insights are powered by a server-side API. Your data is never sent with an API key from the browser.
      </p>

      <div aria-live="polite" aria-atomic="true">
        {error && (
          <p role="alert" className="text-xs text-red-600 mb-2">
            {error}
          </p>
        )}
        {loading && <InsightCard insight="" loading />}
        {insights.length > 0 && !loading && (
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        )}
        {insights.length === 0 && !loading && !error && (
          <p className="text-xs text-sage-500 italic">Tap Generate to get your first AI coaching tip.</p>
        )}
      </div>
    </section>
  );
}
