import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format bytes to human-readable format (KB, MB, GB, TB)
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format milliseconds to human-readable format
 * @param ms - Milliseconds
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format currency values
 * @param amount - numeric value
 * @param currency - currency code (THB, USD, etc.)
 * @param locale - optional locale override
 */
export function formatCurrency(amount: number, currency: string = 'THB', locale?: string): string {
  const resolvedLocale = locale || (currency === 'THB' ? 'th-TH' : 'en-US');
  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
}

/**
 * Get color based on status code
 * @param statusCode - HTTP status code
 */
export function getStatusColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return 'text-green-600';
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'text-yellow-600';
  } else if (statusCode >= 500) {
    return 'text-red-600';
  }
  return 'text-gray-600';
}

/**
 * Get background color based on status code
 * @param statusCode - HTTP status code
 */
export function getStatusBgColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return 'bg-green-100';
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'bg-yellow-100';
  } else if (statusCode >= 500) {
    return 'bg-red-100';
  }
  return 'bg-gray-100';
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get chart color based on status code range
 * @param statusCode - HTTP status code
 */
export function getChartColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) {
    return '#22c55e'; // green-500
  } else if (statusCode >= 400 && statusCode < 500) {
    return '#f59e0b'; // amber-500
  } else if (statusCode >= 500) {
    return '#ef4444'; // red-500
  }
  return '#6b7280'; // gray-500
}
