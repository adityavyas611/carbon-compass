import { format } from 'date-fns';
import type { ActivityLog } from '@/types';
import LogEntry from '@/components/tracker/LogEntry';

interface Props {
  todayLogs: ActivityLog[];
  onOpenModal: () => void;
}

export default function TodayActivitySection({ todayLogs, onOpenModal }: Props) {
  return (
    <section aria-labelledby="today-heading" className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 id="today-heading" className="text-sm font-semibold text-forest-800 dark:text-cream">
          Today
        </h2>
        <span className="text-xs text-sage-400 dark:text-sage-500">{format(new Date(), 'MMM d')}</span>
      </div>
      {todayLogs.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-3xl mb-2" aria-hidden="true">
            📝
          </p>
          <p className="text-sm text-sage-600 dark:text-sage-400 mb-3">Nothing logged yet today</p>
          <button onClick={onOpenModal} className="btn-secondary text-sm py-2 px-4">
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
    </section>
  );
}
