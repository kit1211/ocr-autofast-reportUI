'use client';

import { useState } from 'react';
import { UserAgentSelector } from './UserAgentSelector';
import { UserAgentComparisonBarChart } from './charts/UserAgentComparisonBarChart';
import { UserAgentComparisonPieChart } from './charts/UserAgentComparisonPieChart';
import { UserAgentComparisonTable } from './tables/UserAgentComparisonTable';
import { fetchUserAgentComparison } from '@/lib/api-client';
import type { UserAgentData, UserAgentComparison as UserAgentComparisonType } from '@/types/analytics';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface UserAgentComparisonProps {
  dateRange: { type: 'days' | 'custom'; days?: number; startDate?: string; endDate?: string };
  availableUserAgents: UserAgentData[];
  loading?: boolean;
}

export function UserAgentComparison({ dateRange, availableUserAgents, loading: parentLoading }: UserAgentComparisonProps) {
  const [comparisonData, setComparisonData] = useState<UserAgentComparisonType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCompare = async (primaryAgent: string, groupOthers: boolean, limit: number) => {
    try {
      setLoading(true);
      setError(null);
      setIsExpanded(true);

      const data = await fetchUserAgentComparison(dateRange, primaryAgent, groupOthers, limit);
      setComparisonData(data);
    } catch (err) {
      console.error('Error loading comparison:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comparison data');
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Selector */}
      <UserAgentSelector
        availableUserAgents={availableUserAgents}
        onCompare={handleCompare}
        loading={parentLoading || loading}
      />

      {/* Toggle Expansion */}
      {comparisonData && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-white rounded-lg shadow p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">
              ผลการเปรียบเทียบ: {comparisonData.primary.userAgent}
            </span>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Comparison Results */}
      {isExpanded && comparisonData && (
        <div className="mt-4 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserAgentComparisonBarChart data={comparisonData} loading={loading} />
            <UserAgentComparisonPieChart data={comparisonData} loading={loading} />
          </div>

          {/* Comparison Table */}
          <UserAgentComparisonTable data={comparisonData} loading={loading} />
        </div>
      )}
    </div>
  );
}

