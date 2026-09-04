import Script from 'next/script';
import WhatsAppWidget from './WhatsAppWidget';

const googleAnalyticsCandidate = String(process.env.NEXT_PUBLIC_GA_ID || '').trim().toUpperCase();
const googleAnalyticsId = /^G-[A-Z0-9]+$/.test(googleAnalyticsCandidate)
  ? googleAnalyticsCandidate
  : '';

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* BestPack Factory 紧急速度优化 */}
        <link rel="preconnect" href="https://wa.me" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="bpf-inter-font-stylesheet"
          rel="preload"
          as="style"
          fetchPriority="low"
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: '(function(){var a=document.getElementById("bpf-inter-font-stylesheet");if(a){a.onload=function(){this.onload=null;this.rel="stylesheet"}}})();'
          }}
        />
        <noscript dangerouslySetInnerHTML={{ __html: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">' }} />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="BestPackFactory LLM summary" />
        <link rel="alternate" type="application/json" href="/ai-index.json" title="BestPackFactory AI index" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="BestPackFactory Packaging Insights" />
        <link rel="stylesheet" href="/css/style.css?v=20260816_blog_detail2" />
        <style dangerouslySetInnerHTML={{ __html: '.bpf-whatsapp-chat{display:none!important}' }} />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(googleAnalyticsId)});
              `}
            </Script>
          </>
        ) : null}
        <WhatsAppWidget />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: '.bpf-whatsapp-chat{display:none!important}' }} />
        </noscript>
        <Script src="/js/main-bootstrap.js?v=20260815_mobile_nav2" strategy="afterInteractive" />
      </body>
    </html>
  );
}
