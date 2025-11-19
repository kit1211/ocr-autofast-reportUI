'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { UserAgentData } from '@/types/analytics';
import { formatNumber, getStatusColor, truncateText } from '@/lib/utils';
import { useState } from 'react';

interface UserAgentTableProps {
  data: UserAgentData[];
  loading?: boolean;
}

export function UserAgentTable({ data, loading }: UserAgentTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Agent Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Agent Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Agent Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b">
                <th className="text-left p-2 font-medium">#</th>
                <th className="text-left p-2 font-medium">User Agent</th>
                <th className="text-center p-2 font-medium">Method</th>
                <th className="text-center p-2 font-medium">Status</th>
                <th className="text-right p-2 font-medium">Requests</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const isExpanded = expandedRows.has(index);
                const displayUserAgent = isExpanded 
                  ? item.userAgent 
                  : truncateText(item.userAgent, 50);

                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-500">{index + 1}</td>
                    <td 
                      className="p-2 font-mono text-xs cursor-pointer hover:text-blue-600"
                      onClick={() => toggleRow(index)}
                      title={item.userAgent}
                    >
                      {displayUserAgent}
                      {item.userAgent.length > 50 && (
                        <span className="text-blue-500 ml-1">
                          {isExpanded ? '[-]' : '[+]'}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        {item.method}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.statusCode)}`}>
                        {item.statusCode}
                      </span>
                    </td>
                    <td className="p-2 text-right font-semibold">
                      {formatNumber(item.requestCount)}
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

