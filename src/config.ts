// Configuration for Frontend
// This file handles environment-specific settings

/**
 * Get API Base URL based on current environment
 * Development: http://localhost:3001
 * Production: Can be configured via build-time or window object
 */
export function getApiBaseUrl(): string {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // Production: use same origin or custom URL
    const hostname = window.location.hostname;
    
    // If on localhost, use port 3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Production: use same host with different port or subdomain
    // Customize this based on your production setup
    return `${window.location.protocol}//${hostname}:3001`;
    
    // Or use subdomain:
    // return `${window.location.protocol}//api.${hostname}`;
  }
  
  // Fallback (shouldn't happen in browser context)
  return 'http://localhost:3001';
}

// Export as constant for convenience
export const API_BASE_URL = getApiBaseUrl();

// Other configuration options
export const config = {
  API_BASE_URL: getApiBaseUrl(),
  DEFAULT_DAYS: 7,
  MAX_CUSTOM_DAYS: 365,
  REFRESH_INTERVAL: 60000, // 60 seconds
  REQUEST_TIMEOUT: 30000, // 30 seconds
};

