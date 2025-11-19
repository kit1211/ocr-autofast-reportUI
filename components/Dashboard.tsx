'use client';

import { useState, useEffect, useMemo } from 'react';
import { DateRangeSelector } from './DateRangeSelector';
import { TotalRequestsCard } from './cards/TotalRequestsCard';
import { ActiveTokensCard } from './cards/ActiveTokensCard';
import { SuccessRateCard } from './cards/SuccessRateCard';
import { AvgResponseTimeCard } from './cards/AvgResponseTimeCard';
import { TotalDataCard } from './cards/TotalDataCard';
import { OcrCostCard } from './cards/OcrCostCard';
import { EndpointsBarChart } from './charts/EndpointsBarChart';
import { ErrorStatusChart } from './charts/ErrorStatusChart';
import { MethodPieChart } from './charts/MethodPieChart';
import { SlowestEndpointsTable } from './tables/SlowestEndpointsTable';
import { ErrorProneTable } from './tables/ErrorProneTable';
import { UserAgentTable } from './tables/UserAgentTable';
import { UserAgentComparison } from './UserAgentComparison';
import { OcrSummaryPanel } from './ocr/OcrSummaryPanel';
import { OcrUserAgentTable } from './tables/OcrUserAgentTable';
import { UserAgentRouteExplorer } from './UserAgentRouteExplorer';
import {
  fetchOverview,
  fetchEndpoints,
  fetchUserAgents,
  fetchErrors,
  fetchMethods,
  fetchOcrSummary,
  fetchOcrPaths,
  fetchUserAgentRoutes
} from '@/lib/api-client';
import type {
  OverviewStats,
  EndpointsResponse,
  UserAgentData,
  ErrorData,
  MethodData,
  OcrCostSummary,
  OcrPathCost,
  UserAgentRoute,
  DateRange
} from '@/types/analytics';
import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    type: 'days',
    days: 7
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Data states
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [endpointsData, setEndpointsData] = useState<EndpointsResponse | null>(null);
  const [userAgentData, setUserAgentData] = useState<UserAgentData[]>([]);
  const [errorData, setErrorData] = useState<ErrorData[]>([]);
  const [methodData, setMethodData] = useState<MethodData[]>([]);
  const [ocrSummary, setOcrSummary] = useState<OcrCostSummary | null>(null);
  const [ocrPaths, setOcrPaths] = useState<OcrPathCost[]>([]);
  const [allOcrPathUserAgents, setAllOcrPathUserAgents] = useState<OcrPathCost[]>([]); // For dropdown options
  const [selectedOcrPathUserAgent, setSelectedOcrPathUserAgent] = useState<string>('all');
  const [userAgentRoutes, setUserAgentRoutes] = useState<UserAgentRoute[]>([]);
  const [selectedRouteAgent, setSelectedRouteAgent] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all data in parallel
      const userAgentForOcr = selectedOcrPathUserAgent && selectedOcrPathUserAgent !== 'all' ? selectedOcrPathUserAgent : undefined;
      const [overview, endpoints, userAgents, errors, methods, ocrSummaryData, ocrPathsData, allOcrPathsData] = await Promise.all([
        fetchOverview(dateRange),
        fetchEndpoints(dateRange),
        fetchUserAgents(dateRange),
        fetchErrors(dateRange),
        fetchMethods(dateRange),
        fetchOcrSummary(dateRange),
        fetchOcrPaths(dateRange, 50, userAgentForOcr),
        fetchOcrPaths(dateRange, 50) // Fetch all for dropdown options
      ]);

      setOverviewStats(overview);
      setEndpointsData(endpoints);
      setUserAgentData(userAgents);
      setErrorData(errors);
      setMethodData(methods);
      setOcrSummary(ocrSummaryData);
      setOcrPaths(ocrPathsData);
      setAllOcrPathUserAgents(allOcrPathsData); // Store all paths for dropdown
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange, selectedOcrPathUserAgent]);

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
  };
  const loadRoutesForAgent = async (agent: string, range: DateRange = dateRange) => {
    if (!agent) {
      setUserAgentRoutes([]);
      setRouteError(null);
      return;
    }

    try {
      setRouteLoading(true);
      setRouteError(null);
      const routes = await fetchUserAgentRoutes(range, agent);
      setUserAgentRoutes(routes);
    } catch (err) {
      console.error('Error loading user agent routes:', err);
      setRouteError(err instanceof Error ? err.message : 'ไม่สามารถโหลดเส้นทางของ user agent ได้');
      setUserAgentRoutes([]);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleRouteAgentChange = (agent: string) => {
    setSelectedRouteAgent(agent);
    if (!agent) {
      setUserAgentRoutes([]);
      setRouteError(null);
    }
  };

  useEffect(() => {
    if (selectedRouteAgent) {
      loadRoutesForAgent(selectedRouteAgent, dateRange);
    }
  }, [selectedRouteAgent, dateRange]);

  const availableRouteAgents = useMemo(() => {
    return Array.from(new Set(userAgentData.map(ua => ua.userAgent || 'Unknown'))).sort();
  }, [userAgentData]);

  const availableOcrPathUserAgents = useMemo(() => {
    // Get unique user agents from all OCR path data (not filtered)
    const fromOcrData = Array.from(new Set(allOcrPathUserAgents.map(item => item.userAgent).filter(Boolean))).sort();
    // Also include from regular user agent data
    const fromUserAgentData = Array.from(new Set(userAgentData.map(ua => ua.userAgent).filter(Boolean))).sort();
    // Combine and deduplicate
    return Array.from(new Set([...fromOcrData, ...fromUserAgentData])).sort();
  }, [allOcrPathUserAgents, userAgentData]);

  const handleOcrPathUserAgentChange = (userAgent: string) => {
    setSelectedOcrPathUserAgent(userAgent);
  };


  const handleRefresh = () => {
    loadData(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => loadData()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">API Request Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Monitor and analyze your API performance metrics in real-time
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-wrap items-end justify-between gap-4">
          <DateRangeSelector onRangeChange={handleRangeChange} defaultDays={dateRange.days || 7} />
          
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <p className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <TotalRequestsCard
            value={overviewStats?.totalRequests || 0}
            loading={loading}
          />
          <ActiveTokensCard
            value={overviewStats?.activeTokens || 0}
            loading={loading}
          />
          <SuccessRateCard
            value={overviewStats?.successRate || 0}
            loading={loading}
          />
          <AvgResponseTimeCard
            value={overviewStats?.avgResponseTime || 0}
            loading={loading}
          />
          <TotalDataCard
            value={overviewStats?.totalData || 0}
            loading={loading}
          />
          <OcrCostCard
            thbValue={overviewStats?.ocrCostThb || 0}
            usdValue={overviewStats?.ocrCostUsd || 0}
            totalTokens={overviewStats?.ocrTotalTokens || 0}
            loading={loading}
          />
        </div>

        {/* OCR Summary & Costs */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">

        <OcrSummaryPanel summary={ocrSummary} loading={loading} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          <OcrUserAgentTable 
            data={ocrPaths} 
            loading={loading}
            availableUserAgents={availableOcrPathUserAgents}
            selectedUserAgent={selectedOcrPathUserAgent}
            onUserAgentChange={handleOcrPathUserAgentChange}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EndpointsBarChart
            data={endpointsData?.top || []}
            title="Top 5 Endpoints"
            loading={loading}
          />
          <MethodPieChart
            data={methodData}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 mb-6">
          <ErrorStatusChart
            data={errorData}
            loading={loading}
          />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SlowestEndpointsTable
            data={endpointsData?.slowest || []}
            loading={loading}
          />
          <ErrorProneTable
            data={endpointsData?.errorProne || []}
            loading={loading}
          />
        </div>

        {/* User Agent Comparison */}
        <UserAgentComparison
          dateRange={dateRange}
          availableUserAgents={userAgentData}
          loading={loading}
        />

        {/* User Agent Analysis */}
        <div className="mb-6">
          <UserAgentTable
            data={userAgentData}
            loading={loading}
          />
        </div>

        <div className="mb-6">
          <UserAgentRouteExplorer
            availableAgents={availableRouteAgents}
            routes={userAgentRoutes}
            selectedAgent={selectedRouteAgent}
            loading={routeLoading}
            error={routeError}
            onAgentChange={handleRouteAgentChange}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>Dashboard Analytics v1.0 | Built with Bun + React 19 + TailwindCSS</p>
          <p className="mt-1">
            {dateRange.type === 'days' 
              ? `แสดงข้อมูล ${dateRange.days} วันล่าสุด` 
              : `แสดงข้อมูลตั้งแต่ ${dateRange.startDate} ถึง ${dateRange.endDate}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

