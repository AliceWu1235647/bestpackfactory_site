import Script from 'next/script';

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="preload" as="image" href="/assets/hero/slide-01-one-stop.webp" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <Script src="/js/main.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
