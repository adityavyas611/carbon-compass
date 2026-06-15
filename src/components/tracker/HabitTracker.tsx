import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import type { ActivityLog, ActivityType } from '@/types';
import { Plus, X, Flame } from 'lucide-react';
import { format, startOfWeek, eachDayOfInterval, endOfWeek, parseISO, isToday, isYesterday } from 'date-fns';

const ACTIVITY_PRESETS: Record<ActivityType, { label: string; emoji: string; co2Kg: number }[]> = {
  meal: [
    { label: 'Plant-based meal', emoji: '🥗', co2Kg: -0.5 },
    { label: 'Chicken dish', emoji: '🍗', co2Kg: 1.1 },
    { label: 'Beef meal', emoji: '🥩', co2Kg: 3.6 },
    { label: 'Fish dish', emoji: '🐟', co2Kg: 0.9 },
    { label: 'Vegan meal', emoji: '🌱', co2Kg: 0.3 },
  ],
  commute: [
    { label: 'Drove alone (car)', emoji: '🚗', co2Kg: 4.2 },
    { label: 'Carpooled', emoji: '🚙', co2Kg: 2.1 },
    { label: 'Public transit', emoji: '🚌', co2Kg: 1.2 },
    { label: 'Biked / Walked', emoji: '🚲', co2Kg: 0 },
    { label: 'Worked from home', emoji: '🏠', co2Kg: 0 },
  ],
  purchase: [
    { label: 'New clothing item', emoji: '👕', co2Kg: 15 },
    { label: 'Secondhand item', emoji: '♻️', co2Kg: 4.5 },
    { label: 'Electronics', emoji: '💻', co2Kg: 300 },
    { label: 'Online delivery', emoji: '📦', co2Kg: 4.5 },
    { label: 'Farmers market', emoji: '🌾', co2Kg: -1 },
  ],
  energy: [
    { label: 'Thermostat -2°C', emoji: '🌡️', co2Kg: -0.8 },
    { label: 'Air dried laundry', emoji: '🧺', co2Kg: -0.5 },
    { label: 'Cold wash cycle', emoji: '❄️', co2Kg: -0.4 },
    { label: 'Extra heating used', emoji: '🔥', co2Kg: 2.5 },
    { label: 'Turned off standby', emoji: '💡', co2Kg: -0.1 },
  ],
};

const TYPE_META = {
  meal: { label: 'Meal', emoji: '🍽️', color: 'bg-green-100 text-green-700' },
  commute: { label: 'Commute', emoji: '🚌', color: 'bg-forest-100 text-forest-700' },
  purchase: { label: 'Purchase', emoji: '🛍️', color: 'bg-blue-100 text-blue-700' },
  energy: { label: 'Energy', emoji: '⚡', color: 'bg-earth-100 text-earth-700' },
};

export default function HabitTracker() {
  const { activityLogs, streak, logActivity } = useCarbonStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>('meal');
  const [selectedPreset, setSelectedPreset] = useState<(typeof ACTIVITY_PRESETS)['meal'][0] | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [lastAdded, setLastAdded] = useState('');

  const openButtonRef = useRef<HTMLButtonElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(new Date(), { weekStartsOn: 1 }) });

  const todayLogs = activityLogs.filter((l) => l.date === today);
  const weekLogs = activityLogs.filter((l) => {
    const d = new Date(l.date);
    return d >= weekStart;
  });

  const weekSaved = weekLogs.filter((l) => l.co2Kg <= 0).reduce((s, l) => s + Math.abs(l.co2Kg), 0);
  const weekEmitted = weekLogs.filter((l) => l.co2Kg > 0).reduce((s, l) => s + l.co2Kg, 0);

  const logsWithDates = activityLogs.map((l) => l.date);
  const hasLoggedDay = (d: Date) => logsWithDates.includes(format(d, 'yyyy-MM-dd'));

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setSelectedPreset(null);
    setCustomNote('');
    setTimeout(() => openButtonRef.current?.focus(), 50);
  }, []);

  // Focus trap for modal
  useEffect(() => {
    if (!showAddModal) return;
    setTimeout(() => modalCloseRef.current?.focus(), 50);
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, closeModal]);

  const handleAdd = () => {
    if (!selectedPreset) return;
    logActivity({
      date: today,
      type: selectedType,
      label: selectedPreset.label,
      co2Kg: selectedPreset.co2Kg,
      note: customNote.trim() || undefined,
    });
    setLastAdded(
      `Logged: ${selectedPreset.label} — ${selectedPreset.co2Kg <= 0 ? `saved ${Math.abs(selectedPreset.co2Kg)} kg` : `emitted ${selectedPreset.co2Kg} kg`} CO₂`
    );
    closeModal();
  };

  const groupByDate = (logs: ActivityLog[]) => {
    const groups: Record<string, ActivityLog[]> = {};
    for (const log of logs) {
      if (!groups[log.date]) groups[log.date] = [];
      groups[log.date].push(log);
    }
    return groups;
  };

  const recentGroups = groupByDate(activityLogs.slice(0, 30));
  const sortedDates = Object.keys(recentGroups).sort((a, b) => b.localeCompare(a)).slice(0, 7);

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      {/* Announcement for screen readers when an activity is added */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {lastAdded}
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-900 dark:text-cream mb-0.5">Daily Tracker</h1>
          <p className="text-sm text-sage-600 dark:text-sage-400">Log what you do, see the impact.</p>
        </div>
        <button
          ref={openButtonRef}
          onClick={() => setShowAddModal(true)}
          aria-label="Log a new activity"
          className="btn-primary flex items-center gap-2 py-2.5 px-4"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Log
        </button>
      </motion.div>

      {/* Streak + week stats */}
      <motion.section
        aria-labelledby="streak-heading"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-earth-500" aria-hidden="true" />
            <h2 id="streak-heading" className="text-sm font-semibold text-forest-800 dark:text-cream">
              {streak.currentDays} day streak
            </h2>
          </div>
          <span className="text-xs text-sage-500 dark:text-sage-400">Best: {streak.longestDays} days</span>
        </div>
        {/* Week calendar */}
        <div className="grid grid-cols-7 gap-1" role="list" aria-label="This week's logging activity">
          {weekDays.map((d) => {
            const logged = hasLoggedDay(d);
            const isPast = d <= new Date();
            const dayLabel = format(d, 'EEE');
            return (
              <div key={d.toISOString()} className="text-center" role="listitem">
                <div className="text-xs text-sage-400 mb-1" aria-hidden="true">{dayLabel[0]}</div>
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    logged
                      ? 'bg-forest-500 text-white'
                      : isToday(d)
                      ? 'border-2 border-forest-400 text-forest-600'
                      : isPast
                      ? 'bg-sage-100 text-sage-400 dark:bg-forest-800 dark:text-sage-500'
                      : 'text-sage-300 dark:text-sage-600'
                  }`}
                  aria-label={`${dayLabel} ${format(d, 'd')}${logged ? ', logged' : isToday(d) ? ', today' : ''}`}
                >
                  {format(d, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Week summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <div className="card text-center">
          <div className="text-2xl font-bold text-forest-600 mb-0.5" aria-label={`${weekSaved.toFixed(1)} kilograms CO₂ saved this week`}>
            {weekSaved.toFixed(1)} kg
          </div>
          <p className="text-xs text-sage-500 dark:text-sage-400">CO₂ saved this week</p>
          <p className="text-xs text-forest-500 mt-1">
            ≈ {Math.round(weekSaved / 0.21)} km not driven
          </p>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-earth-600 mb-0.5" aria-label={`${weekEmitted.toFixed(1)} kilograms CO₂ emitted this week`}>
            {weekEmitted.toFixed(1)} kg
          </div>
          <p className="text-xs text-sage-500 dark:text-sage-400">CO₂ emitted this week</p>
          <p className="text-xs text-sage-400 dark:text-sage-500 mt-1">{weekLogs.length} activities logged</p>
        </div>
      </motion.div>

      {/* Today's log */}
      <motion.section
        aria-labelledby="today-heading"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 id="today-heading" className="text-sm font-semibold text-forest-800 dark:text-cream">Today</h2>
          <span className="text-xs text-sage-400 dark:text-sage-500">{format(new Date(), 'MMM d')}</span>
        </div>
        {todayLogs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2" aria-hidden="true">📝</p>
            <p className="text-sm text-sage-600 dark:text-sage-400 mb-3">Nothing logged yet today</p>
            <button onClick={() => setShowAddModal(true)} className="btn-secondary text-sm py-2 px-4">
              Log your first activity
            </button>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Today's logged activities">
            {todayLogs.map((log) => (
              <li key={log.id}>
                <LogEntry log={log} />
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      {/* Recent history */}
      {sortedDates.filter((d) => d !== today).length > 0 && (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-sm font-semibold text-forest-800 dark:text-cream mb-3">Recent History</h2>
          <div className="space-y-4">
            {sortedDates
              .filter((d) => d !== today)
              .map((date) => {
                const logs = recentGroups[date];
                const dateLabel = isYesterday(parseISO(date))
                  ? 'Yesterday'
                  : format(parseISO(date), 'EEE, MMM d');
                return (
                  <div key={date}>
                    <p className="text-xs font-medium text-sage-500 mb-2">{dateLabel}</p>
                    <ul className="space-y-2" aria-label={`Activities on ${dateLabel}`}>
                      {logs.map((log) => (
                        <li key={log.id}>
                          <LogEntry log={log} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
            aria-hidden="true"
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-activity-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-forest-900 rounded-t-3xl w-full max-w-lg px-4 pt-4 pb-10 max-h-[85vh] overflow-y-auto"
              aria-hidden="false"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="add-activity-title" className="text-lg font-bold text-forest-900 dark:text-cream">
                  Log an Activity
                </h3>
                <button
                  ref={modalCloseRef}
                  onClick={closeModal}
                  aria-label="Close activity log"
                  className="w-8 h-8 rounded-full bg-sage-100 dark:bg-forest-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-sage-600" aria-hidden="true" />
                </button>
              </div>

              {/* Type selector */}
              <fieldset className="mb-4">
                <legend className="text-xs font-semibold text-forest-700 dark:text-cream mb-2">Category</legend>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(TYPE_META) as ActivityType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedType(t);
                        setSelectedPreset(null);
                      }}
                      aria-pressed={selectedType === t}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                        selectedType === t
                          ? 'border-forest-500 bg-forest-50'
                          : 'border-sage-200 hover:border-sage-300'
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">{TYPE_META[t].emoji}</span>
                      <span className="text-xs font-medium text-forest-800">{TYPE_META[t].label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Presets */}
              <fieldset className="space-y-2 mb-4">
                <legend className="text-xs font-semibold text-forest-700 mb-2">Quick select</legend>
                {ACTIVITY_PRESETS[selectedType].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setSelectedPreset(p)}
                    aria-pressed={selectedPreset?.label === p.label}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      selectedPreset?.label === p.label
                        ? 'border-forest-500 bg-forest-50'
                        : 'border-sage-200 hover:border-sage-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm text-forest-900">
                      <span aria-hidden="true">{p.emoji}</span> {p.label}
                    </span>
                    <span
                      className={`text-xs font-semibold ${p.co2Kg <= 0 ? 'text-forest-600' : 'text-earth-600'}`}
                      aria-label={`${p.co2Kg <= 0 ? 'saves' : 'emits'} ${Math.abs(p.co2Kg).toFixed(1)} kg CO₂`}
                    >
                      {p.co2Kg <= 0 ? `−${Math.abs(p.co2Kg).toFixed(1)} kg` : `+${p.co2Kg.toFixed(1)} kg`}
                    </span>
                  </button>
                ))}
              </fieldset>

              {/* Note */}
              <label htmlFor="activity-note" className="sr-only">
                Optional note
              </label>
              <input
                id="activity-note"
                type="text"
                placeholder="Optional note…"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                maxLength={500}
                className="input-base mb-4"
              />

              <button
                onClick={handleAdd}
                disabled={!selectedPreset}
                aria-disabled={!selectedPreset}
                className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogEntry({ log }: { log: ActivityLog }) {
  const meta = TYPE_META[log.type];
  return (
    <div className="flex items-center justify-between bg-white dark:bg-forest-900 border border-sage-100 dark:border-forest-800 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="text-lg" aria-hidden="true">{meta.emoji}</span>
        <div>
          <p className="text-sm font-medium text-forest-900 dark:text-cream">{log.label}</p>
          {log.note && <p className="text-xs text-sage-500 dark:text-sage-400">{log.note}</p>}
        </div>
      </div>
      <span
        className={`text-sm font-semibold ${log.co2Kg <= 0 ? 'text-forest-600' : 'text-earth-600'}`}
        aria-label={`${log.co2Kg <= 0 ? 'saved' : 'emitted'} ${Math.abs(log.co2Kg).toFixed(1)} kg CO₂`}
      >
        {log.co2Kg <= 0 ? `−${Math.abs(log.co2Kg).toFixed(1)}` : `+${log.co2Kg.toFixed(1)}`} kg
      </span>
    </div>
  );
}
