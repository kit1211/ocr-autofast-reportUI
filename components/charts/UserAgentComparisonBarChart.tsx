import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { UserAgentComparison } from '@/types/analytics';
import { formatNumber, truncateText } from '@/lib/utils';

interface UserAgentComparisonBarChartProps {
  data: UserAgentComparison | null;
  loading?: boolean;
}

export function UserAgentComparisonBarChart({ data, loading }: UserAgentComparisonBarChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>การเปรียบเทียบจำนวน Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>การเปรียบเทียบจำนวน Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            เลือก User Agent เพื่อเปรียบเทียบ
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = [
    {
      name: truncateText(data.primary.userAgent, 30),
      fullName: data.primary.userAgent,
      totalRequests: data.primary.totalRequests,
      successCount: data.primary.successCount,
      errorCount: data.primary.errorCount,
      avgTime: data.primary.avgResponseTime,
      isPrimary: true
    },
    ...data.others.map(agent => ({
      name: truncateText(agent.userAgent, 30),
      fullName: agent.userAgent,
      totalRequests: agent.totalRequests,
      successCount: agent.successCount,
      errorCount: agent.errorCount,
      avgTime: agent.avgResponseTime,
      isPrimary: false
    }))
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>การเปรียบเทียบจำนวน Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={120}
              fontSize={11}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold text-sm mb-2">
                        {item.fullName}
                        {item.isPrimary && <span className="ml-2 text-blue-600">(หลัก)</span>}
                      </p>
                      <p className="text-sm">Total: {formatNumber(item.totalRequests)}</p>
                      <p className="text-sm text-green-600">Success: {formatNumber(item.successCount)}</p>
                      <p className="text-sm text-red-600">Error: {formatNumber(item.errorCount)}</p>
                      <p className="text-sm text-gray-600">Avg Time: {item.avgTime}ms</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="successCount" stackId="a" fill="#22c55e" name="Success" />
            <Bar dataKey="errorCount" stackId="a" fill="#ef4444" name="Error" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

