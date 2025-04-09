import { Button } from '@/components/ui/button';
import { TimeRange } from '@/hooks/use-time-range';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="mt-4 md:mt-0 flex bg-zinc-900 rounded-md p-1 border border-zinc-800" role="tablist">
      <Button
        variant={value === 'day' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('day')}
        className={value === 'day' ? 'bg-primary text-white' : 'hover:bg-zinc-800 text-zinc-400'}
      >
        Day
      </Button>
      <Button
        variant={value === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('week')}
        className={value === 'week' ? 'bg-primary text-white' : 'hover:bg-zinc-800 text-zinc-400'}
      >
        Week
      </Button>
      <Button
        variant={value === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('month')}
        className={value === 'month' ? 'bg-primary text-white' : 'hover:bg-zinc-800 text-zinc-400'}
      >
        Month
      </Button>
    </div>
  );
}
