import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, PlayCircle, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AddActivityModal from '@/components/modals/add-activity-modal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Activity, Category } from '@shared/schema';

interface ActivitiesTableProps {
  isLoading: boolean;
  activities: Activity[];
  categories: Category[];
  showCategoryColumn?: boolean;
}

export default function ActivitiesTable({ 
  isLoading, 
  activities, 
  categories,
  showCategoryColumn = true 
}: ActivitiesTableProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  
  // Start a new time entry for an activity
  const startTimerMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const payload = {
        activityId,
        startTime: new Date(),
        active: true
      };
      
      const response = await apiRequest("POST", "/api/time-entries", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries/active'] });
      toast({
        title: "Timer Started",
        description: "Your learning time is now being tracked"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to start timer: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Get category details for an activity
  const getCategoryDetails = (categoryId: number) => {
    return categories.find(category => category.id === categoryId);
  };
  
  // Handle start timer button
  const handleStartTimer = (activityId: number) => {
    startTimerMutation.mutate(activityId);
  };
  
  return (
    <Card className="mb-6">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">All Learning Activities</h2>
          
          <Dialog open={isAddActivityModalOpen} onOpenChange={setIsAddActivityModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center">
                <Plus className="mr-1 h-4 w-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AddActivityModal 
                onSuccess={() => {
                  setIsAddActivityModalOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-zinc-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-medium">Activity</th>
              {showCategoryColumn && (
                <th className="px-4 py-3 text-left font-medium">Category</th>
              )}
              <th className="px-4 py-3 text-left font-medium">Total Time</th>
              <th className="px-4 py-3 text-left font-medium">Last Session</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="hover:bg-zinc-900/80 transition-all">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  {showCategoryColumn && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={showCategoryColumn ? 5 : 4} className="px-4 py-6 text-center text-zinc-500">
                  No activities found. Create your first activity to start tracking time.
                </td>
              </tr>
            ) : (
              activities.map((activity) => {
                const category = getCategoryDetails(activity.categoryId);
                return (
                  <tr key={activity.id} className="hover:bg-zinc-900/80 cursor-pointer transition-all">
                    <td className="px-4 py-3 whitespace-nowrap">{activity.name}</td>
                    
                    {showCategoryColumn && category && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `color-mix(in srgb, ${category.color || '#6D28D9'} 10%, transparent)`,
                            color: category.color || '#6D28D9'
                          }}
                        >
                          {category.name}
                        </span>
                      </td>
                    )}
                    
                    <td className="px-4 py-3 whitespace-nowrap">0h 0m</td>
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-400 text-sm">Never</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          className="text-zinc-400 hover:text-primary transition-all"
                          onClick={() => handleStartTimer(activity.id)}
                          disabled={startTimerMutation.isPending}
                        >
                          <PlayCircle className="h-5 w-5" />
                        </button>
                        <button className="text-zinc-400 hover:text-primary transition-all">
                          <Edit className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {activities.length > 0 && (
        <div className="p-4 border-t border-zinc-800 flex justify-between items-center">
          <div className="text-zinc-400 text-sm">
            Showing <span className="font-medium">{activities.length}</span> activities
          </div>
          {/* Pagination would go here if needed */}
        </div>
      )}
    </Card>
  );
}
