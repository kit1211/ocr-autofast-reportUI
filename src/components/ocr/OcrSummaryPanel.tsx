import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { OcrCostSummary } from '../../types/analytics';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface OcrSummaryPanelProps {
  summary: OcrCostSummary | null;
  loading?: boolean;
}

export function OcrSummaryPanel({ summary, loading }: OcrSummaryPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">OCR Usage Summary</CardTitle>
          <p className="text-sm text-gray-500">
            รวมตามช่วงเวลาที่เลือก อ้างอิงราคา OpenRouter (Gemini 2.5 Flash)
          </p>
        </div>
        {summary && !loading && (
          <span className="text-xs text-gray-500">
            Exchange rate {summary.exchangeRate.toFixed(2)} THB/USD
          </span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-8 w-32 bg-gray-100 animate-pulse rounded" />
                <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalThb, 'THB')}
                </p>
                <p className="text-sm text-gray-500">
                  ≈ {formatCurrency(summary.totalUsd, 'USD')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Input Tokens</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(summary.totalInputTokens)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(summary.inputRatePerMillion, 'USD', 'en-US')} / 1M
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Output Tokens</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(summary.totalOutputTokens)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(summary.outputRatePerMillion, 'USD', 'en-US')} / 1M
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 py-6">
            ไม่พบข้อมูล OCR ในช่วงเวลานี้
          </div>
        )}
      </CardContent>
    </Card>
  );
}

