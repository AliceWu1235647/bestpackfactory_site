const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('https://www.bestpackfactory.com/?v=desktop-visual-guard-20260712', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const rect = el => { const r = el.getBoundingClientRect(); return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; };
    const hero = document.querySelector('.hero.hero-image-carousel.bpf-layered-carousel');
    const frame = document.querySelector('.hero-frame');
    const trust = document.querySelector('.trust');
    const trustCards = Array.from(document.querySelectorAll('.trust-card')).map(rect);
    const grid = document.querySelector('body > .section > .grid');
    const productCards = Array.from(document.querySelectorAll('body > .section > .grid > .product-card')).slice(0,4).map(rect);
    const chat = document.querySelector('.bpf-whatsapp-chat');
    const gridStyle = grid ? getComputedStyle(grid).gridTemplateColumns : '';
    const trustStyle = trust ? getComputedStyle(trust).gridTemplateColumns : '';
    return {
      hero: hero ? rect(hero) : null,
      frame: frame ? rect(frame) : null,
      trust: trust ? rect(trust) : null,
      trustCards,
      gridStyle,
      firstFourProductCards: productCards,
      chat: chat ? rect(chat) : null,
      chatDisplay: chat ? getComputedStyle(chat).display : null
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await page.screenshot({ path: 'homepage-desktop-after-fix.png', fullPage: false });
  await browser.close();
})();
