import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface RecentActivity {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalTime: number;
  lastSession: string;
}

interface RecentActivitiesProps {
  isLoading: boolean;
  activities: RecentActivity[];
}

export default function RecentActivities({ isLoading, activities }: RecentActivitiesProps) {
  // Format time as "Xh Ym"
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-medium mb-4">Recent Activities</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center border-b border-zinc-800 pb-3 last:border-0">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-zinc-500 text-sm">
            No recent activities. Start tracking your learning time to see your recent activities.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center border-b border-zinc-800 pb-3 last:border-0">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: `color-mix(in srgb, ${activity.categoryColor || '#6D28D9'} 20%, transparent)` }}
                  >
                    <i className={activity.categoryIcon || 'ri-book-line'} style={{ color: activity.categoryColor }}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>{activity.name}</div>
                      <div className="text-zinc-400 text-sm">{formatTime(activity.totalTime)}</div>
                    </div>
                    <div className="text-zinc-500 text-xs">
                      {activity.categoryName} • {formatDistanceToNow(new Date(activity.lastSession), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4 text-zinc-400 hover:text-white border-zinc-800 hover:border-primary transition-all">
              <Link href="/">View All Activities</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
