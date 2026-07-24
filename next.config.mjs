/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/products/:slug([^/.]+)',
        destination: '/products/:slug.html',
        permanent: true,
      },
      {
        source: '/factory.html',
        destination: '/about.html',
        permanent: true,
      },
      {
        source: '/factory/about-us.html',
        destination: '/about.html',
        permanent: true,
      },
      {
        source: '/industries/coffee-packaging.html',
        destination: '/products/coffee-bags.html',
        permanent: true,
      },
      {
        source: '/materials/corrugated-packaging.html',
        destination: '/products/custom-boxes.html',
        permanent: true,
      },
      {
        source: '/materials/pet-pe-aluminum-film.html',
        destination: '/products/flexible-packaging.html',
        permanent: true,
      },
      {
        source: '/quote-ready-packaging-sourcing-hub.html',
        destination: '/contact.html',
        permanent: true,
      },
      // Technical SEO: Ensure www domain unification (301 Permanent)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'bestpackfactory.com',
          },
        ],
        destination: 'https://www.bestpackfactory.com/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
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
        source: '/brand-profile.json',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/ai-index.json',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/buyer-answer-index.json',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/industry-question-index.json',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/llms.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }
        ]
      },
      {
        source: '/sitemap-index.xml',
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
  }
};

export default nextConfig;
