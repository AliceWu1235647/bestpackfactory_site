import Script from 'next/script';
import { headers } from 'next/headers';

const RTL_LANGS = new Set(['ar']);

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default async function RootLayout({ children }) {
  const hdrs = await headers();
  const lang = hdrs.get('x-lang') || 'en';
  const dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
  const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || '';
  const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';
  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/css/style.css?v=20260901_gridfix4" />
        <style dangerouslySetInnerHTML={{ __html: '.bpf-whatsapp-chat{display:none!important}body .grid .product-card img{object-fit:cover!important;aspect-ratio:4/3!important;height:auto!important;max-height:none!important;padding:0!important;background:#f8f9f7!important}@media(max-width:980px){body .grid .product-card img{object-fit:cover!important;aspect-ratio:4/3!important;height:auto!important;max-height:none!important;padding:0!important}}@media(max-width:640px){body .grid .product-card img{object-fit:cover!important;aspect-ratio:4/3!important;height:auto!important;max-height:none!important;padding:0!important}}' }} />
        {GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        )}
        {GA_ID && (
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
        {CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        )}
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <Script src="/js/main.js?v=20260724_speed_lazy_search" strategy="lazyOnload" />
        <Script id="bpf-grid-img-fix" strategy="afterInteractive">{`(function(){function fix(){document.querySelectorAll('.grid .product-card img').forEach(function(img){img.style.setProperty('object-fit','cover','important');img.style.setProperty('aspect-ratio','4/3','important');img.style.setProperty('height','auto','important');img.style.setProperty('max-height','none','important');img.style.setProperty('padding','0','important');img.style.setProperty('background','#f8f9f7','important');});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fix);}else{fix();}setTimeout(fix,500);setTimeout(fix,2000);})()`}</Script>
      </body>
    </html>
  );
}
