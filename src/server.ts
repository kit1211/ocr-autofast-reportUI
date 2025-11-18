import type { ApiResponse } from './types/analytics';
import {
  getOverviewStats,
  getEndpointsAnalysis,
  getUserAgentAnalysis,
  getErrorBreakdown,
  getMethodStats,
  getUserAgentComparison,
  getOcrCostSummary,
  getOcrCostByUserAgent,
  getOcrCostByPath,
  getUserAgentRoutes,
  testConnection
} from './lib/db';

const PORT = process.env.API_PORT || process.env.PORT || 3001;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Parse query parameters from URL
 */
function parseQueryParams(url: string): { days?: number; startDate?: string; endDate?: string } {
  const urlObj = new URL(url);
  const daysParam = urlObj.searchParams.get('days');
  const startDateParam = urlObj.searchParams.get('startDate');
  const endDateParam = urlObj.searchParams.get('endDate');

  if (startDateParam && endDateParam) {
    return { startDate: startDateParam, endDate: endDateParam };
  }

  const days = daysParam ? parseInt(daysParam, 10) : 7;
  if (isNaN(days) || days < 1) {
    return { days: 7 };
  }
  
  return { days };
}

/**
 * Create success response
 */
function successResponse<T>(data: T): Response {
  return new Response(
    JSON.stringify({ success: true, data } as ApiResponse<T>),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Create error response
 */
function errorResponse(message: string, status: number = 500): Response {
  return new Response(
    JSON.stringify({ success: false, error: message } as ApiResponse<never>),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}

/**
 * Handle OPTIONS request for CORS
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * Main request handler
 */
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }
  
  try {
    // Parse query parameters
    const params = parseQueryParams(req.url);
    const urlObj = new URL(req.url);
    
    // Route handling
    switch (pathname) {
      case '/api/health':
        const isConnected = await testConnection();
        return successResponse({
          status: 'ok',
          database: isConnected ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        });
      
      case '/api/overview':
        const overviewStats = await getOverviewStats(params);
        return successResponse(overviewStats);
      
      case '/api/endpoints':
        const endpointsData = await getEndpointsAnalysis(params);
        return successResponse(endpointsData);
      
      case '/api/user-agents':
        const userAgentData = await getUserAgentAnalysis(params);
        return successResponse(userAgentData);

      case '/api/user-agents/compare': {
        const primaryAgent = urlObj.searchParams.get('primaryAgent');
        const groupOthers = urlObj.searchParams.get('groupOthers') !== 'false';
        const limit = parseInt(urlObj.searchParams.get('limit') || '10', 10);

        if (!primaryAgent) {
          return errorResponse('primaryAgent parameter is required', 400);
        }

        const comparisonData = await getUserAgentComparison(params, primaryAgent, groupOthers, limit);
        return successResponse(comparisonData);
      }

      case '/api/user-agents/routes': {
        const userAgent = urlObj.searchParams.get('userAgent');
        const limit = parseInt(urlObj.searchParams.get('limit') || '25', 10);

        if (!userAgent) {
          return errorResponse('userAgent parameter is required', 400);
        }

        const routes = await getUserAgentRoutes(params, userAgent, limit);
        return successResponse(routes);
      }
      
      case '/api/errors':
        const errorData = await getErrorBreakdown(params);
        return successResponse(errorData);
      
      case '/api/methods':
        const methodData = await getMethodStats(params);
        return successResponse(methodData);

      case '/api/ocr/summary': {
        const summary = await getOcrCostSummary(params);
        return successResponse(summary);
      }

      case '/api/ocr/user-agents': {
        const limit = parseInt(urlObj.searchParams.get('limit') || '50', 10);
        const userAgent = urlObj.searchParams.get('userAgent') || undefined;
        const data = await getOcrCostByUserAgent({ ...params, userAgent }, limit);
        return successResponse(data);
      }

      case '/api/ocr/paths': {
        const limit = parseInt(urlObj.searchParams.get('limit') || '50', 10);
        const userAgent = urlObj.searchParams.get('userAgent') || undefined;
        const data = await getOcrCostByPath({ ...params, userAgent }, limit);
        return successResponse(data);
      }
      
      default:
        return errorResponse('Not found', 404);
    }
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 500);
  }
}

/**
 * Start the server
 */
const server = Bun.serve({
  port: PORT,
  fetch: handleRequest,
  error(error) {
    console.error('Server error:', error);
    return errorResponse('Internal server error', 500);
  }
});

console.log(`🚀 API Server running at http://localhost:${server.port}`);
console.log(`📊 Endpoints available:`);
console.log(`   - GET /api/health`);
console.log(`   - GET /api/overview?days=7`);
console.log(`   - GET /api/endpoints?days=7`);
console.log(`   - GET /api/user-agents?days=7`);
console.log(`   - GET /api/user-agents/compare?primaryAgent=...`);
console.log(`   - GET /api/user-agents/routes?userAgent=...`);
console.log(`   - GET /api/errors?days=7`);
console.log(`   - GET /api/methods?days=7`);
console.log(`   - GET /api/ocr/summary?days=7`);
console.log(`   - GET /api/ocr/user-agents?days=7`);
console.log(`   - GET /api/ocr/paths?days=7`);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  server.stop();
  process.exit(0);
});

