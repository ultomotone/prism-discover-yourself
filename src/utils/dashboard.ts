import { addDays } from 'date-fns';

export type DailyCompletion = {
  date: string; // ISO date string YYYY-MM-DD
  value: number;
};

export type AggregatedPoint = {
  x: string;
  y: number;
};

export type AggregateMode = 'day' | 'week' | 'month';

/**
 * Aggregate daily completion counts into day/week/month buckets.
 * Input dates must be ISO YYYY-MM-DD in UTC.
 */
export const aggregateCompletions = (
  daily: DailyCompletion[],
  mode: AggregateMode,
): AggregatedPoint[] => {
  if (mode === 'day') {
    return daily.map((d) => ({ x: d.date, y: d.value }));
  }
  const map = new Map<string, number>();
  for (const d of daily) {
    const dt = new Date(d.date + 'T00:00:00Z');
    let key: string;
    if (mode === 'week') {
      const day = dt.getUTCDay();
      const diff = (day + 6) % 7; // ISO week starts Monday
      const monday = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() - diff));
      key = monday.toISOString().slice(0, 10);
    } else {
      key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-01`;
    }
    map.set(key, (map.get(key) || 0) + d.value);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([x, y]) => ({ x, y }));
};
