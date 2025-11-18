import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserAgentComparison } from '../../src/lib/db';
import { errorResponse, handleCors, parseQueryParams, successResponse } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const params = parseQueryParams(req);
    const primaryAgent = req.query.primaryAgent as string | undefined;
    const groupOthers = req.query.groupOthers !== 'false';
    const limit = parseInt((req.query.limit as string) || '10', 10);

    if (!primaryAgent) {
      return errorResponse(res, 'primaryAgent parameter is required', 400);
    }

    const comparisonData = await getUserAgentComparison(params, primaryAgent, groupOthers, limit);
    return successResponse(res, comparisonData);
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(res, message, 500);
  }
}

