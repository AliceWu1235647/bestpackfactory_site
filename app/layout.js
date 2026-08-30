import Script from 'next/script';
import WhatsAppWidget from './WhatsAppWidget';

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

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeBootstrapScript }} />
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
