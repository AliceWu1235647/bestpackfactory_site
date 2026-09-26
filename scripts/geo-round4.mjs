/**
 * geo-round4.mjs
 * 1. Add customer reviews section to homepage (before certs section)
 * 2. Create content-site/testimonials.html with all 33 reviews
 *
 * Review text stays visible, but no first-party AggregateRating/Review markup is
 * emitted. Google does not show self-serving review rich results for an
 * Organization/LocalBusiness reviewing itself, and provenance must be retained
 * separately before any review markup is reconsidered.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ─── Review data (extracted from Alibaba screenshots) ───────────────────────
const REVIEWS = [
  { id:'r1', initials:'G', name:'G***f', country:'United Kingdom', flag:'🇬🇧', date:'Feb 2026', stars:5,
    text:'Excellent quality boxes that we had designed by Linda! We gave her very small samples of the patterns we wanted on each box and she created beautiful, high quality boxes. We HIGHLY RECOMMEND working with Linda — she is fantastic to work with, and can design exactly what you need to a very high standard. Thank you Linda!' },
  { id:'r2', initials:'R', name:'R***a', country:'United States', flag:'🇺🇸', date:'Jun 2025', stars:5,
    text:'Working with this company was easy and quick, the product arrived very quickly and the quality of the finished product was beyond my expectations. As I transition from my current packaging, I will be ordering more from this supplier. I could not be more satisfied with this purchase or the interactions I have had with this supplier.' },
  { id:'r3', initials:'M', name:'M***.', country:'Spain', flag:'🇪🇸', date:'Mar 2025', stars:5,
    text:'We have chosen this as our provider of boxes for our products, and we are really satisfied with the quality of the goods and the service they provide. It is not the first time we buy, and all the boxes have great quality. Linda is very supportive and always helps us to decide material or design if we are in doubt. Thank you for your great work.' },
  { id:'r4', initials:'D', name:'D***z', country:'United States', flag:'🇺🇸', date:'Dec 2024', stars:5,
    text:'I worked with Mrs. Lisa Wu and it was a very nice experience. She worked fast, answered all my questions promptly, and had a very cheerful attitude. Quality and design were exactly as expected. Delivery took a few days longer than expected, but nothing serious.' },
  { id:'r5', initials:'k', name:'k***i', country:'Italy', flag:'🇮🇹', date:'Dec 2025', stars:5,
    text:'Top, high quality, good material supplier — highly recommended. Good service, professional and always ready with solutions. Delivery very quickly, before the expected date. Creative design and modern ideas, so creative and useful.' },
  { id:'r6', initials:'S', name:'S***S', country:'United Kingdom', flag:'🇬🇧', date:'Jan 2025', stars:5,
    text:'Great products and service. Thanks for all your help Lisa! She took the time out to help with our custom packaging needs and the samples are incredible. Looking forward to the bulk order. Massive thanks to you and all your team!' },
  { id:'r7', initials:'G', name:'G***n', country:'United States', flag:'🇺🇸', date:'Oct 2025', stars:5,
    text:'The boxes are of excellent quality. Design is great and will work perfectly for my needs. Shipping was a bit slow but they all arrived in good shape — I will gladly recommend this company if you need to have customized boxes made.' },
  { id:'r8', initials:'J', name:'J***k', country:'Singapore', flag:'🇸🇬', date:'Sep 2025', stars:5,
    text:'Delivery: very fast — I was so surprised. Quality: exactly the quality I needed, very good. Design: exactly what I asked for — I love it. Service: super helpful, I am very thankful.' },
  { id:'r9', initials:'N', name:'N***v', country:'Germany', flag:'🇩🇪', date:'Apr 2026', stars:5,
    text:'This is not the first time we cooperate and the service is traditionally perfect!' },
  { id:'r10', initials:'S', name:'S***i', country:'Switzerland', flag:'🇨🇭', date:'Jan 2025', stars:5,
    text:'Quality is very high — business cards are very well printed with a perfect glossy finish. Cards for brooches and earrings are perfectly done, round angles are clean, matte finish is great so the jewelry looks bright and shining. These cards have a layer that keeps them rigid.' },
  { id:'r11', initials:'A', name:'A***s', country:'Australia', flag:'🇦🇺', date:'Dec 2025', stars:5,
    text:'Easy experience and fast acting. Packaging is high quality!' },
  { id:'r12', initials:'G', name:'G***f', country:'United Kingdom', flag:'🇬🇧', date:'Oct 2025', stars:5,
    text:'Another order completed exactly as requested! Exceptionally good quality and great communication from Linda! Thank you so much!' },
  { id:'r13', initials:'U', name:'U***l', country:'Saudi Arabia', flag:'🇸🇦', date:'Jun 2025', stars:5,
    text:'The product arrived as requested and was packaged beautifully. Thank you so much!' },
  { id:'r14', initials:'S', name:'S***i', country:'Italy', flag:'🇮🇹', date:'Nov 2025', stars:5,
    text:'Everything as per the production specifications sent, excellent product.' },
  { id:'r15', initials:'j', name:'j***d', country:'United States', flag:'🇺🇸', date:'Sep 2025', stars:5,
    text:'Great quality, professional design. I recommend her to all my business associates.' },
  { id:'r16', initials:'G', name:'G***f', country:'United Kingdom', flag:'🇬🇧', date:'Aug 2025', stars:5,
    text:'Quality: excellent. Design: excellent. Service: excellent. Delivery: excellent — great quality and fast dispatch!' },
  { id:'r17', initials:'S', name:'S***i', country:'Switzerland', flag:'🇨🇭', date:'Mar 2025', stars:5,
    text:'Delivery on time. Quality: fantastic. Design: very good. Service: top and professional.' },
  { id:'r18', initials:'R', name:'R***y', country:'United Kingdom', flag:'🇬🇧', date:'Feb 2025', stars:5,
    text:'Product sample was very well done and they did a great job.' },
  { id:'r19', initials:'k', name:'k***n', country:'United States', flag:'🇺🇸', date:'Feb 2025', stars:5,
    text:'Great product, great customer service. Linda is wonderful to work with!' },
  { id:'r20', initials:'k', name:'k***n', country:'United States', flag:'🇺🇸', date:'Feb 2025', stars:5,
    text:'The posters are great and Linda is great to work with!' },
  { id:'r21', initials:'S', name:'S***S', country:'United Kingdom', flag:'🇬🇧', date:'Jan 2025', stars:5,
    text:'Bulk order was perfect and arrived quicker than I thought. Thanks for all your help Lisa and the whole team. Looking forward to the next order!' },
  { id:'r22', initials:'k', name:'k***n', country:'United States', flag:'🇺🇸', date:'Dec 2024', stars:5,
    text:'Product is great and the customer service from Linda is excellent!' },
  { id:'r23', initials:'y', name:'y***y', country:'Israel', flag:'🇮🇱', date:'Nov 2024', stars:5,
    text:'Were very clear, smooth booking and friendly communication.' },
  { id:'r24', initials:'L', name:'L***o', country:'United States', flag:'🇺🇸', date:'Oct 2024', stars:5,
    text:'Great service from Lisa. Good quality bags. Recommend 100%.' },
  { id:'r25', initials:'K', name:'K***a', country:'Japan', flag:'🇯🇵', date:'Sep 2024', stars:5,
    text:'I ordered a cardboard sample of matte material, which was very scratch resistant and of good quality. The shape was also very helpful in making it easier to assemble.' },
  { id:'r26', initials:'B', name:'B***A', country:'United States', flag:'🇺🇸', date:'Sep 2024', stars:5,
    text:'Colors are vibrant and the packaging came undamaged and extremely well made and taken care of. Hope to order again in the future!' },
  { id:'r27', initials:'A', name:'A***D', country:'United Arab Emirates', flag:'🇦🇪', date:'Jul 2024', stars:5,
    text:'Delivery on time. High quality product. The design is as shown in pictures. The service was excellent.' },
  { id:'r28', initials:'c', name:'c***c', country:'New Zealand', flag:'🇳🇿', date:'Aug 2026', stars:5,
    text:'Thanks so much for the high quality custom box design at a great price — amazing customer service by Linda, they even sent me extra boxes!' },
  { id:'r29', initials:'c', name:'c***c', country:'New Zealand', flag:'🇳🇿', date:'Aug 2026', stars:5,
    text:'Thanks Linda for my custom stickers at a great price — better than expected, high quality. Thanks for the extra stickers as well!' },
  { id:'r30', initials:'M', name:'M***g', country:'United States', flag:'🇺🇸', date:'Jan 2026', stars:5,
    text:'Quality: I love my cards, you guys did a great job and thank you very much!' },
  { id:'r31', initials:'B', name:'B***e', country:'United States', flag:'🇺🇸', date:'Jan 2026', stars:5,
    text:'Super happy with these custom greeting cards! The cardstock is thick and durable, the print is crisp, and the simple design lets my message take center stage. Perfect for my small business.' },
  { id:'r32', initials:'B', name:'B***e', country:'United States', flag:'🇺🇸', date:'Jan 2026', stars:5,
    text:'Perfect for adding a personal touch to my packages. I\'ll be a repeat customer for sure.' },
  { id:'r33', initials:'S', name:'S***S', country:'United Kingdom', flag:'🇬🇧', date:'Jan 2025', stars:5,
    text:'Great products and service. Thanks for all your help Lisa! She took the time to help with our custom packaging needs and the samples are incredible. Looking forward to the bulk order.' },
];

// 8 featured reviews for homepage (most detailed and diverse)
const FEATURED_IDS = ['r1','r2','r3','r4','r5','r7','r8','r10'];
const FEATURED = REVIEWS.filter(r => FEATURED_IDS.includes(r.id));

function starHTML(n) { return '★'.repeat(n); }

function reviewCard(r, compact=false) {
  const textLimit = compact ? 180 : 99999;
  const text = r.text.length > textLimit ? r.text.slice(0,textLimit)+'…' : r.text;
  const avatarColors = {G:'#1d4ed8',R:'#059669',M:'#7c3aed',D:'#dc2626',k:'#d97706',S:'#0891b2',J:'#065f46',N:'#9333ea',A:'#ea580c',U:'#be185d',j:'#475569',L:'#15803d',K:'#b45309',B:'#7c2d12',c:'#4338ca',y:'#0f766e'};
  const bg = avatarColors[r.initials] || '#374151';
  return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
<div style="color:#f59e0b;font-size:1.05rem;letter-spacing:1px;">${starHTML(r.stars)}</div>
<p style="font-size:0.875rem;color:#374151;line-height:1.65;flex:1;margin:0;">"${text}"</p>
<div style="border-top:1px solid #f3f4f6;padding-top:0.75rem;display:flex;align-items:center;gap:0.6rem;">
<div style="width:34px;height:34px;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;flex-shrink:0;">${r.initials.toUpperCase()}</div>
<div style="min-width:0;">
<div style="font-size:0.8rem;font-weight:600;color:#1a1a2e;">${r.name}</div>
<div style="font-size:0.75rem;color:#6b7280;">${r.flag} ${r.country} · Verified Purchase</div>
</div>
<div style="margin-left:auto;font-size:0.72rem;color:#9ca3af;white-space:nowrap;">${r.date}</div>
</div>
</div>`;
}

// ─── 1. HOMEPAGE: keep review text visible without self-serving rating schema ─
{
  const filePath = path.join(root, 'content-site', 'index.html');
  let h = fs.readFileSync(filePath, 'utf8');

  h = h.replace(/\s*"aggregateRating"\s*:\s*\{[^{}]*\}\s*,?/, '\n  ');
  console.log('✓ homepage: self-serving AggregateRating schema absent');

  // 2. Add reviews section before certs section
  if (h.includes('customer-reviews-section')) {
    console.log('SKIP homepage: reviews section already present');
  } else {
    const reviewCards = FEATURED.map(r => `<div style="flex:1 1 280px;max-width:480px;">${reviewCard(r,true)}</div>`).join('\n');
    const reviewsSection = `<section class="section customer-reviews-section" style="padding:2.5rem 1.5rem;background:#fff;">
<div style="max-width:960px;margin:0 auto;">
<div style="text-align:center;margin-bottom:2rem;">
<div class="eyebrow">Verified Buyers</div>
<h2 style="font-size:1.35rem;margin-bottom:0.4rem;">What B2B Buyers Say</h2>
<div style="display:inline-flex;align-items:center;gap:0.75rem;background:#fffbeb;border:1px solid #fde68a;border-radius:99px;padding:0.4rem 1rem;font-size:0.88rem;color:#92400e;">
<span style="color:#f59e0b;font-size:1rem;letter-spacing:1px;">★★★★★</span>
<strong>4.9 / 5</strong>
<span style="color:#b45309;">66 verified purchases on Alibaba</span>
<span style="color:#b45309;">·</span>
<span>Service 5.0 &nbsp;|&nbsp; Quality 4.9 &nbsp;|&nbsp; Shipping 4.8</span>
</div>
</div>
<div style="display:flex;flex-wrap:wrap;gap:1rem;">
${reviewCards}
</div>
<div style="text-align:center;margin-top:1.5rem;">
<a href="/testimonials.html" style="color:#2563eb;font-size:0.875rem;text-decoration:none;">Read all 33 verified reviews →</a>
</div>
</div>
</section>
`;
    const insertBefore = '<section class="section certs-trust-section"';
    const idx = h.indexOf(insertBefore);
    if (idx === -1) throw new Error('certs-trust-section not found');
    h = h.slice(0, idx) + reviewsSection + h.slice(idx);
    console.log('✓ homepage: customer reviews section added');
  }

  fs.writeFileSync(filePath, h, 'utf8');
}

// ─── 3. CREATE testimonials.html ─────────────────────────────────────────────
{
  const filePath = path.join(root, 'content-site', 'testimonials.html');
  if (fs.existsSync(filePath)) {
    console.log('SKIP: testimonials.html already exists');
  } else {
    // Base head on samples.html
    const samplesRef = fs.readFileSync(path.join(root, 'content-site', 'samples.html'), 'utf8');
    const headEnd = samplesRef.indexOf('</head>');
    let head = samplesRef.slice(0, headEnd);
    // Replace title, description, canonical, og tags
    head = head
      .replace(/<title>[^<]+<\/title>/, '<title>Customer Reviews &amp; Testimonials | BestPackFactory</title>')
      .replace(/<meta name="description" content="[^"]+"\/>/, '<meta name="description" content="66 verified B2B buyer reviews for BestPackFactory — 4.9★ on Alibaba. Custom boxes, pouches, bags and labels shipped to 30+ countries. MOQ 500 PCS."/>')
      .replace(/<link rel="canonical" href="[^"]+"\/>/, '<link rel="canonical" href="https://www.bestpackfactory.com/testimonials.html"/>')
      .replace(/<link rel="alternate" hrefLang="en" href="[^"]+"\/>/, '<link rel="alternate" hrefLang="en" href="https://www.bestpackfactory.com/testimonials.html"/>')
      .replace(/<link rel="alternate" hrefLang="x-default" href="[^"]+"\/>/, '<link rel="alternate" hrefLang="x-default" href="https://www.bestpackfactory.com/testimonials.html"/>')
      .replace(/<link rel="alternate" hrefLang="de" href="[^"]+"\/>/, '')
      .replace(/<link rel="alternate" hrefLang="fr" href="[^"]+"\/>/, '')
      .replace(/<link rel="alternate" hrefLang="es" href="[^"]+"\/>/, '')
      .replace(/<link rel="alternate" hrefLang="ja" href="[^"]+"\/>/, '')
      .replace(/<link rel="alternate" hrefLang="ar" href="[^"]+"\/>/, '')
      .replace(/(<meta property="og:title" content=")[^"]+(")/,  '$1Customer Reviews &amp; Testimonials | BestPackFactory$2')
      .replace(/(<meta property="og:description" content=")[^"]+(")/,  '$1Real B2B buyer reviews for BestPackFactory — 4.9★ on Alibaba (66 verified purchases). Ships to 30+ countries.$2')
      .replace(/(<meta property="og:url" content=")[^"]+(")/,  '$1https://www.bestpackfactory.com/testimonials.html$2')
      .replace(/(<meta name="twitter:title" content=")[^"]+(")/,  '$1Customer Reviews &amp; Testimonials | BestPackFactory$2')
      .replace(/(<meta name="twitter:description" content=")[^"]+(")/,  '$1Real B2B buyer reviews for BestPackFactory — 4.9★ on Alibaba (66 verified purchases).$2');

    const allCards = REVIEWS.map(r => `<div style="break-inside:avoid;margin-bottom:1rem;">${reviewCard(r,false)}</div>`).join('\n');

    const page = `${head}</head><body><div hidden=""><!--$--><!--/$--></div><div><header class="site-header-blog"><a class="header-logo" href="/index.html">BestPack<span>Factory</span></a><nav class="header-nav"><a href="/products.html">Products</a><a href="industries.html">Industries</a><a href="/blog.html">Blog</a><a href="/contact.html">Contact</a></nav></header>
<main class="blog-post-main"><article class="blog-article">
<h1>Customer Reviews &amp; Testimonials</h1>
<p class="blog-meta">BestPackFactory · 4.9★ · 66 verified purchases on Alibaba International · Buyers from 30+ countries</p>
<p class="answer-first-snippet"><strong>4.9 out of 5 stars</strong> — based on 66 verified B2B buyer reviews for <a href="https://www.bestpackfactory.com/">BestPackFactory</a> (Shenzhen Color Printing Paper Packaging Co., Ltd.) on Alibaba International. Service rated 5.0 · Quality rated 4.9 · Shipping rated 4.8. Reviews from buyers in the United States, United Kingdom, Germany, Spain, Italy, Switzerland, Australia, Singapore, Japan, New Zealand, Saudi Arabia, Israel, UAE and more.</p>
<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:1.25rem 1.5rem;margin:1.5rem 0;display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;">
<div style="text-align:center;min-width:90px;">
<div style="font-size:2.5rem;font-weight:800;color:#1a1a2e;line-height:1;">4.9</div>
<div style="color:#f59e0b;font-size:1.1rem;letter-spacing:1px;">★★★★★</div>
<div style="font-size:0.75rem;color:#78350f;margin-top:0.2rem;">66 reviews</div>
</div>
<div style="border-left:1px solid #fde68a;padding-left:1.25rem;display:flex;flex-direction:column;gap:0.4rem;">
<div style="font-size:0.85rem;color:#78350f;"><strong>Service</strong>&nbsp;&nbsp;★★★★★ 5.0</div>
<div style="font-size:0.85rem;color:#78350f;"><strong>Quality</strong>&nbsp;&nbsp;★★★★★ 4.9</div>
<div style="font-size:0.85rem;color:#78350f;"><strong>Shipping</strong>&nbsp;&nbsp;★★★★☆ 4.8</div>
</div>
<div style="border-left:1px solid #fde68a;padding-left:1.25rem;font-size:0.82rem;color:#92400e;line-height:1.6;">
Verified purchases only · Alibaba International<br/>
30 reviews from United States · 8 from United Kingdom<br/>
Italy, Germany, Spain, Switzerland and 8 more countries
</div>
</div>
<h2>All Verified Reviews</h2>
<div style="columns:1;gap:1rem;">
${allCards}
</div>
<p class="blog-cta"><a class="btn-cta" href="/contact.html">Request a quote →</a></p>
</article></main>
<footer class="site-footer-blog"><p>© 2026 BestPackFactory · <a href="/contact.html">lisa@colorprintingpackage.com</a> · WhatsApp +86 158 8653 0985</p></footer></div><script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.bestpackfactory.com/"},{"@type":"ListItem","position":2,"name":"Customer Reviews &amp; Testimonials"}]}</script></body></html>`;

    fs.writeFileSync(filePath, page, 'utf8');
    console.log('✓ testimonials.html created with', REVIEWS.length, 'reviews');
  }
}

console.log('\nGEO Round 4 applied.');
