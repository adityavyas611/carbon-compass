import { useMemo } from 'react';
import type { ActivityLog } from '@/types';

export function useRecentLogGroups(activityLogs: ActivityLog[], maxDays = 7) {
  return useMemo(() => {
    const groups = activityLogs.slice(0, 30).reduce<Record<string, ActivityLog[]>>((acc, log) => {
      if (!acc[log.date]) acc[log.date] = [];
      acc[log.date].push(log);
      return acc;
    }, {});
    const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a)).slice(0, maxDays);
    return { groups, dates };
  }, [activityLogs, maxDays]);
}
