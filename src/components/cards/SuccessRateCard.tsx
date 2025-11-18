import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle2 } from 'lucide-react';

interface SuccessRateCardProps {
  value: number;
  loading?: boolean;
}

export function SuccessRateCard({ value, loading }: SuccessRateCardProps) {
  const getColorClass = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <>
            <div className={`text-2xl font-bold ${getColorClass(value)}`}>
              {value.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requests with 2xx status
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

