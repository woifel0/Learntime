import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { useTimeRange } from '@/hooks/use-time-range';
import TimeRangeSelector from '@/components/ui/time-range-selector';
import ActivitiesTable from '@/components/ui/activities-table';
import ProgressChart from '@/components/ui/progress-chart';
import StatCard from '@/components/ui/stat-card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AddActivityModal from '@/components/modals/add-activity-modal';

export default function Category() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { timeRange, setTimeRange } = useTimeRange();
  
  const categoryId = parseInt(id);
  
  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: [`/api/categories/${categoryId}`],
  });

  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: [`/api/activities?categoryId=${categoryId}`],
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/stats', timeRange],
  });

  const isLoading = isCategoryLoading || isActivitiesLoading || isStatsLoading;
  
  // Find the category stats from the overall stats
  const categoryStats = stats?.categories?.find(cat => cat.id === categoryId);
  
  // Daily progress filtered by this category's activities
  const activityIds = activities?.map(activity => activity.id) || [];
  
  // Get icon from category
  const getIconClass = () => {
    return category?.icon || 'ri-folder-line';
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 pl-0" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full bg-${category?.color || 'primary'}/20 flex items-center justify-center mr-3`}>
              <i className={getIconClass()}></i>
            </div>
            <h1 className="text-2xl font-bold">{isLoading ? "Loading..." : category?.name}</h1>
          </div>
        </div>
        
        {/* Time Period Selector */}
        <div className="mt-4 md:mt-0 flex items-center">
          <TimeRangeSelector 
            value={timeRange} 
            onChange={setTimeRange} 
          />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="ml-4">
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AddActivityModal 
                defaultCategoryId={categoryId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Time" 
          value={isLoading ? "Loading..." : `${Math.floor((categoryStats?.totalTime || 0) / 60)}h ${(categoryStats?.totalTime || 0) % 60}m`}
        />
        
        <StatCard 
          title="Activities" 
          value={isLoading ? "Loading..." : `${activities?.length || 0}`}
        />
        
        <StatCard 
          title="Percentage of Total" 
          value={isLoading ? "Loading..." : `${categoryStats?.percentage || 0}%`}
        />
      </div>
      
      {/* Chart Section */}
      <ProgressChart 
        isLoading={isLoading}
        dailyProgress={stats?.dailyProgress || []}
        title={`${category?.name || 'Category'} Progress`}
      />
      
      {/* Activities Table */}
      <ActivitiesTable 
        isLoading={isLoading}
        activities={activities || []}
        categories={[category].filter(Boolean)}
        showCategoryColumn={false}
      />
    </div>
  );
}
