import Script from 'next/script';
import { OrganizationSchema, WebSiteSchema } from '../lib/seo-components';

export const metadata = {
  metadataBase: new URL('https://bestpackfactory.com'),
  title: {
    default: 'BestPackFactory | B2B Custom Packaging Manufacturer',
    template: '%s | BestPackFactory'
  },
  description: 'Global B2B custom packaging manufacturer. MOQ 500 PCS. Specialized in custom boxes, coffee bags, flexible packaging, and pharmaceutical cartons.',
  alternates: {
    canonical: './'
  },
  openGraph: {
    title: 'BestPackFactory | Custom Packaging Solutions',
    description: 'Premier B2B packaging supplier offering factory-direct custom solutions with MOQ 500 PCS.',
    url: 'https://bestpackfactory.com',
    siteName: 'BestPackFactory',
    images: [
      {
        url: '/assets/hero/slide-01-one-stop.webp',
        width: 1200,
        height: 630,
        alt: 'BestPackFactory Showcase'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BestPackFactory | B2B Custom Packaging',
    description: 'Factory-direct custom packaging solutions for global brands. MOQ 500 PCS.',
    images: ['/assets/hero/slide-01-one-stop.webp'],
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/style.css?v=25.1" />
        <link rel="preload" as="image" href="/assets/hero/slide-01-mobile.webp" media="(max-width: 640px)" fetchpriority="high" />
        <link rel="preload" as="image" href="/assets/hero/slide-01-one-stop-scene.webp" media="(min-width: 641px)" fetchpriority="high" />
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <Script src="/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
