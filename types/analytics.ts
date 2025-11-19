// TypeScript types for Analytics Dashboard

export interface OverviewStats {
  totalRequests: number;
  activeTokens: number;
  successRate: number;
  avgResponseTime: number;
  totalData: number;
  ocrTotalRequests: number;
  ocrInputTokens: number;
  ocrOutputTokens: number;
  ocrTotalTokens: number;
  ocrCostUsd: number;
  ocrCostThb: number;
  ocrExchangeRate: number;
  ocrInputRatePerMillion: number;
  ocrOutputRatePerMillion: number;
}

export interface EndpointData {
  path: string;
  count: number;
  avgTime: number;
}

export interface ErrorProneEndpoint {
  path: string;
  totalRequests: number;
  errorCount: number;
  errorRate: number;
}

export interface UserAgentData {
  userAgent: string;
  method: string;
  statusCode: number;
  requestCount: number;
}

export interface ErrorData {
  statusCode: number;
  errorCount: number;
  percentage: number;
}

export interface MethodData {
  method: string;
  count: number;
  avgTime: number;
}

export interface EndpointsResponse {
  top: EndpointData[];
  slowest: EndpointData[];
  errorProne: ErrorProneEndpoint[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DateRange {
  type: 'days' | 'custom';
  days?: number;
  startDate?: string;
  endDate?: string;
}

export interface UserAgentMetrics {
  userAgent: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
}

export interface UserAgentComparison {
  primary: UserAgentMetrics;
  others: UserAgentMetrics[];
  summary: {
    primaryPercentage: number;
    othersPercentage: number;
  };
}

export interface OcrCostSummary {
  totalResponses: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalUsd: number;
  totalThb: number;
  exchangeRate: number;
  exchangeRateLastUpdate?: string;
  exchangeRateSource?: string;
  inputRatePerMillion: number;
  outputRatePerMillion: number;
}

export interface OcrUserAgentCost {
  userAgent: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  usdCost: number;
  thbCost: number;
}

export interface UserAgentRoute {
  userAgent: string;
  path: string;
  method: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
}

export interface OcrPathCost {
  path: string;
  method: string;
  userAgent: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  usdCost: number;
  thbCost: number;
}

