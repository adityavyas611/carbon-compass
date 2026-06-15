import { Sparkles } from 'lucide-react';

interface Props {
  insight: string;
  loading?: boolean;
}

export default function InsightCard({ insight, loading }: Props) {
  if (loading) {
    return (
      <div
        className="card border-earth-200 bg-earth-50 dark:bg-earth-900/30 dark:border-earth-800"
        role="status"
        aria-label="Generating AI insight"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-earth-500 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-xs font-semibold text-earth-700 dark:text-earth-300">AI Insight</span>
        </div>
        <div className="space-y-2" aria-hidden="true">
          <div className="h-3 bg-earth-200 dark:bg-earth-800 rounded-full animate-pulse motion-reduce:animate-none w-full" />
          <div className="h-3 bg-earth-200 dark:bg-earth-800 rounded-full animate-pulse motion-reduce:animate-none w-4/5" />
          <div className="h-3 bg-earth-200 dark:bg-earth-800 rounded-full animate-pulse motion-reduce:animate-none w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="card border-earth-200 bg-earth-50 dark:bg-earth-900/30 dark:border-earth-800">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-earth-500" aria-hidden="true" />
        <span className="text-xs font-semibold text-earth-700 dark:text-earth-300">AI Insight</span>
      </div>
      <p className="text-sm text-earth-900 dark:text-earth-100 leading-relaxed">{insight}</p>
    </div>
  );
}
