import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatNumber } from '../../lib/utils';
import { Users } from 'lucide-react';

interface ActiveTokensCardProps {
  value: number;
  loading?: boolean;
}

export function ActiveTokensCard({ value, loading }: ActiveTokensCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active API Tokens</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <>
            <div className="text-2xl font-bold">{formatNumber(value)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique API tokens used
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

