import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { UserAgentComparison } from '../../types/analytics';
import { formatNumber } from '../../lib/utils';

interface UserAgentComparisonPieChartProps {
  data: UserAgentComparison | null;
  loading?: boolean;
}

const PRIMARY_COLOR = '#3b82f6'; // Blue
const COLORS = [
  '#6b7280', // Gray for Others (grouped)
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export function UserAgentComparisonPieChart({ data, loading }: UserAgentComparisonPieChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สัดส่วน Requests</CardTitle>
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
          <CardTitle>สัดส่วน Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            เลือก User Agent เพื่อเปรียบเทียบ
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare pie chart data
  const pieData = [
    {
      name: data.primary.userAgent.length > 30 
        ? `${data.primary.userAgent.substring(0, 30)}...` 
        : data.primary.userAgent,
      fullName: data.primary.userAgent,
      value: data.primary.totalRequests,
      percentage: data.summary.primaryPercentage,
      isPrimary: true
    },
    ...data.others.map((agent, index) => ({
      name: agent.userAgent.length > 30 
        ? `${agent.userAgent.substring(0, 30)}...` 
        : agent.userAgent,
      fullName: agent.userAgent,
      value: agent.totalRequests,
      percentage: agent.userAgent === 'Others' 
        ? data.summary.othersPercentage 
        : ((agent.totalRequests / (data.primary.totalRequests + data.others.reduce((sum, o) => sum + o.totalRequests, 0))) * 100).toFixed(2),
      isPrimary: false,
      colorIndex: index
    }))
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>สัดส่วน Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage}%)`}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPrimary ? PRIMARY_COLOR : COLORS[entry.colorIndex % COLORS.length]} 
                />
              ))}
            </Pie>
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
                      <p className="text-sm">Requests: {formatNumber(item.value)}</p>
                      <p className="text-sm text-blue-600">Percentage: {item.percentage}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

