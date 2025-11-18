import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { ErrorData } from '../../types/analytics';
import { formatNumber, getChartColor } from '../../lib/utils';

interface ErrorStatusChartProps {
  data: ErrorData[];
  loading?: boolean;
}

export function ErrorStatusChart({ data, loading }: ErrorStatusChartProps) {
  const chartData = data.map(item => ({
    statusCode: item.statusCode.toString(),
    count: item.errorCount,
    percentage: item.percentage
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Breakdown by Status Code</CardTitle>
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
          <CardTitle>Error Breakdown by Status Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-green-600 font-semibold">
            No errors found! 🎉
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Breakdown by Status Code</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="statusCode" />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="font-semibold text-sm mb-1">
                        Status Code: {payload[0].payload.statusCode}
                      </p>
                      <p className="text-sm text-red-600">
                        Count: {formatNumber(payload[0].payload.count)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Percentage: {payload[0].payload.percentage}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="count" name="Error Count">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getChartColor(parseInt(entry.statusCode))} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

