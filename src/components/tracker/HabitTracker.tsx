import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCarbonStore } from '@/store/carbonStore';
import type { ActivityType } from '@/types';
import { Plus } from 'lucide-react';
import { format, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';
import type { ActivityPreset } from '@/components/tracker/activityPresets';
import StreakCalendar from '@/components/tracker/StreakCalendar';
import WeeklyStatsCards from '@/components/tracker/WeeklyStatsCards';
import TodayActivitySection from '@/components/tracker/TodayActivitySection';
import RecentHistorySection from '@/components/tracker/RecentHistorySection';
import AddActivityModal from '@/components/tracker/AddActivityModal';
import { useRecentLogGroups } from '@/hooks/useRecentLogGroups';

export default function HabitTracker() {
  const { activityLogs, streak, logActivity } = useCarbonStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ActivityType>('meal');
  const [selectedPreset, setSelectedPreset] = useState<ActivityPreset | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [lastAdded, setLastAdded] = useState('');

  const openButtonRef = useRef<HTMLButtonElement>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(new Date(), { weekStartsOn: 1 }) });

  const todayLogs = activityLogs.filter((l) => l.date === today);
  const weekLogs = activityLogs.filter((l) => new Date(l.date) >= weekStart);

  const weekSaved = weekLogs.filter((l) => l.co2Kg <= 0).reduce((s, l) => s + Math.abs(l.co2Kg), 0);
  const weekEmitted = weekLogs.filter((l) => l.co2Kg > 0).reduce((s, l) => s + l.co2Kg, 0);

  const logsWithDates = activityLogs.map((l) => l.date);
  const hasLoggedDay = (d: Date) => logsWithDates.includes(format(d, 'yyyy-MM-dd'));

  const { groups: recentGroups, dates: sortedDates } = useRecentLogGroups(activityLogs);

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setSelectedPreset(null);
    setCustomNote('');
    setTimeout(() => openButtonRef.current?.focus(), 50);
  }, []);

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

  return (
    <div className="pb-24 px-4 pt-4 max-w-lg mx-auto">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {lastAdded}
      </div>

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

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <StreakCalendar streak={streak} weekDays={weekDays} hasLoggedDay={hasLoggedDay} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <WeeklyStatsCards weekSaved={weekSaved} weekEmitted={weekEmitted} weekLogCount={weekLogs.length} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <TodayActivitySection todayLogs={todayLogs} onOpenModal={() => setShowAddModal(true)} />
      </motion.div>

      <RecentHistorySection groups={recentGroups} dates={sortedDates} today={today} />

      <AddActivityModal
        open={showAddModal}
        selectedType={selectedType}
        selectedPreset={selectedPreset}
        customNote={customNote}
        onClose={closeModal}
        onTypeChange={setSelectedType}
        onPresetChange={setSelectedPreset}
        onNoteChange={setCustomNote}
        onSubmit={handleAdd}
      />
    </div>
  );
}
