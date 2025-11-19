import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features for Bun compatibility
  experimental: {
    // Optimize for Bun runtime
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Webpack configuration (Bun uses this for bundling)
  webpack: (config) => {
    // Add any custom webpack config if needed
    return config;
  },
  
  // Output configuration
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Compression
  compress: true,
};

export default nextConfig;

