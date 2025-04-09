import { useState } from 'react';

export type TimeRange = 'day' | 'week' | 'month';

export function useTimeRange(initialRange: TimeRange = 'day') {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
  
  return {
    timeRange,
    setTimeRange,
  };
}
