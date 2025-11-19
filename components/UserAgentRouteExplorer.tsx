'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import type { UserAgentRoute } from '@/types/analytics';
import { formatNumber, formatResponseTime, truncateText } from '@/lib/utils';

interface UserAgentRouteExplorerProps {
  availableAgents: string[];
  routes: UserAgentRoute[];
  selectedAgent: string;
  loading?: boolean;
  error?: string | null;
  onAgentChange: (agent: string) => void;
}

export function UserAgentRouteExplorer({
  availableAgents,
  routes,
  selectedAgent,
  loading,
  error,
  onAgentChange
}: UserAgentRouteExplorerProps) {
  const routeSummary = useMemo(() => {
    const total = routes.reduce(
      (acc, route) => {
        acc.requests += route.totalRequests;
        acc.success += route.successCount;
        acc.errors += route.errorCount;
        return acc;
      },
      { requests: 0, success: 0, errors: 0 }
    );
    return total;
  }, [routes]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">User Agent → Routes</CardTitle>
            <p className="text-sm text-gray-500">
              ดูว่า user agent ที่เลือกยิงไปยัง endpoint ไหนบ้างในช่วงเวลานี้
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={selectedAgent} onValueChange={onAgentChange} disabled={loading || availableAgents.length === 0}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="เลือก User Agent" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.length === 0 ? (
                  <SelectItem value="none" disabled>
                    ไม่มีข้อมูล
                  </SelectItem>
                ) : (
                  availableAgents.map(agent => (
                    <SelectItem key={agent} value={agent}>
                      {truncateText(agent, 60)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedAgent && (
              <Button variant="ghost" onClick={() => onAgentChange('')} disabled={loading}>
                ล้างค่า
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!selectedAgent ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            กรุณาเลือก user agent เพื่อดูรายละเอียดเส้นทาง
          </div>
        ) : loading ? (
          <div className="h-64 bg-gray-100 animate-pulse rounded" />
        ) : routes.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            ไม่พบเส้นทางสำหรับ user agent นี้ในช่วงเวลาที่เลือก
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div className="p-3 rounded bg-gray-50">
                <p className="text-gray-500">รวมคำขอ</p>
                <p className="text-xl font-semibold">{formatNumber(routeSummary.requests)}</p>
              </div>
              <div className="p-3 rounded bg-green-50">
                <p className="text-green-600">สำเร็จ</p>
                <p className="text-xl font-semibold">{formatNumber(routeSummary.success)}</p>
              </div>
              <div className="p-3 rounded bg-amber-50">
                <p className="text-amber-600">Error</p>
                <p className="text-xl font-semibold">{formatNumber(routeSummary.errors)}</p>
              </div>
              <div className="p-3 rounded bg-blue-50">
                <p className="text-blue-600">Endpoints</p>
                <p className="text-xl font-semibold">{routes.length}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 font-medium">Path</th>
                    <th className="text-left p-2 font-medium">Method</th>
                    <th className="text-right p-2 font-medium">Requests</th>
                    <th className="text-right p-2 font-medium">Success %</th>
                    <th className="text-right p-2 font-medium">Error %</th>
                    <th className="text-right p-2 font-medium">Avg Response</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={`${route.path}-${route.method}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{route.path}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {route.method}
                        </span>
                      </td>
                      <td className="p-2 text-right font-semibold">{formatNumber(route.totalRequests)}</td>
                      <td className="p-2 text-right text-green-600">{route.successRate}%</td>
                      <td className="p-2 text-right text-red-600">{route.errorRate}%</td>
                      <td className="p-2 text-right">{formatResponseTime(route.avgResponseTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

