import Script from 'next/script';
import { headers } from 'next/headers';
import WhatsAppWidget from './WhatsAppWidget';

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default async function RootLayout({ children }) {
  let lang = 'en';
  let dir = 'ltr';
  try {
    const h = await headers();
    lang = h.get('x-bpf-lang') || 'en';
    dir = h.get('x-bpf-dir') || 'ltr';
  } catch {}
  return (
    <html lang={lang} dir={dir}>
      <head>
        {/* BestPack Factory 紧急速度优化 */}
        <link rel="preconnect" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="dns-prefetch" href="https://formsubmit.co" />
        {/* Self-hosted Inter — fastest for all regions, no Google Fonts dependency */}
        <style dangerouslySetInnerHTML={{ __html: `@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/inter-latin-400.woff2) format('woff2')}@font-face{font-family:'Inter';font-style:normal;font-weight:700;font-display:swap;src:url(/fonts/inter-latin-700.woff2) format('woff2')}` }} />
        <link rel="preload" href="/fonts/inter-latin-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="low" />
        <link rel="preload" href="/fonts/inter-latin-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="low" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="BestPackFactory LLM summary" />
        <link rel="alternate" type="application/json" href="/ai-index.json" title="BestPackFactory AI index" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="BestPackFactory Packaging Insights" />
        <link rel="stylesheet" href="/css/style.css?v=20260820_overflow1" />
        {/* Legacy inline chat box is fully retired; the floating WhatsApp icon widget in WhatsAppWidget.js is the only contact widget. */}
        <style dangerouslySetInnerHTML={{ __html: 'html body .bpf-whatsapp-chat { display: none !important; }' }} />
        {/* hreflang is emitted per-page via generateMetadata alternates.languages (static, correct per path). */}
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <WhatsAppWidget />
        <Script src="/js/main-bootstrap.js?v=20260815_mobile_nav2" strategy="afterInteractive" />
      </body>
    </html>
  );
}
