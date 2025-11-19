import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { EndpointData } from '@/types/analytics';
import { truncateText, formatNumber } from '@/lib/utils';

interface EndpointsBarChartProps {
  data: EndpointData[];
  title: string;
  loading?: boolean;
}

export function EndpointsBarChart({ data, title, loading }: EndpointsBarChartProps) {
  const chartData = data.map(item => ({
    name: truncateText(item.path, 30),
    fullPath: item.path,
    requests: item.count,
    avgTime: item.avgTime
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold text-sm mb-1">{payload[0].payload.fullPath}</p>
                      <p className="text-sm text-blue-600">
                        Requests: {formatNumber(payload[0].payload.requests)}
                      </p>
                      <p className="text-sm text-green-600">
                        Avg Time: {payload[0].payload.avgTime}ms
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

