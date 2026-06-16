import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import InsightCard from '@/components/common/InsightCard';

interface WeeklyAiReportSectionProps {
  reportLoading: boolean;
  reportError: string;
  weeklyReport: string | null;
  onGenerate: () => void;
}

export default function WeeklyAiReportSection({
  reportLoading,
  reportError,
  weeklyReport,
  onGenerate,
}: WeeklyAiReportSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      aria-labelledby="weekly-report-heading"
      className="card mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-earth-500" aria-hidden="true" />
          <h2 id="weekly-report-heading" className="text-sm font-semibold text-forest-800 dark:text-cream">
            Weekly AI Summary
          </h2>
        </div>
        <button
          onClick={onGenerate}
          disabled={reportLoading}
          aria-label={reportLoading ? 'Generating weekly report…' : 'Generate weekly report'}
          aria-busy={reportLoading}
          className="flex items-center gap-1.5 text-xs font-medium text-forest-600 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-forest-400 rounded"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reportLoading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
          Generate
        </button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {reportError && <p role="alert" className="text-xs text-red-600 mb-2">{reportError}</p>}
        {reportLoading && <InsightCard insight="" loading />}
        {weeklyReport && !reportLoading && <InsightCard insight={weeklyReport} />}
        {!weeklyReport && !reportLoading && !reportError && (
          <p className="text-xs text-sage-500 italic">Generate a personalised summary of your week.</p>
        )}
      </div>
    </motion.section>
  );
}
