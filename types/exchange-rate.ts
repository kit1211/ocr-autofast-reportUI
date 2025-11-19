// Exchange Rate API Types

export interface ExchangeRateResponse {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  time_eol_unix: number;
  base_code: string;
  rates: {
    USD: number;
    THB: number;
    [key: string]: number;
  };
}

export interface ExchangeRateData {
  rate: number;
  lastUpdate: string;
  nextUpdate: string;
  source: string;
}

