import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertActivitySchema } from '@shared/schema';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Extended schema with client-side validation
const formSchema = insertActivitySchema.extend({
  name: z.string().min(1, "Activity name is required").max(50, "Name must be 50 characters or less"),
  description: z.string().optional(),
  categoryId: z.number({
    required_error: "Please select a category",
    invalid_type_error: "Category ID must be a number"
  }),
});

interface AddActivityModalProps {
  onSuccess?: () => void;
  defaultCategoryId?: number;
}

export default function AddActivityModal({ onSuccess, defaultCategoryId }: AddActivityModalProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: defaultCategoryId || 0,
    },
  });
  
  // Fetch categories for the select input
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const createActivityMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/activities", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Activity created",
        description: "Your new learning activity has been created successfully.",
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create activity: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createActivityMutation.mutate(values);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Activity</DialogTitle>
        <DialogDescription>
          Create a new learning activity to track your progress.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., React Course" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  disabled={isCategoriesLoading}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value ? field.value.toString() : undefined}
                  defaultValue={defaultCategoryId?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description about this activity"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="submit" 
              disabled={createActivityMutation.isPending}
            >
              {createActivityMutation.isPending ? "Creating..." : "Create Activity"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
