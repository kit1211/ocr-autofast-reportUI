import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatBytes } from '@/lib/utils';
import { HardDrive } from 'lucide-react';

interface TotalDataCardProps {
  value: number;
  loading?: boolean;
}

export function TotalDataCard({ value, loading }: TotalDataCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Data Transferred</CardTitle>
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <>
            <div className="text-2xl font-bold">{formatBytes(value)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total request body size
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

