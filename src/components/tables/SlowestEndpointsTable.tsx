import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { EndpointData } from '../../types/analytics';
import { formatNumber, formatResponseTime } from '../../lib/utils';

interface SlowestEndpointsTableProps {
  data: EndpointData[];
  loading?: boolean;
}

export function SlowestEndpointsTable({ data, loading }: SlowestEndpointsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slowest Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slowest Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slowest Endpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">#</th>
                <th className="text-left p-2 font-medium">Path</th>
                <th className="text-right p-2 font-medium">Avg Time</th>
                <th className="text-right p-2 font-medium">Requests</th>
              </tr>
            </thead>
            <tbody>
              {data.map((endpoint, index) => {
                const getTimeColor = (time: number) => {
                  if (time < 500) return 'text-green-600';
                  if (time < 2000) return 'text-yellow-600';
                  return 'text-red-600';
                };

                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-500">{index + 1}</td>
                    <td className="p-2 font-mono text-xs break-all">{endpoint.path}</td>
                    <td className={`p-2 text-right font-semibold ${getTimeColor(endpoint.avgTime)}`}>
                      {formatResponseTime(endpoint.avgTime)}
                    </td>
                    <td className="p-2 text-right text-gray-600">
                      {formatNumber(endpoint.count)}
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

