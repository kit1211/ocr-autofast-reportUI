import { serve } from "bun";
import index from "./index.html";
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
  
  // Custom date range
  if (startDateParam && endDateParam) {
    return { startDate: startDateParam, endDate: endDateParam };
  }
  
  // Days range
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

const server = serve({
  routes: {
    // API Routes
    "/api/health": {
      async GET(req) {
        try {
          const isConnected = await testConnection();
          return successResponse({
            status: 'ok',
            database: isConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return errorResponse('Health check failed', 500);
        }
      }
    },

    "/api/overview": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const overviewStats = await getOverviewStats(params);
          return successResponse(overviewStats);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/endpoints": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const endpointsData = await getEndpointsAnalysis(params);
          return successResponse(endpointsData);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/user-agents": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const userAgentData = await getUserAgentAnalysis(params);
          return successResponse(userAgentData);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/errors": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const errorData = await getErrorBreakdown(params);
          return successResponse(errorData);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/methods": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const methodData = await getMethodStats(params);
          return successResponse(methodData);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/user-agents/compare": {
      async GET(req) {
        try {
          const urlObj = new URL(req.url);
          const params = parseQueryParams(req.url);
          const primaryAgent = urlObj.searchParams.get('primaryAgent');
          const groupOthers = urlObj.searchParams.get('groupOthers') !== 'false';
          const limit = parseInt(urlObj.searchParams.get('limit') || '10', 10);

          if (!primaryAgent) {
            return errorResponse('primaryAgent parameter is required', 400);
          }

          const comparisonData = await getUserAgentComparison(params, primaryAgent, groupOthers, limit);
          return successResponse(comparisonData);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/ocr/summary": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const summary = await getOcrCostSummary(params);
          return successResponse(summary);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/ocr/user-agents": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const urlObj = new URL(req.url);
          const limit = parseInt(urlObj.searchParams.get('limit') || '50', 10);
          const data = await getOcrCostByUserAgent(params, limit);
          return successResponse(data);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/ocr/paths": {
      async GET(req) {
        try {
          const params = parseQueryParams(req.url);
          const urlObj = new URL(req.url);
          const limit = parseInt(urlObj.searchParams.get('limit') || '50', 10);
          const userAgent = urlObj.searchParams.get('userAgent') || undefined;
          const data = await getOcrCostByPath({ ...params, userAgent }, limit);
          return successResponse(data);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    "/api/user-agents/routes": {
      async GET(req) {
        try {
          const urlObj = new URL(req.url);
          const params = parseQueryParams(req.url);
          const userAgent = urlObj.searchParams.get('userAgent');
          const limit = parseInt(urlObj.searchParams.get('limit') || '25', 10);

          if (!userAgent) {
            return errorResponse('userAgent parameter is required', 400);
          }

          const data = await getUserAgentRoutes(params, userAgent, limit);
          return successResponse(data);
        } catch (error) {
          console.error('API Error:', error);
          const message = error instanceof Error ? error.message : 'Internal server error';
          return errorResponse(message, 500);
        }
      }
    },

    // Serve index.html for all unmatched routes (Frontend)
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
console.log(`📊 API Endpoints:`);
console.log(`   - GET ${server.url}api/health`);
console.log(`   - GET ${server.url}api/overview?days=7`);
console.log(`   - GET ${server.url}api/endpoints?days=7`);
console.log(`   - GET ${server.url}api/user-agents?days=7`);
console.log(`   - GET ${server.url}api/user-agents/compare?primaryAgent=...`);
console.log(`   - GET ${server.url}api/user-agents/routes?userAgent=...`);
console.log(`   - GET ${server.url}api/errors?days=7`);
console.log(`   - GET ${server.url}api/methods?days=7`);
console.log(`   - GET ${server.url}api/ocr/summary?days=7`);
console.log(`   - GET ${server.url}api/ocr/user-agents?days=7`);
console.log(`   - GET ${server.url}api/ocr/paths?days=7`);
