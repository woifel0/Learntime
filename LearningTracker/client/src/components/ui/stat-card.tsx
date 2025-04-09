import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface ChangeData {
  value: number;
  type: 'increase' | 'decrease';
  comparedTo?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: ChangeData;
}

export default function StatCard({ title, value, change }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-zinc-400 text-sm mb-1">{title}</h3>
        <div className="text-2xl font-semibold">{value}</div>
        
        {change && (
          <div className="text-zinc-500 text-xs mt-1 flex items-center">
            {change.type === 'increase' ? (
              <>
                <ArrowUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">{change.value}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3 h-3 text-red-500" />
                <span className="text-red-500">{change.value}</span>
              </>
            )}
            {change.comparedTo && <span className="ml-1">vs. {change.comparedTo}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
