/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable experimental features if needed
  },
  images: {
    domains: ['images.clerk.dev'], // Allow Clerk user images
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        // Allow mobile app deep linking
        source: '/pay',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'lovelock://',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/pricing/:plan',
        destination: '/pricing?plan=:plan',
        permanent: false,
      },
      {
        source: '/subscribe/:plan',
        destination: '/pay?plan=:plan',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig