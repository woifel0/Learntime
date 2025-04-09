import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

interface CategoryStats {
  id: number;
  name: string;
  color: string;
  icon: string;
  totalTime: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  isLoading: boolean;
  categories: CategoryStats[];
}

export default function CategoryBreakdown({ isLoading, categories }: CategoryBreakdownProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-medium mb-4">Category Breakdown</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-zinc-500 text-sm">
            No data available. Start tracking your learning time to see category breakdown.
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Link href={`/category/${category.id}`} className="flex items-center hover:text-primary transition-colors">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color || '#6D28D9' }}
                    ></div>
                    <span>{category.name}</span>
                  </Link>
                  <span className="text-zinc-400 text-sm">{category.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: category.color || '#6D28D9'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
