import { NextRequest, NextResponse } from 'next/server';
import { getOcrCostByPath } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const userAgent = searchParams.get('userAgent') || undefined;

    const params: { days?: number; startDate?: string; endDate?: string; userAgent?: string } = {};
    
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (days) {
      params.days = parseInt(days, 10);
    } else {
      params.days = 7;
    }

    if (userAgent) {
      params.userAgent = userAgent;
    }

    const data = await getOcrCostByPath(params, limit);
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}

