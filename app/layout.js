import Script from 'next/script';

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'; // Replace via Environment Variable later
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/style.css?v=20260722_visual_fix" />
        <link rel="preload" as="image" href="/assets/hero/slide-01-one-stop.webp" />
        {GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <Script src="/js/main.js?v=20260722" strategy="afterInteractive" />
      </body>
    </html>
  );
}
