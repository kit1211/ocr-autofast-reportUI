'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { UserAgentComparison } from '@/types/analytics';
import { formatNumber, formatResponseTime } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface UserAgentComparisonTableProps {
  data: UserAgentComparison | null;
  loading?: boolean;
}

type SortField = 'userAgent' | 'totalRequests' | 'successRate' | 'errorRate' | 'avgResponseTime';
type SortDirection = 'asc' | 'desc';

export function UserAgentComparisonTable({ data, loading }: UserAgentComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalRequests');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ตารางเปรียบเทียบ User Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ตารางเปรียบเทียบ User Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500">
            เลือก User Agent เพื่อเปรียบเทียบ
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine primary and others for table
  const allAgents = [data.primary, ...data.others];

  // Sort function
  const sortedAgents = [...allAgents].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'userAgent') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown 
      className={`h-3 w-3 inline ml-1 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`} 
    />
  );

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorRateColor = (rate: number) => {
    if (rate < 5) return 'text-green-600';
    if (rate < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeColor = (time: number) => {
    if (time < 500) return 'text-green-600';
    if (time < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ตารางเปรียบเทียบ User Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="text-left p-3 font-medium">#</th>
                <th 
                  className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('userAgent')}
                >
                  User Agent <SortIcon field="userAgent" />
                </th>
                <th 
                  className="text-right p-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalRequests')}
                >
                  Total Requests <SortIcon field="totalRequests" />
                </th>
                <th className="text-right p-3 font-medium">Success</th>
                <th className="text-right p-3 font-medium">Error</th>
                <th 
                  className="text-right p-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('successRate')}
                >
                  Success Rate <SortIcon field="successRate" />
                </th>
                <th 
                  className="text-right p-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('errorRate')}
                >
                  Error Rate <SortIcon field="errorRate" />
                </th>
                <th 
                  className="text-right p-3 font-medium cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('avgResponseTime')}
                >
                  Avg Time <SortIcon field="avgResponseTime" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAgents.map((agent, index) => {
                const isPrimary = agent.userAgent === data.primary.userAgent;
                return (
                  <tr 
                    key={index} 
                    className={`border-b hover:bg-gray-50 ${isPrimary ? 'bg-blue-50 font-semibold' : ''}`}
                  >
                    <td className="p-3 text-gray-500">{index + 1}</td>
                    <td className="p-3 font-mono text-xs break-all">
                      {agent.userAgent}
                      {isPrimary && <span className="ml-2 text-blue-600 text-xs">(หลัก)</span>}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatNumber(agent.totalRequests)}
                    </td>
                    <td className="p-3 text-right text-green-600">
                      {formatNumber(agent.successCount)}
                    </td>
                    <td className="p-3 text-right text-red-600">
                      {formatNumber(agent.errorCount)}
                    </td>
                    <td className={`p-3 text-right font-semibold ${getSuccessRateColor(agent.successRate)}`}>
                      {agent.successRate.toFixed(2)}%
                    </td>
                    <td className={`p-3 text-right font-semibold ${getErrorRateColor(agent.errorRate)}`}>
                      {agent.errorRate.toFixed(2)}%
                    </td>
                    <td className={`p-3 text-right ${getTimeColor(agent.avgResponseTime)}`}>
                      {formatResponseTime(agent.avgResponseTime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

