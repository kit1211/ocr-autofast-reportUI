'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { OcrPathCost } from '@/types/analytics';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { formatCurrency, formatNumber, truncateText } from '@/lib/utils';

interface OcrUserAgentTableProps {
  data: OcrPathCost[];
  loading?: boolean;
  availableUserAgents?: string[];
  selectedUserAgent?: string;
  onUserAgentChange?: (userAgent: string) => void;
}

export function OcrUserAgentTable({ 
  data, 
  loading,
  availableUserAgents = [],
  selectedUserAgent,
  onUserAgentChange
}: OcrUserAgentTableProps) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Get unique user agents from data if not provided
  const uniqueUserAgents = useMemo(() => {
    if (availableUserAgents.length > 0) {
      return availableUserAgents;
    }
    return Array.from(new Set(data.map(item => item.userAgent).filter(Boolean))).sort();
  }, [data, availableUserAgents]);

  const filteredData = useMemo(() => {
    let result = data;
    
    // Filter by selected user agent if provided
    if (selectedUserAgent && selectedUserAgent !== 'all') {
      result = result.filter(item => item.userAgent === selectedUserAgent);
    }
    
    // Filter by search text
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => 
        item.path?.toLowerCase().includes(searchLower) ||
        item.method?.toLowerCase().includes(searchLower) ||
        item.userAgent?.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [data, search, selectedUserAgent]);

  // Limit to 5 rows initially
  const displayData = useMemo(() => {
    if (showAll || search) {
      return filteredData;
    }
    return filteredData.slice(0, 5);
  }, [filteredData, showAll, search]);

  const hasMore = filteredData.length > 5;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>OCR Cost by Path</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            {uniqueUserAgents.length > 0 && (
              <div className="flex items-center gap-2">
                <Label htmlFor="user-agent-select" className="text-sm whitespace-nowrap">
                  กรองตาม User Agent:
                </Label>
                <Select 
                  value={selectedUserAgent || 'all'} 
                  onValueChange={(value) => onUserAgentChange?.(value)}
                  disabled={loading}
                >
                  <SelectTrigger id="user-agent-select" className="w-full sm:w-64">
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {uniqueUserAgents.map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {truncateText(agent, 60)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา path, method, หรือ user agent..."
              className="max-w-sm"
              disabled={loading || data.length === 0}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 bg-gray-100 animate-pulse rounded" />
        ) : filteredData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500 text-sm gap-2">
            {search ? (
              'ไม่พบข้อมูลที่ตรงกับคำค้นหา'
            ) : selectedUserAgent && selectedUserAgent !== 'all' ? (
              <>
                <p>ไม่พบข้อมูล OCR path สำหรับ User Agent นี้ในช่วงเวลาที่เลือก</p>
                <p className="text-xs text-gray-400">ลองเปลี่ยนช่วงเวลาหรือเลือก User Agent อื่น</p>
              </>
            ) : (
              'ยังไม่มีข้อมูล OCR path ในช่วงนี้'
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 font-medium">#</th>
                    <th className="text-left p-2 font-medium">Path</th>
                    <th className="text-left p-2 font-medium">Method</th>
                    <th className="text-left p-2 font-medium">User Agent</th>
                    <th className="text-right p-2 font-medium">Requests</th>
                    <th className="text-right p-2 font-medium">Input Tokens</th>
                    <th className="text-right p-2 font-medium">Output Tokens</th>
                    <th className="text-right p-2 font-medium">Total Tokens</th>
                    <th className="text-right p-2 font-medium">Cost (THB)</th>
                    <th className="text-right p-2 font-medium">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((item, index) => (
                    <tr key={`${item.path}-${item.method}-${item.userAgent}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-gray-500">{index + 1}</td>
                      <td className="p-2 font-mono text-xs" title={item.path}>
                        {truncateText(item.path || 'Unknown', 40)}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          {item.method || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-xs" title={item.userAgent}>
                        {truncateText(item.userAgent || 'Unknown', 50)}
                      </td>
                      <td className="p-2 text-right font-semibold">{formatNumber(item.requestCount)}</td>
                      <td className="p-2 text-right">{formatNumber(item.inputTokens)}</td>
                      <td className="p-2 text-right">{formatNumber(item.outputTokens)}</td>
                      <td className="p-2 text-right">{formatNumber(item.totalTokens)}</td>
                      <td className="p-2 text-right font-semibold text-gray-900">
                        {formatCurrency(item.thbCost, 'THB')}
                      </td>
                      <td className="p-2 text-right text-gray-600">
                        {formatCurrency(item.usdCost, 'USD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!search && hasMore && !showAll && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ดูเพิ่มเติม ({filteredData.length - 5} รายการ)
                </button>
              </div>
            )}
            {!search && showAll && hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAll(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  แสดงน้อยลง
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

