import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserAgentRoutes } from '../../src/lib/db';
import { errorResponse, handleCors, parseQueryParams, successResponse } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const params = parseQueryParams(req);
    const userAgent = req.query.userAgent as string | undefined;
    const limit = parseInt((req.query.limit as string) || '25', 10);

    if (!userAgent) {
      return errorResponse(res, 'userAgent parameter is required', 400);
    }

    const data = await getUserAgentRoutes(params, userAgent, limit);
    return successResponse(res, data);
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(res, message, 500);
  }
}

