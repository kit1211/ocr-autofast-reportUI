import postgres from 'postgres';
import type {
  OverviewStats,
  EndpointData,
  ErrorProneEndpoint,
  UserAgentData,
  ErrorData,
  MethodData,
  EndpointsResponse,
  OcrCostSummary,
  OcrUserAgentCost,
  OcrPathCost,
  UserAgentRoute
} from '@/types/analytics';
import { DEFAULT_USD_TO_THB_RATE, OPENROUTER_OCR_PRICING, getOcrCostBreakdown } from './costs';

// Database connection helper
// This creates connection on-demand to avoid errors during build time
function getSql() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  return postgres(DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30
  });
}

// Create a lazy connection that will be initialized on first use
let sql: ReturnType<typeof postgres> | null = null;

function getConnection() {
  if (!sql) {
    sql = getSql();
  }
  return sql;
}

/**
 * Helper function to build WHERE clause for date filtering
 */
function buildDateFilter(
  params: { days?: number; startDate?: string; endDate?: string },
  tableAlias?: string
) {
  const sql = getConnection();
  const columnIdentifier = tableAlias
    ? sql.unsafe(`${tableAlias}."createdAt"`)
    : sql.unsafe(`"createdAt"`);

  if (params.startDate && params.endDate) {
    return sql`${columnIdentifier} >= ${params.startDate}::date AND ${columnIdentifier} < ${params.endDate}::date + INTERVAL '1 day'`;
  }
  const days = params.days || 7;
  return sql`${columnIdentifier} >= NOW() - INTERVAL '${sql.unsafe(days.toString())} days'`;
}

/**
 * Get overview statistics
 * @param params - Date range parameters (days or startDate/endDate)
 */
export async function getOverviewStats(params: { days?: number; startDate?: string; endDate?: string }): Promise<OverviewStats> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    const [requestResult, ocrSummary] = await Promise.all([
      sql`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(DISTINCT "apiToken") as active_tokens,
          COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_response_time,
          COALESCE(SUM("requestBodySize"), 0) as total_data,
          COALESCE(
            ROUND(
              COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300)::numeric 
              / NULLIF(COUNT(*), 0) * 100, 
              2
            ), 
            0
          ) as success_rate
        FROM "RequestLog"
        WHERE ${dateFilter}
      `,
      getOcrCostSummary(params)
    ]);

    const row = requestResult[0];
        
    return {
      totalRequests: Number(row?.total_requests || 0),
      activeTokens: Number(row?.active_tokens || 0),
      successRate: Number(row?.success_rate || 0),
      avgResponseTime: Number(row?.avg_response_time || 0),
      totalData: Number(row?.total_data || 0),
      ocrTotalRequests: ocrSummary.totalResponses,
      ocrInputTokens: ocrSummary.totalInputTokens,
      ocrOutputTokens: ocrSummary.totalOutputTokens,
      ocrTotalTokens: ocrSummary.totalTokens,
      ocrCostUsd: ocrSummary.totalUsd,
      ocrCostThb: ocrSummary.totalThb,
      ocrExchangeRate: ocrSummary.exchangeRate,
      ocrInputRatePerMillion: ocrSummary.inputRatePerMillion,
      ocrOutputRatePerMillion: ocrSummary.outputRatePerMillion
    };
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    throw new Error('Failed to fetch overview statistics');
  }
}

/**
 * Get top endpoints by request count
 * @param params - Date range parameters (days or startDate/endDate)
 * @param limit - Maximum number of results (default: 5)
 */
export async function getTopEndpoints(params: { days?: number; startDate?: string; endDate?: string }, limit: number = 5): Promise<EndpointData[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    const result = await sql`
      SELECT 
        path, 
        COUNT(*) as count, 
        COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_time
      FROM "RequestLog"
      WHERE ${dateFilter}
      GROUP BY path
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return result.map(row => ({
      path: row.path,
      count: Number(row.count),
      avgTime: Number(row.avg_time)
    }));
  } catch (error) {
    console.error('Error fetching top endpoints:', error);
    throw new Error('Failed to fetch top endpoints');
  }
}

/**
 * Get slowest endpoints
 * @param params - Date range parameters (days or startDate/endDate)
 * @param limit - Maximum number of results (default: 5)
 * @param minRequests - Minimum number of requests to include (default: 10)
 */
export async function getSlowestEndpoints(
  params: { days?: number; startDate?: string; endDate?: string }, 
  limit: number = 5,
  minRequests: number = 10
): Promise<EndpointData[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    const result = await sql`
      SELECT 
        path,
        COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_time,
        COUNT(*) as request_count
      FROM "RequestLog"
      WHERE ${dateFilter}
      GROUP BY path
      HAVING COUNT(*) >= ${minRequests}
      ORDER BY avg_time DESC
      LIMIT ${limit}
    `;

    return result.map(row => ({
      path: row.path,
      count: Number(row.request_count),
      avgTime: Number(row.avg_time)
    }));
  } catch (error) {
    console.error('Error fetching slowest endpoints:', error);
    throw new Error('Failed to fetch slowest endpoints');
  }
}

/**
 * Get error-prone endpoints
 * @param params - Date range parameters (days or startDate/endDate)
 * @param limit - Maximum number of results (default: 5)
 * @param minRequests - Minimum number of requests to include (default: 10)
 */
export async function getErrorProneEndpoints(
  params: { days?: number; startDate?: string; endDate?: string },
  limit: number = 5,
  minRequests: number = 10
): Promise<ErrorProneEndpoint[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    const result = await sql`
      SELECT 
        path,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE "statusCode" >= 400) as error_count,
        COALESCE(
          ROUND(
            COUNT(*) FILTER (WHERE "statusCode" >= 400)::numeric 
            / NULLIF(COUNT(*), 0) * 100, 
            2
          ),
          0
        ) as error_rate
      FROM "RequestLog"
      WHERE ${dateFilter}
      GROUP BY path
      HAVING COUNT(*) >= ${minRequests}
      ORDER BY error_rate DESC
      LIMIT ${limit}
    `;

    return result.map(row => ({
      path: row.path,
      totalRequests: Number(row.total_requests),
      errorCount: Number(row.error_count),
      errorRate: Number(row.error_rate)
    }));
  } catch (error) {
    console.error('Error fetching error-prone endpoints:', error);
    throw new Error('Failed to fetch error-prone endpoints');
  }
}

/**
 * Get all endpoint analysis data
 * @param params - Date range parameters (days or startDate/endDate)
 */
export async function getEndpointsAnalysis(params: { days?: number; startDate?: string; endDate?: string }): Promise<EndpointsResponse> {
  try {
    const [top, slowest, errorProne] = await Promise.all([
      getTopEndpoints(params),
      getSlowestEndpoints(params),
      getErrorProneEndpoints(params)
    ]);

    return {
      top,
      slowest,
      errorProne
    };
  } catch (error) {
    console.error('Error fetching endpoints analysis:', error);
    throw new Error('Failed to fetch endpoints analysis');
  }
}

/**
 * Get user agent analysis
 * @param params - Date range parameters (days or startDate/endDate)
 * @param limit - Maximum number of results (default: 50)
 */
export async function getUserAgentAnalysis(params: { days?: number; startDate?: string; endDate?: string }, limit: number = 50): Promise<UserAgentData[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    const result = await sql`
      SELECT 
        COALESCE("userAgent", 'Unknown') as user_agent,
        method,
        "statusCode" as status_code,
        COUNT(*) as request_count
      FROM "RequestLog"
      WHERE ${dateFilter}
      GROUP BY "userAgent", method, "statusCode"
      ORDER BY request_count DESC
      LIMIT ${limit}
    `;

    return result.map(row => ({
      userAgent: row.user_agent,
      method: row.method,
      statusCode: Number(row.status_code),
      requestCount: Number(row.request_count)
    }));
  } catch (error) {
    console.error('Error fetching user agent analysis:', error);
    throw new Error('Failed to fetch user agent analysis');
  }
}

/**
 * Get error breakdown by status code
 * @param params - Date range parameters (days or startDate/endDate)
 */
export async function getErrorBreakdown(params: { days?: number; startDate?: string; endDate?: string }): Promise<ErrorData[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    const result = await sql`
      SELECT 
        "statusCode" as status_code,
        COUNT(*) as error_count,
        COALESCE(
          ROUND(
            COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 
            2
          ),
          0
        ) as percentage
      FROM "RequestLog"
      WHERE ${dateFilter}
        AND "statusCode" >= 400
      GROUP BY "statusCode"
      ORDER BY error_count DESC
    `;

    return result.map(row => ({
      statusCode: Number(row.status_code),
      errorCount: Number(row.error_count),
      percentage: Number(row.percentage)
    }));
  } catch (error) {
    console.error('Error fetching error breakdown:', error);
    throw new Error('Failed to fetch error breakdown');
  }
}

/**
 * Get request statistics by HTTP method
 * @param params - Date range parameters (days or startDate/endDate)
 */
export async function getMethodStats(params: { days?: number; startDate?: string; endDate?: string }): Promise<MethodData[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    const result = await sql`
      SELECT 
        method,
        COUNT(*) as count,
        COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_time
      FROM "RequestLog"
      WHERE ${dateFilter}
      GROUP BY method
      ORDER BY count DESC
    `;

    return result.map(row => ({
      method: row.method,
      count: Number(row.count),
      avgTime: Number(row.avg_time)
    }));
  } catch (error) {
    console.error('Error fetching method stats:', error);
    throw new Error('Failed to fetch method statistics');
  }
}

/**
 * Get user agent comparison data
 * @param params - Date range parameters
 * @param primaryAgent - Primary user agent to compare
 * @param groupOthers - Whether to group other agents as "Others"
 * @param limit - Number of other agents to show (when not grouped)
 */
export async function getUserAgentComparison(
  params: { days?: number; startDate?: string; endDate?: string },
  primaryAgent: string,
  groupOthers: boolean = true,
  limit: number = 10
): Promise<any> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);
    
    // Get primary agent metrics
    const primaryResult = await sql`
      SELECT 
        "userAgent",
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300) as success_count,
        COUNT(*) FILTER (WHERE "statusCode" >= 400) as error_count,
        COALESCE(
          ROUND(
            COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300)::numeric 
            / NULLIF(COUNT(*), 0) * 100, 
            2
          ),
          0
        ) as success_rate,
        COALESCE(
          ROUND(
            COUNT(*) FILTER (WHERE "statusCode" >= 400)::numeric 
            / NULLIF(COUNT(*), 0) * 100, 
            2
          ),
          0
        ) as error_rate,
        COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_response_time
      FROM "RequestLog"
      WHERE ${dateFilter}
        AND "userAgent" = ${primaryAgent}
      GROUP BY "userAgent"
    `;

    const primary = primaryResult[0] ? {
      userAgent: primaryResult[0].userAgent || primaryAgent,
      totalRequests: Number(primaryResult[0].total_requests || 0),
      successCount: Number(primaryResult[0].success_count || 0),
      errorCount: Number(primaryResult[0].error_count || 0),
      successRate: Number(primaryResult[0].success_rate || 0),
      errorRate: Number(primaryResult[0].error_rate || 0),
      avgResponseTime: Number(primaryResult[0].avg_response_time || 0)
    } : {
      userAgent: primaryAgent,
      totalRequests: 0,
      successCount: 0,
      errorCount: 0,
      successRate: 0,
      errorRate: 0,
      avgResponseTime: 0
    };

    // Get other agents
    let others: any[] = [];
    
    if (groupOthers) {
      // Group all others as "Others"
      const othersResult = await sql`
        SELECT 
          'Others' as user_agent,
          COUNT(*) as total_requests,
          COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300) as success_count,
          COUNT(*) FILTER (WHERE "statusCode" >= 400) as error_count,
          COALESCE(
            ROUND(
              COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300)::numeric 
              / NULLIF(COUNT(*), 0) * 100, 
              2
            ),
            0
          ) as success_rate,
          COALESCE(
            ROUND(
              COUNT(*) FILTER (WHERE "statusCode" >= 400)::numeric 
              / NULLIF(COUNT(*), 0) * 100, 
              2
            ),
            0
          ) as error_rate,
          COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_response_time
        FROM "RequestLog"
        WHERE ${dateFilter}
          AND ("userAgent" != ${primaryAgent} OR "userAgent" IS NULL)
      `;

      if (othersResult[0] && Number(othersResult[0].total_requests) > 0) {
        others = [{
          userAgent: 'Others',
          totalRequests: Number(othersResult[0].total_requests),
          successCount: Number(othersResult[0].success_count),
          errorCount: Number(othersResult[0].error_count),
          successRate: Number(othersResult[0].success_rate),
          errorRate: Number(othersResult[0].error_rate),
          avgResponseTime: Number(othersResult[0].avg_response_time)
        }];
      }
    } else {
      // Show individual agents
      const othersResult = await sql`
        SELECT 
          COALESCE("userAgent", 'Unknown') as user_agent,
          COUNT(*) as total_requests,
          COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300) as success_count,
          COUNT(*) FILTER (WHERE "statusCode" >= 400) as error_count,
          COALESCE(
            ROUND(
              COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300)::numeric 
              / NULLIF(COUNT(*), 0) * 100, 
              2
            ),
            0
          ) as success_rate,
          COALESCE(
            ROUND(
              COUNT(*) FILTER (WHERE "statusCode" >= 400)::numeric 
              / NULLIF(COUNT(*), 0) * 100, 
              2
            ),
            0
          ) as error_rate,
          COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_response_time
        FROM "RequestLog"
        WHERE ${dateFilter}
          AND "userAgent" != ${primaryAgent}
        GROUP BY "userAgent"
        ORDER BY total_requests DESC
        LIMIT ${limit}
      `;

      others = othersResult.map(row => ({
        userAgent: row.user_agent,
        totalRequests: Number(row.total_requests),
        successCount: Number(row.success_count),
        errorCount: Number(row.error_count),
        successRate: Number(row.success_rate),
        errorRate: Number(row.error_rate),
        avgResponseTime: Number(row.avg_response_time)
      }));
    }

    // Calculate summary
    const totalRequests = primary.totalRequests + others.reduce((sum, o) => sum + o.totalRequests, 0);
    const primaryPercentage = totalRequests > 0 
      ? Number(((primary.totalRequests / totalRequests) * 100).toFixed(2))
      : 0;
    const othersPercentage = totalRequests > 0
      ? Number((100 - primaryPercentage).toFixed(2))
      : 0;

    return {
      primary,
      others,
      summary: {
        primaryPercentage,
        othersPercentage
      }
    };
  } catch (error) {
    console.error('Error fetching user agent comparison:', error);
    throw new Error('Failed to fetch user agent comparison');
  }
}

/**
 * Get OCR token & cost summary
 */
export async function getOcrCostSummary(params: { days?: number; startDate?: string; endDate?: string }): Promise<OcrCostSummary> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);

    const result = await sql`
      SELECT 
        COUNT(*) as total_responses,
        COALESCE(SUM((token->>'input')::numeric), 0) as total_input_tokens,
        COALESCE(SUM((token->>'output')::numeric), 0) as total_output_tokens
      FROM "OcrResponse"
      WHERE ${dateFilter}
    `;

    const row = result[0] || {};
    const totalInputTokens = Number(row.total_input_tokens || 0);
    const totalOutputTokens = Number(row.total_output_tokens || 0);
    const totalTokens = totalInputTokens + totalOutputTokens;
    const { totalUsd, totalThb } = getOcrCostBreakdown(totalInputTokens, totalOutputTokens, DEFAULT_USD_TO_THB_RATE);

    return {
      totalResponses: Number(row.total_responses || 0),
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalUsd,
      totalThb,
      exchangeRate: DEFAULT_USD_TO_THB_RATE,
      inputRatePerMillion: OPENROUTER_OCR_PRICING.inputPerMillion,
      outputRatePerMillion: OPENROUTER_OCR_PRICING.outputPerMillion
    };
  } catch (error) {
    console.error('Error fetching OCR summary:', error);
    throw new Error('Failed to fetch OCR summary');
  }
}

/**
 * Get OCR cost breakdown by user agent
 */
export async function getOcrCostByUserAgent(
  params: { days?: number; startDate?: string; endDate?: string; userAgent?: string },
  limit: number = 50
): Promise<OcrUserAgentCost[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params, 'o');
    
    // Build user agent filter - handle both exact match and NULL/Unknown cases
    let result;
    if (params.userAgent) {
      // Filter by specific user agent
      result = await sql`
        SELECT 
          COALESCE(r."userAgent", 'Unknown') as user_agent,
          COUNT(*) as request_count,
          COALESCE(SUM((o.token->>'input')::numeric), 0) as input_tokens,
          COALESCE(SUM((o.token->>'output')::numeric), 0) as output_tokens
        FROM "OcrResponse" o
        LEFT JOIN "RequestLog" r ON r."id" = o."requestId"
        WHERE ${dateFilter}
          AND COALESCE(r."userAgent", 'Unknown') = ${params.userAgent}
        GROUP BY user_agent
        ORDER BY request_count DESC
        LIMIT ${limit}
      `;
    } else {
      // Get all user agents
      result = await sql`
        SELECT 
          COALESCE(r."userAgent", 'Unknown') as user_agent,
          COUNT(*) as request_count,
          COALESCE(SUM((o.token->>'input')::numeric), 0) as input_tokens,
          COALESCE(SUM((o.token->>'output')::numeric), 0) as output_tokens
        FROM "OcrResponse" o
        LEFT JOIN "RequestLog" r ON r."id" = o."requestId"
        WHERE ${dateFilter}
        GROUP BY user_agent
        ORDER BY request_count DESC
        LIMIT ${limit}
      `;
    }

    return result.map(row => {
      const inputTokens = Number(row.input_tokens || 0);
      const outputTokens = Number(row.output_tokens || 0);
      const totalTokens = inputTokens + outputTokens;
      const { totalUsd, totalThb } = getOcrCostBreakdown(inputTokens, outputTokens, DEFAULT_USD_TO_THB_RATE);

      return {
        userAgent: row.user_agent,
        requestCount: Number(row.request_count || 0),
        inputTokens,
        outputTokens,
        totalTokens,
        usdCost: totalUsd,
        thbCost: totalThb
      } satisfies OcrUserAgentCost;
    });
  } catch (error) {
    console.error('Error fetching OCR cost by user agent:', error);
    throw new Error('Failed to fetch OCR user agent costs');
  }
}

/**
 * Get OCR cost breakdown by path, method, and user agent
 */
export async function getOcrCostByPath(
  params: { days?: number; startDate?: string; endDate?: string; userAgent?: string },
  limit: number = 50
): Promise<OcrPathCost[]> {
  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params, 'r');
    
    // Since OcrResponse has no FK to RequestLog and no userAgent field,
    // we calculate proportional token usage based on request counts
    
    // First, get total OCR token usage in the time period
    const ocrDateFilter = buildDateFilter(params, 'o');
    const totalOcrStats = await sql`
      SELECT 
        COUNT(*) as total_ocr_requests,
        COALESCE(SUM((token->>'input')::numeric), 0) as total_input_tokens,
        COALESCE(SUM((token->>'output')::numeric), 0) as total_output_tokens
      FROM "OcrResponse" o
      WHERE ${ocrDateFilter}
    `;
    
    const ocrStats = totalOcrStats[0];
    const totalOcrRequests = Number(ocrStats?.total_ocr_requests || 0);
    const totalInputTokens = Number(ocrStats?.total_input_tokens || 0);
    const totalOutputTokens = Number(ocrStats?.total_output_tokens || 0);
    
    // Calculate average tokens per request
    const avgInputPerRequest = totalOcrRequests > 0 ? totalInputTokens / totalOcrRequests : 0;
    const avgOutputPerRequest = totalOcrRequests > 0 ? totalOutputTokens / totalOcrRequests : 0;
    
    // Get request counts by user agent from RequestLog
    let result;
    if (params.userAgent && params.userAgent !== 'all') {
      result = await sql`
        SELECT 
          r."path",
          r."method",
          COALESCE(r."userAgent", 'Unknown') as user_agent,
          COUNT(*) as request_count
        FROM "RequestLog" r
        WHERE ${dateFilter}
          AND r."path" = '/api/ocr'
          AND r."method" = 'POST'
          AND COALESCE(r."userAgent", 'Unknown') = ${params.userAgent}
        GROUP BY r."path", r."method", user_agent
        ORDER BY request_count DESC
        LIMIT ${limit}
      `;
    } else {
      result = await sql`
        SELECT 
          r."path",
          r."method",
          COALESCE(r."userAgent", 'Unknown') as user_agent,
          COUNT(*) as request_count
        FROM "RequestLog" r
        WHERE ${dateFilter}
          AND r."path" = '/api/ocr'
          AND r."method" = 'POST'
        GROUP BY r."path", r."method", user_agent
        ORDER BY request_count DESC
        LIMIT ${limit}
      `;
    }

    // Calculate proportional token usage for each user agent
    return result.map(row => {
      const requestCount = Number(row.request_count || 0);
      const inputTokens = Math.round(requestCount * avgInputPerRequest);
      const outputTokens = Math.round(requestCount * avgOutputPerRequest);
      const totalTokens = inputTokens + outputTokens;
      const { totalUsd, totalThb } = getOcrCostBreakdown(inputTokens, outputTokens, DEFAULT_USD_TO_THB_RATE);

      return {
        path: row.path || 'Unknown',
        method: row.method || 'Unknown',
        userAgent: row.user_agent,
        requestCount,
        inputTokens,
        outputTokens,
        totalTokens,
        usdCost: totalUsd,
        thbCost: totalThb
      } satisfies OcrPathCost;
    });
  } catch (error) {
    console.error('Error fetching OCR cost by path:', error);
    throw new Error('Failed to fetch OCR path costs');
  }
}

/**
 * Get routes invoked by a specific user agent
 */
export async function getUserAgentRoutes(
  params: { days?: number; startDate?: string; endDate?: string },
  userAgent: string,
  limit: number = 25
): Promise<UserAgentRoute[]> {
  if (!userAgent) {
    return [];
  }

  try {
    const sql = getConnection();
    const dateFilter = buildDateFilter(params);

    const result = await sql`
      SELECT 
        path,
        method,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE "statusCode" >= 200 AND "statusCode" < 300) as success_count,
        COUNT(*) FILTER (WHERE "statusCode" >= 400) as error_count,
        COALESCE(ROUND(AVG("responseTime"), 2), 0) as avg_response_time
      FROM "RequestLog"
      WHERE ${dateFilter}
        AND COALESCE("userAgent", 'Unknown') = ${userAgent}
      GROUP BY path, method
      ORDER BY total_requests DESC
      LIMIT ${limit}
    `;

    return result.map(row => {
      const totalRequests = Number(row.total_requests || 0);
      const successCount = Number(row.success_count || 0);
      const errorCount = Number(row.error_count || 0);
      const successRate = totalRequests > 0 ? Number(((successCount / totalRequests) * 100).toFixed(2)) : 0;
      const errorRate = totalRequests > 0 ? Number(((errorCount / totalRequests) * 100).toFixed(2)) : 0;

      return {
        userAgent,
        path: row.path,
        method: row.method,
        totalRequests,
        successCount,
        errorCount,
        successRate,
        errorRate,
        avgResponseTime: Number(row.avg_response_time || 0)
      } satisfies UserAgentRoute;
    });
  } catch (error) {
    console.error('Error fetching user agent routes:', error);
    throw new Error('Failed to fetch user agent routes');
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const sql = getConnection();
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Close database connection (for cleanup)
 */
export async function closeConnection(): Promise<void> {
  if (sql) {
    await sql.end();
  }
}

