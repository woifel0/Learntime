import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Play, Pause, Square } from 'lucide-react';
import { useTimer } from '@/hooks/use-timer';
import { Category } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface TimerWidgetProps {
  categories: Category[];
}

export default function TimerWidget({ categories }: TimerWidgetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [categoryId, setCategoryId] = useState<string>('');
  const [activityId, setActivityId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  // Get activities for selected category
  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: [`/api/activities?categoryId=${categoryId}`],
    enabled: !!categoryId,
  });
  
  // Get active time entry if exists
  const { data: activeTimeEntry, isLoading: isActiveTimeEntryLoading } = useQuery({
    queryKey: ['/api/time-entries/active'],
    refetchInterval: 5000, // Poll every 5 seconds
  });
  
  // Set up timer
  const { time, isRunning, startTimer, pauseTimer, stopTimer, setTime } = useTimer();
  
  // Start a new time entry
  const startTimeEntryMutation = useMutation({
    mutationFn: async () => {
      if (!activityId) {
        toast({
          title: t('error.generic'),
          description: t('activity.selectFirst'),
          variant: "destructive"
        });
        return null;
      }
      
      const payload = {
        activityId: parseInt(activityId),
        startTime: new Date(),
        active: true,
        note: note.trim() || undefined
      };
      
      const response = await apiRequest("POST", "/api/time-entries", payload);
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['/api/time-entries/active'] });
        startTimer();
        toast({
          title: t('timer.started'),
          description: t('timer.startedMessage')
        });
      }
    },
    onError: (error) => {
      toast({
        title: t('error.generic'),
        description: t('timer.startError', { message: error.message }),
        variant: "destructive"
      });
    }
  });
  
  // Pause current time entry
  const pauseTimeEntryMutation = useMutation({
    mutationFn: async () => {
      if (!activeTimeEntry) {
        return null;
      }
      
      // Update active time entry with current end time but keep active status
      const payload = {
        endTime: new Date(),
        active: true
      };
      
      const response = await apiRequest("PUT", `/api/time-entries/${activeTimeEntry.id}`, payload);
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['/api/time-entries/active'] });
        pauseTimer();
        toast({
          title: t('timer.paused'),
          description: t('timer.pausedMessage')
        });
      }
    },
    onError: (error) => {
      toast({
        title: t('error.generic'),
        description: t('timer.pauseError', { message: error.message }),
        variant: "destructive"
      });
    }
  });
  
  // Stop current time entry
  const stopTimeEntryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/time-entries/stop", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      stopTimer();
      setActivityId('');
      setNote('');
      toast({
        title: t('timer.stopped'),
        description: t('timer.stoppedMessage')
      });
    },
    onError: (error) => {
      toast({
        title: t('error.generic'),
        description: t('timer.stopError', { message: error.message }),
        variant: "destructive"
      });
    }
  });
  
  // Initialize form when active time entry changes
  useEffect(() => {
    if (!isActiveTimeEntryLoading && activeTimeEntry) {
      // Get activity details
      const activity = activities?.find(a => a.id === activeTimeEntry.activityId);
      if (activity) {
        setActivityId(activity.id.toString());
        setCategoryId(activity.categoryId.toString());
        setNote(activeTimeEntry.note || '');
        
        // Calculate elapsed time if active
        if (activeTimeEntry.active) {
          const startTime = new Date(activeTimeEntry.startTime);
          const now = new Date();
          const elapsedTimeInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          setTime(elapsedTimeInSeconds);
          startTimer();
        } else {
          pauseTimer();
        }
      }
    }
  }, [activeTimeEntry, isActiveTimeEntryLoading, activities]);
  
  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  const handleActionButton = () => {
    if (!isRunning && !activeTimeEntry) {
      startTimeEntryMutation.mutate();
    } else if (isRunning) {
      pauseTimeEntryMutation.mutate();
    } else {
      startTimeEntryMutation.mutate();
    }
  };
  
  const isLoading = isActivitiesLoading || isActiveTimeEntryLoading || 
                    startTimeEntryMutation.isPending || 
                    pauseTimeEntryMutation.isPending || 
                    stopTimeEntryMutation.isPending;
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-2">{t('dashboard.currentSession')}</h2>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={!!activeTimeEntry}
              >
                <SelectTrigger className="w-[180px] bg-zinc-900">
                  <SelectValue placeholder={t("timer.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={activityId}
                onValueChange={setActivityId}
                disabled={!categoryId || !!activeTimeEntry}
              >
                <SelectTrigger className="w-[180px] bg-zinc-900">
                  <SelectValue placeholder={t("timer.selectActivity")} />
                </SelectTrigger>
                <SelectContent>
                  {activities?.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id.toString()}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Input
              placeholder={t('timer.addNote')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-zinc-900"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-4xl font-mono font-semibold tabular-nums">
              {formatTime(time)}
            </div>
            <div className="flex space-x-2 mt-3">
              {(isRunning || activeTimeEntry) && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="rounded-full" 
                  onClick={() => stopTimeEntryMutation.mutate()}
                  disabled={isLoading}
                >
                  <Square className="h-5 w-5" />
                </Button>
              )}
              <Button 
                variant="default" 
                size="icon" 
                className="rounded-full" 
                onClick={handleActionButton}
                disabled={isLoading || (!activeTimeEntry && !activityId)}
              >
                {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
