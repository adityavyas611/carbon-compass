import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import { getGrade, formatTonnes } from '@/utils/calculations';
import { getWeeklyActionStats, sumLoggedActionsCo2 } from '@/utils/stats';
import { generateWeeklyReport, canMakeAiRequest } from '@/services/aiService';
import MonthlyReportCard from '@/components/progress/MonthlyReportCard';
import WeeklyAiReportSection from '@/components/progress/WeeklyAiReportSection';
import SavingsPerspectiveCard from '@/components/progress/SavingsPerspectiveCard';
import MonthlySavingsChart from '@/components/progress/MonthlySavingsChart';
import BadgesSection from '@/components/progress/BadgesSection';
import ShareProgressCard from '@/components/progress/ShareProgressCard';

export default function ProgressPage() {
  const { footprint, loggedActions, badges, streak, monthlyHistory, weeklyReport, setWeeklyReport } =
    useCarbonStore();

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const totalSaved = useMemo(() => sumLoggedActionsCo2(loggedActions), [loggedActions]);
  const { count: weeklyActionsCount, co2SavedKg: weeklySaved } = useMemo(
    () => getWeeklyActionStats(loggedActions),
    [loggedActions]
  );
  const grade = footprint ? getGrade(footprint.total) : null;
  const earnedBadgeCount = badges.filter((b) => b.earned).length;

  const handleGenerateReport = async () => {
    if (!footprint || reportLoading) return;
    if (!canMakeAiRequest()) {
      setReportError('Please wait a few seconds before generating another report.');
      return;
    }
    setReportLoading(true);
    setReportError('');
    try {
      const report = await generateWeeklyReport(footprint, weeklyActionsCount, weeklySaved);
      setWeeklyReport(report);
    } catch (e: unknown) {
      if (import.meta.env.DEV) console.error(e);
      setReportError('Unable to generate weekly report. AI may not be configured on this server.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = `I've saved ${formatTonnes(totalSaved)} CO₂ with CarbonTrack! Grade: ${grade?.grade ?? '—'}. Every action counts. 🌱`;
    try {
      await navigator.clipboard?.writeText(text);
      setCopyStatus('Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 3000);
    } catch {
      setCopyStatus('Unable to copy. Please try again.');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-2xl font-bold text-forest-900 dark:text-cream mb-0.5">Your Progress</h1>
        <p className="text-sm text-sage-600 dark:text-sage-400">Every action adds up. Here's your story so far.</p>
      </motion.div>

      <MonthlyReportCard footprint={footprint} totalSaved={totalSaved} streak={streak} />

      {footprint && (
        <WeeklyAiReportSection
          reportLoading={reportLoading}
          reportError={reportError}
          weeklyReport={weeklyReport}
          onGenerate={handleGenerateReport}
        />
      )}

      <SavingsPerspectiveCard totalSaved={totalSaved} />
      <MonthlySavingsChart monthlyHistory={monthlyHistory} />
      <BadgesSection badges={badges} />

      <ShareProgressCard
        totalSaved={totalSaved}
        earnedBadgeCount={earnedBadgeCount}
        gradeLabel={grade?.grade ?? '—'}
        copyStatus={copyStatus}
        onCopy={handleCopy}
      />
    </div>
  );
}
