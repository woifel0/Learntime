import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import TimerWidget from '@/components/ui/timer-widget';
import StatCard from '@/components/ui/stat-card';
import TimeRangeSelector from '@/components/ui/time-range-selector';
import ProgressChart from '@/components/ui/progress-chart';
import CategoryBreakdown from '@/components/ui/category-breakdown';
import RecentActivities from '@/components/ui/recent-activities';
import ActivitiesTable from '@/components/ui/activities-table';
import { useTimeRange } from '@/hooks/use-time-range';

export default function Dashboard() {
  const { timeRange, setTimeRange } = useTimeRange();
  
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/stats', timeRange],
    queryFn: async ({ queryKey }) => {
      const [path, range] = queryKey;
      return await fetch(`${path}?timeRange=${range}`).then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      });
    }
  });

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['/api/activities'],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const isLoading = isStatsLoading || isActivitiesLoading || isCategoriesLoading;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Track and monitor your learning progress
          </p>
        </div>
        
        {/* Time Period Selector */}
        <TimeRangeSelector 
          value={timeRange} 
          onChange={setTimeRange} 
        />
      </div>
      
      {/* Timer Section */}
      <TimerWidget categories={categories || []} />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Today's Total" 
          value={isLoading ? "Loading..." : `${Math.floor(stats?.totalTime / 60)}h ${stats?.totalTime % 60}m`}
          change={{ value: 15, type: 'increase', comparedTo: 'yesterday' }}
        />
        
        <StatCard 
          title="Week Total" 
          value={isLoading ? "Loading..." : `${Math.floor((stats?.totalTime || 0) * 2.5 / 60)}h ${(stats?.totalTime || 0) * 2.5 % 60}m`}
          change={{ value: 8, type: 'increase', comparedTo: 'last week' }}
        />
        
        <StatCard 
          title="Sessions Today" 
          value={isLoading ? "Loading..." : `${stats?.sessionsCount || 0}`}
          change={{ value: 2, type: 'decrease', comparedTo: 'yesterday' }}
        />
      </div>
      
      {/* Chart Section */}
      <ProgressChart 
        isLoading={isLoading}
        dailyProgress={stats?.dailyProgress || []}
      />
      
      {/* Category Breakdown & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryBreakdown 
          isLoading={isLoading}
          categories={stats?.categories || []}
        />
        
        <RecentActivities 
          isLoading={isLoading}
          activities={stats?.recentActivities || []}
        />
      </div>
      
      {/* Learning Activities Table */}
      <ActivitiesTable 
        isLoading={isLoading}
        activities={activities || []}
        categories={categories || []}
      />
    </div>
  );
}
