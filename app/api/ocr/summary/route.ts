import { NextRequest, NextResponse } from 'next/server';
import { getOcrCostSummary } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const params: { days?: number; startDate?: string; endDate?: string } = {};
    
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (days) {
      params.days = parseInt(days, 10);
    } else {
      params.days = 7;
    }

    const data = await getOcrCostSummary(params);
    
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

