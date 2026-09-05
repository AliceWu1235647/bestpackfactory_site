/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  // Keep Windows LAN-host builds stable while Ollama is holding a local model in memory.
  experimental: {
    cpus: 1
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'www.bestpackfactory.com', pathname: '/**' },
      { protocol: 'https', hostname: 'bestpackfactory.com', pathname: '/**' },
      { protocol: 'https', hostname: 'pub-*.r2.dev', pathname: '/**' }
    ],
    unoptimized: false
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/css/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/js/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/:path*.json',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/:path*.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/:path*.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/:path*.html',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' }
        ]
      },
      {
        source: '/api/revalidate',
        headers: [
          { key: 'Cache-Control', value: 'no-store' }
        ]
      },
      {
        source: '/api/products-search',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/index',
        destination: '/',
        permanent: true
      },
      {
        source: '/contact',
        destination: '/contact.html',
        permanent: true
      },
      {
        source: '/products/magnetic-gift-boxes',
        destination: '/products/luxury-magnetic-boxes.html',
        permanent: true
      },
      {
        source: '/products/magnetic-gift-boxes.html',
        destination: '/products/luxury-magnetic-boxes.html',
        permanent: true
      },
      {
        source: '/products/rigid-boxes',
        destination: '/products/custom-rigid-boxes.html',
        permanent: true
      },
      {
        source: '/products/rigid-boxes.html',
        destination: '/products/custom-rigid-boxes.html',
        permanent: true
      },
      {
        source: '/products/paper-bags',
        destination: '/products/paper-bags.html',
        permanent: true
      },
      {
        source: '/products/custom-paper-bags',
        destination: '/products/paper-bags.html',
        permanent: true
      },
      {
        source: '/products/custom-paper-bags.html',
        destination: '/products/paper-bags.html',
        permanent: true
      },
      {
        source: '/products/stand-up-pouches',
        destination: '/products/custom-stand-up-pouches.html',
        permanent: true
      },
      {
        source: '/products/stand-up-pouches.html',
        destination: '/products/custom-stand-up-pouches.html',
        permanent: true
      },
      {
        source: '/products/custom-stand-up-pouches',
        destination: '/products/custom-stand-up-pouches.html',
        permanent: true
      },
      {
        source: '/products/food-packaging',
        destination: '/products/food-packaging.html',
        permanent: true
      },
      {
        source: '/products/custom-food-packaging',
        destination: '/products/food-packaging.html',
        permanent: true
      },
      {
        source: '/products/custom-food-packaging.html',
        destination: '/products/food-packaging.html',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
