import type { ActivityLog } from '@/types';
import { TYPE_META } from '@/components/tracker/activityPresets';

interface LogEntryProps {
  log: ActivityLog;
}

export default function LogEntry({ log }: LogEntryProps) {
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
