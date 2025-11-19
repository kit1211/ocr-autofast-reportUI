export const OPENROUTER_OCR_PRICING = {
  inputPerMillion: 0.3,  // USD per 1M input tokens
  outputPerMillion: 2.5  // USD per 1M output tokens
};

export const DEFAULT_USD_TO_THB_RATE = 35;

export function calculateOcrUsdCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * OPENROUTER_OCR_PRICING.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * OPENROUTER_OCR_PRICING.outputPerMillion;
  return Number((inputCost + outputCost).toFixed(6));
}

export function convertUsdToThb(usd: number, rate: number = DEFAULT_USD_TO_THB_RATE): number {
  return Number((usd * rate).toFixed(2));
}

export interface OcrCostBreakdown {
  totalUsd: number;
  totalThb: number;
}

export function getOcrCostBreakdown(
  inputTokens: number,
  outputTokens: number,
  rate: number = DEFAULT_USD_TO_THB_RATE
): OcrCostBreakdown {
  const totalUsd = calculateOcrUsdCost(inputTokens, outputTokens);
  const totalThb = convertUsdToThb(totalUsd, rate);
  return { totalUsd, totalThb };
}

