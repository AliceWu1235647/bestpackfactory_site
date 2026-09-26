import Script from 'next/script';
import WhatsAppWidget from './WhatsAppWidget';
import GeoAnalytics from './GeoAnalytics';

// content-site/<code>/ 下的翻译页面目录。js/、assets/、css/ 等资源目录不是语言目录。
// 所有页面都是 force-static，headers() 在该模式下返回空值，所以语言只能在浏览器端
// 由 URL 推导。这段脚本同步执行于 <head>，在首次绘制前完成，不影响静态化。
const LOCALE_LANGS = { ar: 'ar', de: 'de', es: 'es', fr: 'fr', ja: 'ja' };

// 阿语启用 rtl，与 content-site/ar/index.html 源码里的 dir="rtl" 声明一致。
// style.css 用的是物理方向属性，css/rtl.css 在 [dir="rtl"] 下把影响阅读流的那些
// （text-align、inline padding/margin、阅读侧的强调边框）镜像回来。
const LOCALE_DIRS = { ar: 'rtl' };

const localeBootstrapScript = `(function(){try{var s=location.pathname.replace(/^\\/+/,"").split("/")[0].toLowerCase();var l=${JSON.stringify(
  LOCALE_LANGS
)},d=${JSON.stringify(
  LOCALE_DIRS
)};var e=document.documentElement;if(l[s]){e.lang=l[s];if(d[s]){e.dir=d[s]}}}catch(_){}})();`;

const googleAnalyticsCandidate = String(process.env.NEXT_PUBLIC_GA_ID || '').trim().toUpperCase();
const googleAnalyticsId = /^G-[A-Z0-9]+$/.test(googleAnalyticsCandidate)
  ? googleAnalyticsCandidate
  : '';

const interFontCss = `@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/inter-v20-latin-400.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`;

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootstrapScript }} />
        <link
          rel="preload"
          href="/fonts/inter-v20-latin-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{ __html: interFontCss }} />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="BestPackFactory LLM summary" />
        <link rel="alternate" type="application/json" href="/ai-index.json" title="BestPackFactory AI index" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="BestPackFactory Packaging Insights" />
        <link rel="stylesheet" href="/css/style.css?v=20260927_overflow_fix1" />
        <link rel="stylesheet" href="/css/i18n.css?v=20260828_i18n1" />
        <link rel="stylesheet" href="/css/rtl.css?v=20260828_rtl1" />
        <style dangerouslySetInnerHTML={{ __html: '.bpf-whatsapp-chat{display:none!important}' }} />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(googleAnalyticsId)});
              `}
            </Script>
            <GeoAnalytics />
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
