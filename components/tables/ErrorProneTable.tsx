import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { ErrorProneEndpoint } from '@/types/analytics';
import { formatNumber } from '@/lib/utils';

interface ErrorProneTableProps {
  data: ErrorProneEndpoint[];
  loading?: boolean;
}

export function ErrorProneTable({ data, loading }: ErrorProneTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error-Prone Endpoints</CardTitle>
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
          <CardTitle>Error-Prone Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-green-600 font-semibold">
            No error-prone endpoints! 🎉
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error-Prone Endpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">#</th>
                <th className="text-left p-2 font-medium">Path</th>
                <th className="text-right p-2 font-medium">Error Rate</th>
                <th className="text-right p-2 font-medium">Errors</th>
                <th className="text-right p-2 font-medium">Total Requests</th>
              </tr>
            </thead>
            <tbody>
              {data.map((endpoint, index) => {
                const getRateColor = (rate: number) => {
                  if (rate < 5) return 'text-green-600';
                  if (rate < 20) return 'text-yellow-600';
                  return 'text-red-600';
                };

                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-500">{index + 1}</td>
                    <td className="p-2 font-mono text-xs break-all">{endpoint.path}</td>
                    <td className={`p-2 text-right font-semibold ${getRateColor(endpoint.errorRate)}`}>
                      {endpoint.errorRate}%
                    </td>
                    <td className="p-2 text-right text-red-600">
                      {formatNumber(endpoint.errorCount)}
                    </td>
                    <td className="p-2 text-right text-gray-600">
                      {formatNumber(endpoint.totalRequests)}
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

