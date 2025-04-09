import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertCategorySchema } from '@shared/schema';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Extended schema with client-side validation
const formSchema = insertCategorySchema.extend({
  name: z.string().min(1, "Category name is required").max(30, "Name must be 30 characters or less"),
  icon: z.string().min(1, "Please select an icon"),
  color: z.string().min(1, "Please select a color"),
});

interface AddCategoryModalProps {
  onSuccess?: () => void;
}

export default function AddCategoryModal({ onSuccess }: AddCategoryModalProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon: "ri-folder-line",
      color: "#6D28D9",
    },
  });
  
  const createCategoryMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/categories", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Category created",
        description: "Your new category has been created successfully.",
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createCategoryMutation.mutate(values);
  };

  const iconOptions = [
    { value: "ri-code-line", label: "Code" },
    { value: "ri-book-open-line", label: "Book" },
    { value: "ri-translate-2", label: "Language" },
    { value: "ri-music-line", label: "Music" },
    { value: "ri-paint-brush-line", label: "Art" },
    { value: "ri-flask-line", label: "Science" },
    { value: "ri-calculator-line", label: "Math" },
    { value: "ri-movie-line", label: "Video" },
    { value: "ri-folder-line", label: "Other" },
  ];
  
  const colorOptions = [
    { value: "#6D28D9", label: "Purple" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Orange" },
    { value: "#3B82F6", label: "Blue" },
    { value: "#EC4899", label: "Pink" },
    { value: "#EF4444", label: "Red" },
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogDescription>
          Create a new category to organize your learning activities.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Programming" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-3 gap-2">
                    {iconOptions.map((icon) => (
                      <div
                        key={icon.value}
                        className={`flex flex-col items-center p-2 rounded-md cursor-pointer border ${
                          field.value === icon.value 
                            ? 'border-primary bg-primary/10' 
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                        onClick={() => form.setValue('icon', icon.value)}
                      >
                        <i className={`${icon.value} text-xl mb-1`}></i>
                        <span className="text-xs">{icon.label}</span>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <div
                        key={color.value}
                        className={`h-8 rounded-md cursor-pointer border-2 ${
                          field.value === color.value 
                            ? 'border-white' 
                            : 'border-transparent hover:opacity-80'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => form.setValue('color', color.value)}
                      ></div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="submit" 
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
