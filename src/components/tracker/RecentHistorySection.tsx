import { format, isYesterday, parseISO } from 'date-fns';
import type { ActivityLog } from '@/types';
import LogEntry from '@/components/tracker/LogEntry';

interface Props {
  groups: Record<string, ActivityLog[]>;
  dates: string[];
  today: string;
}

export default function RecentHistorySection({ groups, dates, today }: Props) {
  const pastDates = dates.filter((d) => d !== today);
  if (pastDates.length === 0) return null;

  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="text-sm font-semibold text-forest-800 dark:text-cream mb-3">
        Recent History
      </h2>
      <div className="space-y-4">
        {pastDates.map((date) => {
          const logs = groups[date];
          const dateLabel = isYesterday(parseISO(date)) ? 'Yesterday' : format(parseISO(date), 'EEE, MMM d');
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
  );
}
