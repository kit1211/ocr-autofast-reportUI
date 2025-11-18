import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ApiResponse } from '../src/types/analytics';

/**
 * Parse query parameters from URL
 */
export function parseQueryParams(req: VercelRequest): { days?: number; startDate?: string; endDate?: string } {
  const daysParam = req.query.days as string | undefined;
  const startDateParam = req.query.startDate as string | undefined;
  const endDateParam = req.query.endDate as string | undefined;
  
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
export function successResponse<T>(res: VercelResponse, data: T): VercelResponse {
  return res.status(200).json({ success: true, data } as ApiResponse<T>);
}

/**
 * Create error response
 */
export function errorResponse(res: VercelResponse, message: string, status: number = 500): VercelResponse {
  return res.status(status).json({ success: false, error: message } as ApiResponse<never>);
}

/**
 * Handle CORS preflight
 */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

