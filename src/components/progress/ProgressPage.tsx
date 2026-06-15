import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import { getGrade, formatTonnes, kgToTonnes } from '@/utils/calculations';
import { AVERAGES } from '@/utils/emissionFactors';
import { generateWeeklyReport, canMakeAiRequest } from '@/utils/aiInsights';
import InsightCard from '@/components/common/InsightCard';
import { Award, Share2, Sparkles, RefreshCw } from 'lucide-react';
import { format, parseISO, subDays, startOfDay } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ProgressPage() {
  const { footprint, loggedActions, badges, streak, monthlyHistory, weeklyReport, setWeeklyReport } =
    useCarbonStore();

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const totalSaved = useMemo(
    () => loggedActions.reduce((s, a) => s + a.co2SavedKg, 0),
    [loggedActions]
  );

  const weeklyActionsCount = useMemo(() => {
    const weekAgo = startOfDay(subDays(new Date(), 7));
    return loggedActions.filter((a) => new Date(a.date) >= weekAgo).length;
  }, [loggedActions]);

  const weeklySaved = useMemo(() => {
    const weekAgo = startOfDay(subDays(new Date(), 7));
    return loggedActions
      .filter((a) => new Date(a.date) >= weekAgo)
      .reduce((s, a) => s + a.co2SavedKg, 0);
  }, [loggedActions]);

  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);
  const grade = footprint ? getGrade(footprint.total) : null;

  const chartData = monthlyHistory
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map((d) => ({
      month: format(parseISO(`${d.month}-01`), 'MMM'),
      saved: Math.round(d.co2SavedKg),
      actions: d.actionsCompleted,
    }));

  const chartAriaLabel = chartData.length > 0
    ? `Monthly CO₂ savings bar chart: ${chartData.map((d) => `${d.month} ${d.saved} kg`).join(', ')}`
    : 'No monthly savings data yet';

  const treesEquivalent = Math.round(totalSaved / 21);
  const milesEquivalent = Math.round(totalSaved / 0.356);

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

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="card-elevated mb-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-forest-50 dark:bg-forest-800 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-sage-500 font-medium mb-1">Monthly Carbon Report</p>
              <p className="text-sm text-sage-700 dark:text-sage-300">{format(new Date(), 'MMMM yyyy')}</p>
            </div>
            <div className={`text-5xl font-black ${
              grade?.color === 'forest' ? 'text-forest-600' :
              grade?.color === 'sage' ? 'text-sage-600' :
              grade?.color === 'earth' ? 'text-earth-600' : 'text-red-500'
            }`}>
              {grade?.grade ?? '—'}
            </div>
          </div>

          {footprint ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-sage-50 dark:bg-forest-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-forest-900 dark:text-cream">{formatTonnes(footprint.total)}</div>
                  <p className="text-xs text-sage-500">Annual</p>
                </div>
                <div className="bg-forest-50 dark:bg-forest-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-forest-700 dark:text-forest-300">{formatTonnes(totalSaved)}</div>
                  <p className="text-xs text-sage-500">Saved</p>
                </div>
                <div className="bg-earth-50 dark:bg-earth-900/30 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-earth-700 dark:text-earth-300">{streak.currentDays}</div>
                  <p className="text-xs text-sage-500">Day streak</p>
                </div>
              </div>

              <div className="bg-forest-50 dark:bg-forest-800 rounded-xl p-3 text-sm text-forest-700 dark:text-forest-200">
                {grade?.color === 'forest'
                  ? `You're ${Math.abs(((kgToTonnes(footprint.total) - AVERAGES.global) / AVERAGES.global) * 100).toFixed(0)}% below the global average. You're an inspiration.`
                  : `You're ${((kgToTonnes(footprint.total) - AVERAGES.global) / AVERAGES.global * 100).toFixed(0)}% above the global average. Small changes this month can move your grade up.`
                }
              </div>
            </>
          ) : (
            <p className="text-sm text-sage-600 dark:text-sage-400" role="status">
              Complete your assessment to see your monthly carbon report.
            </p>
          )}
        </div>
      </motion.div>

      {/* Weekly AI Report */}
      {footprint && (
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
              onClick={handleGenerateReport}
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
      )}

      {totalSaved > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-4"
        >
          <h2 className="text-sm font-semibold text-forest-800 dark:text-cream mb-3">Your savings in perspective</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-forest-50 dark:bg-forest-800 rounded-xl p-3">
              <div className="text-2xl mb-1">🌳</div>
              <div className="text-xl font-bold text-forest-700 dark:text-forest-300">{treesEquivalent}</div>
              <p className="text-xs text-sage-600">trees worth of CO₂ absorbed per year</p>
            </div>
            <div className="bg-earth-50 dark:bg-earth-900/30 rounded-xl p-3">
              <div className="text-2xl mb-1">🚗</div>
              <div className="text-xl font-bold text-earth-700 dark:text-earth-300">{milesEquivalent.toLocaleString()}</div>
              <p className="text-xs text-sage-600">miles not driven in a petrol car</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="card mb-4" role="status">
          <p className="text-sm text-sage-600 dark:text-sage-400">
            Log actions in the Action Hub to see your savings in real-world terms.
          </p>
        </div>
      )}

      {chartData.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card mb-4"
        >
          <h2 className="text-sm font-semibold text-forest-800 dark:text-cream mb-3">CO₂ Saved by Month (kg)</h2>
          <div className="h-36" role="img" aria-label={chartAriaLabel}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ede8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#548257' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#548257' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0)} kg CO₂`, 'Saved']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #dce8dc', fontSize: '12px' }}
                />
                <Bar dataKey="saved" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? '#3a8c42' : '#8ec692'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      ) : (
        <div className="card mb-4" role="status">
          <p className="text-sm text-sage-600 dark:text-sage-400">
            No monthly trend data yet. Keep logging actions to build your chart.
          </p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-forest-800 dark:text-cream">
            Badges
            <span className="ml-2 text-sage-400 font-normal">{earnedBadges.length}/{badges.length}</span>
          </h2>
          <Award className="w-4 h-4 text-earth-500" aria-hidden="true" />
        </div>

        {earnedBadges.length > 0 ? (
          <div className="mb-3">
            <p className="text-xs text-forest-600 font-medium mb-2">Earned</p>
            <div className="grid grid-cols-2 gap-2">
              {earnedBadges.map((b) => (
                <motion.div
                  key={b.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="card flex items-center gap-3 py-3"
                >
                  <div className="text-2xl" aria-hidden="true">{b.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-forest-800 dark:text-cream">{b.title}</p>
                    <p className="text-xs text-sage-500">{b.description}</p>
                    {b.earnedDate && (
                      <p className="text-xs text-forest-500 mt-0.5">
                        {format(parseISO(b.earnedDate), 'MMM d')}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-sage-600 dark:text-sage-400 mb-3" role="status">
            No badges earned yet. Log activities and complete actions to unlock badges.
          </p>
        )}

        {unearnedBadges.length > 0 && (
          <div>
            <p className="text-xs text-sage-500 font-medium mb-2">Locked</p>
            <div className="grid grid-cols-2 gap-2">
              {unearnedBadges.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-sage-50 dark:bg-forest-800 rounded-xl opacity-60">
                  <div className="text-2xl grayscale" aria-hidden="true">{b.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-sage-700 dark:text-sage-300">{b.title}</p>
                    <p className="text-xs text-sage-500">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-forest-600 rounded-2xl p-4 text-white"
      >
        <div className="flex items-start gap-3">
          <Share2 className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold mb-1">Share your progress</p>
            <p className="text-xs opacity-80 mb-3">
              Inspire others! You've saved {formatTonnes(totalSaved)} CO₂ and earned {earnedBadges.length} badges.
            </p>
            <button
              onClick={handleCopy}
              className="bg-white text-forest-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-forest-50 transition-all focus-visible:ring-2 focus-visible:ring-white"
            >
              Copy milestone text
            </button>
            {copyStatus && (
              <p className="text-xs mt-2 opacity-90" role="status" aria-live="polite">
                {copyStatus}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
