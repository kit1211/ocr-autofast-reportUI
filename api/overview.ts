import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOverviewStats } from '../src/lib/db';
import { errorResponse, handleCors, parseQueryParams, successResponse } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const params = parseQueryParams(req);
    const overviewStats = await getOverviewStats(params);
    return successResponse(res, overviewStats);
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(res, message, 500);
  }
}

