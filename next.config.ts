// next.config.ts

import type { NextConfig } from 'next';
// Import the bundle analyzer
import withBundleAnalyzer from '@next/bundle-analyzer';

// Your original Next.js configuration
const nextConfig: NextConfig = {
  // Server external packages (moved from experimental)
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // PWA Configuration
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Environment variables that should be available on the client side
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '3W',
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Headers for security
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  redirects: async () => {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
};

// Create the analyzer wrapper with its configuration
const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Export the wrapped configuration
export default analyzer(nextConfig);
