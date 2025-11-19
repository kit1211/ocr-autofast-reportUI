import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache for 1 hour (3600 seconds)
export const revalidate = 3600;

const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';

export async function GET() {
  try {
    const response = await fetch(EXCHANGE_RATE_API_URL, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 'success' || !data.rates || !data.rates.THB) {
      throw new Error('Invalid exchange rate data');
    }

    return NextResponse.json({
      success: true,
      data: {
        rate: data.rates.THB,
        lastUpdate: data.time_last_update_utc,
        nextUpdate: data.time_next_update_utc,
        source: data.provider
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Exchange rate API error:', error);
    
    // Fallback to default rate if API fails
    return NextResponse.json({
      success: true,
      data: {
        rate: 35, // Fallback rate
        lastUpdate: new Date().toUTCString(),
        nextUpdate: new Date(Date.now() + 3600000).toUTCString(),
        source: 'fallback'
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  }
}

