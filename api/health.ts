import type { VercelRequest, VercelResponse } from '@vercel/node';
import { testConnection } from '../src/lib/db';
import { errorResponse, handleCors, successResponse } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  try {
    const isConnected = await testConnection();
    return successResponse(res, {
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return errorResponse(res, 'Health check failed', 500);
  }
}

