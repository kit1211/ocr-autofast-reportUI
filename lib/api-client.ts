import type {
  ApiResponse,
  OverviewStats,
  EndpointsResponse,
  UserAgentData,
  ErrorData,
  MethodData,
  OcrCostSummary,
  OcrUserAgentCost,
  OcrPathCost,
  UserAgentRoute,
  UserAgentComparison
} from '@/types/analytics';

// API Base URL for client-side (same origin)
const API_BASE_URL = '';

/**
 * Generic fetch wrapper with error handling
 */
type DateRangeParams = { type: 'days' | 'custom'; days?: number; startDate?: string; endDate?: string };

async function fetchAPI<T>(
  endpoint: string,
  range: DateRangeParams,
  extraParams?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  try {
    const params = new URLSearchParams();
    if (range.type === 'days' && range.days) {
      params.set('days', String(range.days));
    } else if (range.type === 'custom' && range.startDate && range.endDate) {
      params.set('startDate', range.startDate);
      params.set('endDate', range.endDate);
    }

    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse<T> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch data');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch overview statistics
 */
export async function fetchOverview(range: DateRangeParams): Promise<OverviewStats> {
  return fetchAPI<OverviewStats>('/api/overview', range);
}

/**
 * Fetch endpoints analysis (top, slowest, error-prone)
 */
export async function fetchEndpoints(range: DateRangeParams): Promise<EndpointsResponse> {
  return fetchAPI<EndpointsResponse>('/api/endpoints', range);
}

/**
 * Fetch user agent analysis
 */
export async function fetchUserAgents(range: DateRangeParams): Promise<UserAgentData[]> {
  return fetchAPI<UserAgentData[]>('/api/user-agents', range);
}

/**
 * Fetch error breakdown by status code
 */
export async function fetchErrors(range: DateRangeParams): Promise<ErrorData[]> {
  return fetchAPI<ErrorData[]>('/api/errors', range);
}

/**
 * Fetch method statistics
 */
export async function fetchMethods(range: DateRangeParams): Promise<MethodData[]> {
  return fetchAPI<MethodData[]>('/api/methods', range);
}

/**
 * Fetch user agent comparison data
 */
export async function fetchUserAgentComparison(
  range: DateRangeParams,
  primaryAgent: string,
  groupOthers: boolean = true,
  limit: number = 10
): Promise<UserAgentComparison> {
  try {
    let url = `${API_BASE_URL}/api/user-agents/compare?`;
    
    // Add date range parameters
    if (range.type === 'days' && range.days) {
      url += `days=${range.days}&`;
    } else if (range.type === 'custom' && range.startDate && range.endDate) {
      url += `startDate=${range.startDate}&endDate=${range.endDate}&`;
    }
    
    // Add comparison parameters
    url += `primaryAgent=${encodeURIComponent(primaryAgent)}&`;
    url += `groupOthers=${groupOthers}&`;
    url += `limit=${limit}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse<UserAgentComparison> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch user agent comparison');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching user agent comparison:', error);
    throw error;
  }
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string; database: string; timestamp: string }> {
  try {
    const url = `${API_BASE_URL}/api/health`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    
    const data: ApiResponse<{ status: string; database: string; timestamp: string }> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Health check failed');
    }
    
    return data.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

/**
 * Fetch OCR summary data
 */
export async function fetchOcrSummary(range: DateRangeParams): Promise<OcrCostSummary> {
  return fetchAPI<OcrCostSummary>('/api/ocr/summary', range);
}

/**
 * Fetch OCR cost by user agent
 */
export async function fetchOcrUserAgents(
  range: DateRangeParams, 
  limit: number = 50,
  userAgent?: string
): Promise<OcrUserAgentCost[]> {
  return fetchAPI<OcrUserAgentCost[]>('/api/ocr/user-agents', range, { limit, userAgent });
}

/**
 * Fetch OCR cost by path, method, and user agent
 */
export async function fetchOcrPaths(
  range: DateRangeParams,
  limit: number = 50,
  userAgent?: string
): Promise<OcrPathCost[]> {
  return fetchAPI<OcrPathCost[]>('/api/ocr/paths', range, { limit, userAgent });
}

/**
 * Fetch routes for a specific user agent
 */
export async function fetchUserAgentRoutes(
  range: DateRangeParams,
  userAgent: string,
  limit: number = 25
): Promise<UserAgentRoute[]> {
  if (!userAgent) {
    return [];
  }
  return fetchAPI<UserAgentRoute[]>('/api/user-agents/routes', range, { userAgent, limit });
}

