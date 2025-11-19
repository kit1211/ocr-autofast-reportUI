// Exchange Rate Service (Server-side only)
import type { ExchangeRateData } from '@/types/exchange-rate';

const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';
const DEFAULT_RATE = 35;
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

// In-memory cache
let cachedRate: { data: ExchangeRateData; timestamp: number } | null = null;

/**
 * Fetch current USD to THB exchange rate
 * Returns cached value if less than 1 hour old
 */
export async function getExchangeRate(): Promise<ExchangeRateData> {
  // Check cache first
  if (cachedRate && (Date.now() - cachedRate.timestamp) < CACHE_DURATION) {
    return cachedRate.data;
  }

  try {
    const response = await fetch(EXCHANGE_RATE_API_URL, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 'success' || !data.rates || !data.rates.THB) {
      throw new Error('Invalid exchange rate data');
    }

    const rateData: ExchangeRateData = {
      rate: data.rates.THB,
      lastUpdate: data.time_last_update_utc,
      nextUpdate: data.time_next_update_utc,
      source: data.provider
    };

    // Update cache
    cachedRate = {
      data: rateData,
      timestamp: Date.now()
    };

    return rateData;
  } catch (error) {
    console.error('Exchange rate API error:', error);
    
    // Return cached data if available, even if expired
    if (cachedRate) {
      return cachedRate.data;
    }

    // Final fallback
    return {
      rate: DEFAULT_RATE,
      lastUpdate: new Date().toUTCString(),
      nextUpdate: new Date(Date.now() + CACHE_DURATION).toUTCString(),
      source: 'fallback (error)'
    };
  }
}

/**
 * Get exchange rate synchronously (use cached value)
 */
export function getCachedExchangeRate(): number {
  return cachedRate?.data.rate || DEFAULT_RATE;
}

