import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyProgressData {
  date: string;
  dayOfWeek: string;
  isToday: boolean;
  totalTime: number;
}

interface ProgressChartProps {
  isLoading: boolean;
  dailyProgress: DailyProgressData[];
  title?: string;
}

export default function ProgressChart({ isLoading, dailyProgress, title = "Daily Progress" }: ProgressChartProps) {
  // Find the maximum time value to normalize chart heights
  const maxTime = Math.max(...dailyProgress.map(day => day.totalTime), 60); // minimum of 60 minutes for scale
  
  // Calculate height percentage for each day
  const getHeightPercentage = (time: number) => {
    return time ? Math.max(Math.round((time / maxTime) * 100), 5) : 5; // minimum 5% height for visibility
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h2 className="text-lg font-medium mb-4">{title}</h2>
        
        {isLoading ? (
          <div className="flex items-end h-52 space-x-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="relative flex flex-col items-center flex-1">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-10 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-52">
            <div className="flex h-full items-end space-x-2">
              {dailyProgress.map((day, index) => (
                <div key={index} className="relative flex flex-col items-center flex-1">
                  <div 
                    className={`w-full rounded-t-sm hover:opacity-80 transition-all cursor-pointer ${day.isToday ? 'bg-primary' : 'bg-primary/20'}`}
                    style={{ height: `${getHeightPercentage(day.totalTime)}%` }}
                    title={`${Math.floor(day.totalTime / 60)}h ${day.totalTime % 60}m`}
                  ></div>
                  <div className={`text-xs mt-1 ${day.isToday ? 'text-white font-medium' : 'text-zinc-500'}`}>
                    {day.dayOfWeek}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
