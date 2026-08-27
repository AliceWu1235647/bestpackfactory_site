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
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
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
      },
      // === 2026-08-20: GSC 404 → new hub pages (permanent 301) ===
      {
        source: '/finishes/soft-touch-packaging.html',
        destination: '/finishes.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/finishes/spot-uv-packaging.html',
        destination: '/finishes.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/finishes/embossing-packaging.html',
        destination: '/finishes.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/materials/recyclable-packaging.html',
        destination: '/materials.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/materials/white-cardboard-packaging.html',
        destination: '/materials.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/food-packaging.html',
        destination: '/industries.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/cosmetic-packaging.html',
        destination: '/industries.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/cannabis-packaging.html',
        destination: '/industries.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/pet-food-packaging.html',
        destination: '/industries.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/gift-packaging.html',
        destination: '/industries.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/products/custom-packaging-boxes.html',
        destination: '/products/custom-boxes.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/news/cannabis-mylar-bag-demand',
        destination: '/blog/cannabis-mylar-bags-b2b-sourcing-guide.html',
        permanent: false,
        statusCode: 301
      },
      // === 2026-08-21: industries duplicate pages → canonical version (301, keyword cannibalization fix) ===
      {
        source: '/industries/coffee-packaging.html',
        destination: '/industries/coffee-packaging-supplier.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/coffee-tea-packaging.html',
        destination: '/industries/coffee-packaging-supplier.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/cosmetics-packaging.html',
        destination: '/industries/cosmetic-packaging-manufacturer.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/pharma-packaging.html',
        destination: '/industries/pharmaceutical-packaging-supplier.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/pharmaceutical-packaging.html',
        destination: '/industries/pharmaceutical-packaging-supplier.html',
        permanent: false,
        statusCode: 301
      },
      {
        source: '/industries/luxury-packaging.html',
        destination: '/industries/luxury-gift-packaging-manufacturer.html',
        permanent: false,
        statusCode: 301
      }
    ];
  }
};

export default nextConfig;
