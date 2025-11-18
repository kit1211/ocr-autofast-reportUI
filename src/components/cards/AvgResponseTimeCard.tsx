import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatResponseTime } from '../../lib/utils';
import { Zap } from 'lucide-react';

interface AvgResponseTimeCardProps {
  value: number;
  loading?: boolean;
}

export function AvgResponseTimeCard({ value, loading }: AvgResponseTimeCardProps) {
  const getColorClass = (time: number) => {
    if (time < 500) return 'text-green-600';
    if (time < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <>
            <div className={`text-2xl font-bold ${getColorClass(value)}`}>
              {formatResponseTime(value)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average API response time
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

