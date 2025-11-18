import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Coins } from 'lucide-react';

interface OcrCostCardProps {
  thbValue: number;
  usdValue: number;
  totalTokens: number;
  loading?: boolean;
}

export function OcrCostCard({ thbValue, usdValue, totalTokens, loading }: OcrCostCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">OCR Cost</CardTitle>
        <Coins className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-28 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(thbValue, 'THB')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ {formatCurrency(usdValue, 'USD')} • {formatNumber(totalTokens)} tokens
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

