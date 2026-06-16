import { format, isToday } from 'date-fns';
import { Flame } from 'lucide-react';
import type { Streak } from '@/types';

interface StreakCalendarProps {
  streak: Streak;
  weekDays: Date[];
  hasLoggedDay: (d: Date) => boolean;
}

export default function StreakCalendar({ streak, weekDays, hasLoggedDay }: StreakCalendarProps) {
  return (
    <section aria-labelledby="streak-heading" className="card mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-earth-500" aria-hidden="true" />
          <h2 id="streak-heading" className="text-sm font-semibold text-forest-800 dark:text-cream">
            {streak.currentDays} day streak
          </h2>
        </div>
        <span className="text-xs text-sage-500 dark:text-sage-400">Best: {streak.longestDays} days</span>
      </div>
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
    </section>
  );
}
