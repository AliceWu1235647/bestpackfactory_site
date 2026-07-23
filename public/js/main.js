(function () {
function initHeroCarousel() {
  const hero = document.querySelector(".hero-image-carousel");
  if (!hero) return;
  if (hero.dataset.carouselReady === "true") return;
  hero.dataset.carouselReady = "true";

  const slider = hero.querySelector(".slider");
  const slides = Array.from(slider ? slider.querySelectorAll(".slide") : []);
  const dots = Array.from(hero.querySelectorAll(".dot"));
  const nextBtn = hero.querySelector(".arrow.next");
  const prevBtn = hero.querySelector(".arrow.prev");

  if (!slider || slides.length === 0) return;

  let current = 0;
  let timer = null;
  const intervalMs = Number(hero.getAttribute("data-autoplay-ms")) || 3000;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slider.style.transition = "transform .55s ease";
    slider.style.transform = "translate3d(-" + (current * 100) + "%,0,0)";
    slides.forEach(function (slide, i) {
      const isActive = i === current;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (slides.length <= 1) return;
    timer = setInterval(function () {
      show(current + 1);
    }, intervalMs);
  }

  function startInitialAutoPlay() {
    const begin = function () {
      window.setTimeout(startAutoPlay, intervalMs);
    };
    if (document.readyState === "complete") {
      begin();
    } else {
      window.addEventListener("load", begin, { once: true });
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      show(current + 1);
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      show(current - 1);
      startAutoPlay();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      startAutoPlay();
    });
  });

  let touchStartX = 0;
  hero.addEventListener("touchstart", function (event) {
    touchStartX = event.touches && event.touches.length ? event.touches[0].clientX : 0;
    stopAutoPlay();
  }, { passive: true });

  hero.addEventListener("touchend", function (event) {
    const endX = event.changedTouches && event.changedTouches.length ? event.changedTouches[0].clientX : touchStartX;
    const deltaX = endX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      show(deltaX < 0 ? current + 1 : current - 1);
    }
    startAutoPlay();
  }, { passive: true });

  hero.addEventListener("mouseenter", stopAutoPlay);
  hero.addEventListener("mouseleave", startAutoPlay);
  hero.addEventListener("focusin", stopAutoPlay);
  hero.addEventListener("focusout", startAutoPlay);

  show(0);
  startInitialAutoPlay();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroCarousel);
} else {
  initHeroCarousel();
}
})();

// Analytics events: GA4 + Microsoft Clarity friendly conversion tracking.
(function(){
  var sentScrollDepth = {};

  function cleanUrl(value){
    try {
      var url = new URL(value, window.location.href);
      return url.href.replace(url.searchParams.get('text') || '', '[message]');
    } catch(e) {
      return value || '';
    }
  }

  function sendEvent(name, params){
    params = params || {};
    params.page_path = window.location.pathname;
    params.page_title = document.title;
    if(typeof window.gtag === 'function'){
      window.gtag('event', name, params);
    }
    if(typeof window.clarity === 'function'){
      window.clarity('event', name);
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params));
  }

  function readStoredAttribution(){
    try {
      return JSON.parse(window.localStorage.getItem('bpf_lead_attribution') || '{}') || {};
    } catch(e) {
      return {};
    }
  }

  function writeStoredAttribution(data){
    try {
      window.localStorage.setItem('bpf_lead_attribution', JSON.stringify(data));
    } catch(e) {}
  }

  function captureAttribution(){
    var params = new URLSearchParams(window.location.search);
    var keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid','msclkid'];
    var stored = readStoredAttribution();
    var next = Object.assign({}, stored);
    var hasNew = false;
    keys.forEach(function(key){
      var value = params.get(key);
      if(value){
        next[key] = value.slice(0, 180);
        hasNew = true;
      }
    });
    if(!next.first_landing_page) next.first_landing_page = window.location.pathname;
    if(!next.first_referrer && document.referrer) next.first_referrer = document.referrer.slice(0, 260);
    if(hasNew || !stored.first_landing_page) writeStoredAttribution(next);
    return next;
  }

  function currentLeadContext(){
    var attr = captureAttribution();
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var parts = [
      'Lead context:',
      'Page: ' + window.location.pathname,
      'Title: ' + document.title.replace(/\s+/g, ' ').slice(0, 120)
    ];
    if(q) parts.push('Search query: ' + q.slice(0, 120));
    ['utm_source','utm_medium','utm_campaign','utm_term','gclid','msclkid'].forEach(function(key){
      if(attr[key]) parts.push(key + ': ' + attr[key]);
    });
    if(attr.first_landing_page && attr.first_landing_page !== window.location.pathname){
      parts.push('First landing: ' + attr.first_landing_page);
    }
    if(attr.first_referrer) parts.push('Referrer: ' + attr.first_referrer);
    return '\n\n' + parts.join('\n');
  }

  function enrichLeadLink(link){
    if(!link || link.dataset.bpfLeadContext === 'attached') return;
    var href = link.getAttribute('href') || '';
    var lower = href.toLowerCase();
    if(lower.indexOf('wa.me/') === -1 && lower.indexOf('api.whatsapp.com') === -1 && lower.indexOf('mailto:') !== 0) return;
    var context = currentLeadContext();
    try {
      var url = new URL(href, window.location.href);
      if(url.protocol === 'mailto:'){
        var body = url.searchParams.get('body') || '';
        url.searchParams.set('body', (body || 'Hello Lisa, I need custom packaging.') + context);
        link.setAttribute('href', url.toString());
      } else {
        var text = url.searchParams.get('text') || 'Hello BestPackFactory, I need a custom packaging quote.';
        url.searchParams.set('text', (text + context).slice(0, 1800));
        link.setAttribute('href', url.toString());
      }
      link.dataset.bpfLeadContext = 'attached';
    } catch(e) {}
  }

  function isProductPage(){
    return /^\/products\/[^/]+\.html$/i.test(window.location.pathname);
  }

  function initClickTracking(){
    document.addEventListener('click', function(event){
      var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if(!link) return;
      enrichLeadLink(link);
      var href = link.getAttribute('href') || '';
      var text = (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      var lower = href.toLowerCase();
      var payload = {
        event_category: 'lead',
        link_text: text,
        link_url: cleanUrl(href)
      };
      if(lower.indexOf('wa.me/') !== -1 || lower.indexOf('api.whatsapp.com') !== -1){
        sendEvent('whatsapp_click', Object.assign({ method: 'whatsapp' }, payload));
        return;
      }
      if(lower.indexOf('mailto:') === 0){
        sendEvent('email_click', Object.assign({ method: 'email' }, payload));
        return;
      }
      if(lower.indexOf('contact.html') !== -1 || /quote|rfq|inquiry/i.test(text)){
        sendEvent('quote_cta_click', payload);
      }
    });
  }

  function initFormTracking(){
    document.addEventListener('submit', function(event){
      var form = event.target;
      if(!form || !form.tagName || form.tagName.toLowerCase() !== 'form') return;
      var action = form.getAttribute('action') || '';
      var id = form.getAttribute('id') || '';
      var classes = form.className || '';
      if(id === 'rfqForm' || classes.indexOf('rfq-form') !== -1 || action.indexOf('formsubmit.co') !== -1){
        sendEvent('rfq_submit', {
          event_category: 'lead',
          form_id: id || 'rfq_form',
          form_action: action
        });
      }
    }, true);
  }

  function initProductScrollDepth(){
    if(!isProductPage()) return;
    sendEvent('product_page_view', {
      event_category: 'product',
      product_path: window.location.pathname
    });

    function checkDepth(){
      var doc = document.documentElement;
      var scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      var depth = Math.round((window.scrollY / scrollable) * 100);
      [25, 50, 75, 90].forEach(function(mark){
        if(depth >= mark && !sentScrollDepth[mark]){
          sentScrollDepth[mark] = true;
          sendEvent('product_scroll_depth', {
            event_category: 'engagement',
            product_path: window.location.pathname,
            scroll_depth: mark
          });
        }
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function(){
      if(ticking) return;
      ticking = true;
      window.requestAnimationFrame(function(){
        ticking = false;
        checkDepth();
      });
    }, { passive: true });
    checkDepth();
  }

  function initTracking(){
    captureAttribution();
    initClickTracking();
    initFormTracking();
    initProductScrollDepth();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initTracking);
  }else{
    initTracking();
  }
})();

// FINAL MOBILE-FIRST: hamburger menu and touch-friendly overlay
(function(){
  function initMobileMenu(){
    var toggle = document.querySelector('.mobile-menu-toggle');
    var closeBtn = document.querySelector('.mobile-menu-close');
    var panel = document.querySelector('.mobile-nav-panel');
    var backdrop = document.querySelector('.mobile-backdrop');
    if(!toggle || !panel || !backdrop) return;

    function openMenu(){
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
      panel.setAttribute('aria-hidden','false');
      toggle.setAttribute('aria-expanded','true');
      document.body.classList.add('mobile-menu-open');
    }
    function closeMenu(){
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('mobile-menu-open');
    }
    toggle.addEventListener('click', openMenu);
    if(closeBtn) closeBtn.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);
    panel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  }else{
    initMobileMenu();
  }
})();



// HIGH TRAFFIC UPGRADE: R2-powered dynamic product search + RFQ WhatsApp builder
(function(){
  var STATIC_PRODUCTS = [{"title": "Custom Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-boxes.html", "image": "assets/products/custom-boxes-01.jpg", "keywords": ""}, {"title": "Flexible Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/flexible-packaging.html", "image": "assets/products/flexible-packaging-01.jpg", "keywords": ""}, {"title": "Luxury Magnetic Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/luxury-magnetic-boxes.html", "image": "assets/products/luxury-magnetic-boxes-01.jpg", "keywords": ""}, {"title": "Food Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/food-packaging.html", "image": "assets/products/food-packaging-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Pharma Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pharma-packaging.html", "image": "assets/products/pharma-packaging-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/coffee-bags.html", "image": "assets/products/coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Pet Food Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pet-food-bags.html", "image": "assets/products/pet-food-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Cannabis Mylar Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cannabis-mylar-bags.html", "image": "assets/products/cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Paper Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/paper-bags.html", "image": "assets/products/paper-bags-01.jpg", "keywords": "paper bags shopping bags"}, {"title": "Labels & Stickers", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/labels-stickers.html", "image": "assets/products/labels-stickers-01.jpg", "keywords": "labels roll labels stickers"}, {"title": "PET Bottles", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pet-bottles.html", "image": "assets/products/pet-bottles-01.jpg", "keywords": ""}, {"title": "Tin Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/tin-boxes.html", "image": "assets/products/tin-boxes-01.jpg", "keywords": ""}, {"title": "250g Coffee Bags With Valve", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/250g-coffee-bags-with-valve.html", "image": "assets/products/250g-coffee-bags-with-valve-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "500g Flat Bottom Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/500g-flat-bottom-coffee-bags.html", "image": "assets/products/500g-flat-bottom-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "1kg Coffee Bean Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/1kg-coffee-bean-bags.html", "image": "assets/products/1kg-coffee-bean-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Kraft Paper Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/kraft-paper-coffee-bags.html", "image": "assets/products/kraft-paper-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Matte Black Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/matte-black-coffee-bags.html", "image": "assets/products/matte-black-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Custom Tea Packaging Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-tea-packaging-bags.html", "image": "assets/products/custom-tea-packaging-bags-01.jpg", "keywords": ""}, {"title": "Protein Powder Stand Up Pouches", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/protein-powder-stand-up-pouches.html", "image": "assets/products/protein-powder-stand-up-pouches-01.jpg", "keywords": ""}, {"title": "Collagen Powder Packaging Pouches", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/collagen-powder-packaging-pouches.html", "image": "assets/products/collagen-powder-packaging-pouches-01.jpg", "keywords": ""}, {"title": "Dog Food Flat Bottom Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/dog-food-flat-bottom-bags.html", "image": "assets/products/dog-food-flat-bottom-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Child Resistant Cannabis Mylar Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/child-resistant-cannabis-mylar-bags.html", "image": "assets/products/child-resistant-cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Cannabis Flower Packaging Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cannabis-flower-packaging-bags.html", "image": "assets/products/cannabis-flower-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pre Roll Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pre-roll-packaging-boxes.html", "image": "assets/products/pre-roll-packaging-boxes-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "CBD Gummies Packaging Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cbd-gummies-packaging-bags.html", "image": "assets/products/cbd-gummies-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Smell Proof Mylar Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/smell-proof-mylar-bags.html", "image": "assets/products/smell-proof-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pharmaceutical Folding Cartons", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pharmaceutical-folding-cartons.html", "image": "assets/products/pharmaceutical-folding-cartons-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Weight Loss Pill Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/weight-loss-pill-packaging-boxes.html", "image": "assets/products/weight-loss-pill-packaging-boxes-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Vitamin Supplement Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/vitamin-supplement-packaging-boxes.html", "image": "assets/products/vitamin-supplement-packaging-boxes-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Custom Cosmetic Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-cosmetic-packaging-boxes.html", "image": "assets/products/custom-cosmetic-packaging-boxes-01.jpg", "keywords": ""}, {"title": "Wine Magnetic Gift Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/wine-magnetic-gift-boxes.html", "image": "assets/products/wine-magnetic-gift-boxes-01.jpg", "keywords": ""}, {"title": "Custom Pizza Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-pizza-boxes.html", "image": "assets/products/custom-pizza-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Sandwich Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/sandwich-packaging-boxes.html", "image": "assets/products/sandwich-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Bakery Paper Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/bakery-paper-bags.html", "image": "assets/products/bakery-paper-bags-01.jpg", "keywords": "bakery burger box food packaging fries box paper bags pizza box shopping bags"}, {"title": "Luxury Retail Paper Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/luxury-retail-paper-bags.html", "image": "assets/products/luxury-retail-paper-bags-01.jpg", "keywords": "paper bags shopping bags"}, {"title": "Custom Printed Tissue Paper", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-printed-tissue-paper.html", "image": "assets/products/custom-printed-tissue-paper-01.jpg", "keywords": "accessories custom tape tissue paper"}, {"title": "Custom Printed Tape", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-printed-tape.html", "image": "assets/products/custom-printed-tape-01.jpg", "keywords": "accessories custom tape tissue paper"}, {"title": "Roll Labels For Automatic Labeling", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/roll-labels-for-automatic-labeling.html", "image": "assets/products/roll-labels-for-automatic-labeling-01.jpg", "keywords": "labels roll labels stickers"}, {"title": "GS1 Pharma Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/gs1-pharma-packaging-boxes.html", "image": "assets/products/gs1-pharma-packaging-boxes-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Burger Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/burger-packaging-boxes.html", "image": "assets/products/burger-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Fries Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/fries-packaging-boxes.html", "image": "assets/products/fries-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Fried Chicken Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/fried-chicken-packaging-boxes.html", "image": "assets/products/fried-chicken-packaging-boxes-01.jpg", "keywords": ""}, {"title": "Bakery Donut Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/bakery-donut-packaging-boxes.html", "image": "assets/products/bakery-donut-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Shawarma Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/shawarma-packaging-boxes.html", "image": "assets/products/shawarma-packaging-boxes-01.jpg", "keywords": ""}, {"title": "Pizza Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pizza-packaging-boxes.html", "image": "assets/products/pizza-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Tissue Paper Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/tissue-paper-packaging.html", "image": "assets/products/tissue-paper-packaging-01.jpg", "keywords": "accessories custom tape tissue paper"}, {"title": "Child Resistant Cannabis Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cannabis-child-resistant-bags.html", "image": "assets/products/cannabis-child-resistant-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "PET Bottles", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pet-bottles-candy-pharma.html", "image": "assets/products/pet-bottles-candy-pharma-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Flexible Packaging", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/flexible-packaging.html", "image": "assets/products/flexible-packaging-01.jpg", "keywords": ""}, {"title": "Luxury Magnetic Boxes", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/luxury-magnetic-boxes.html", "image": "assets/products/luxury-magnetic-boxes-01.jpg", "keywords": ""}, {"title": "Food Packaging", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/food-packaging.html", "image": "assets/products/food-packaging-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Pharma Packaging", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/pharma-packaging.html", "image": "assets/products/pharma-packaging-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Coffee Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/coffee-bags.html", "image": "assets/products/coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Pet Food Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/pet-food-bags.html", "image": "assets/products/pet-food-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Cannabis Mylar Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/cannabis-mylar-bags.html", "image": "assets/products/cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Paper Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/paper-bags.html", "image": "assets/products/paper-bags-01.jpg", "keywords": "paper bags shopping bags"}, {"title": "Labels & Stickers", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/labels-stickers.html", "image": "assets/products/labels-stickers-01.jpg", "keywords": "labels roll labels stickers"}, {"title": "PET Bottles", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/pet-bottles.html", "image": "assets/products/pet-bottles-01.jpg", "keywords": ""}, {"title": "Tin Boxes", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/tin-boxes.html", "image": "assets/products/tin-boxes-01.jpg", "keywords": ""}, {"title": "250g Coffee Bags With Valve", "desc": "Custom 250g coffee bags with one-way degassing valve for roasters and coffee brands.", "url": "products/250g-coffee-bags-with-valve.html", "image": "assets/products/250g-coffee-bags-with-valve-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "500g Flat Bottom Coffee Bags", "desc": "Custom 500g flat bottom coffee bags with high barrier films and premium shelf display.", "url": "products/500g-flat-bottom-coffee-bags.html", "image": "assets/products/500g-flat-bottom-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "1kg Coffee Bean Bags", "desc": "Wholesale 1kg coffee bean bags for roasters, distributors and private label coffee brands.", "url": "products/1kg-coffee-bean-bags.html", "image": "assets/products/1kg-coffee-bean-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags labels roll labels stickers valve coffee bags"}, {"title": "Kraft Paper Coffee Bags", "desc": "Custom kraft paper coffee bags with valve, zipper and full color brand printing.", "url": "products/kraft-paper-coffee-bags.html", "image": "assets/products/kraft-paper-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Matte Black Coffee Bags", "desc": "Premium matte black coffee bags with foil logo, zipper and one-way valve options.", "url": "products/matte-black-coffee-bags.html", "image": "assets/products/matte-black-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Custom Tea Packaging Bags", "desc": "Custom tea packaging bags for loose leaf tea, herbal tea and premium tea brands.", "url": "products/custom-tea-packaging-bags.html", "image": "assets/products/custom-tea-packaging-bags-01.jpg", "keywords": ""}, {"title": "Protein Powder Stand Up Pouches", "desc": "Custom stand up pouches for protein powder, supplements and nutrition brands.", "url": "products/protein-powder-stand-up-pouches.html", "image": "assets/products/protein-powder-stand-up-pouches-01.jpg", "keywords": ""}, {"title": "Collagen Powder Packaging Pouches", "desc": "Custom collagen powder pouches with high barrier materials and resealable zipper.", "url": "products/collagen-powder-packaging-pouches.html", "image": "assets/products/collagen-powder-packaging-pouches-01.jpg", "keywords": ""}, {"title": "Dog Food Flat Bottom Bags", "desc": "Custom dog food flat bottom bags with zipper, handle and high barrier material options.", "url": "products/dog-food-flat-bottom-bags.html", "image": "assets/products/dog-food-flat-bottom-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Child Resistant Cannabis Mylar Bags", "desc": "Custom child resistant cannabis Mylar bags for compliant cannabis brands.", "url": "products/child-resistant-cannabis-mylar-bags.html", "image": "assets/products/child-resistant-cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Cannabis Flower Packaging Bags", "desc": "Custom cannabis flower packaging bags with odor barrier, zipper and matte finish.", "url": "products/cannabis-flower-packaging-bags.html", "image": "assets/products/cannabis-flower-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pre Roll Packaging Boxes", "desc": "Custom pre roll packaging boxes for cannabis pre-roll tubes and retail display.", "url": "products/pre-roll-packaging-boxes.html", "image": "assets/products/pre-roll-packaging-boxes-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "CBD Gummies Packaging Bags", "desc": "Custom CBD gummies packaging bags with high barrier films and premium printing.", "url": "products/cbd-gummies-packaging-bags.html", "image": "assets/products/cbd-gummies-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Smell Proof Mylar Bags", "desc": "Custom smell proof Mylar bags with odor barrier materials and resealable zipper.", "url": "products/smell-proof-mylar-bags.html", "image": "assets/products/smell-proof-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pharmaceutical Folding Cartons", "desc": "Custom pharmaceutical folding cartons for medicine, supplements and healthcare brands.", "url": "products/pharmaceutical-folding-cartons.html", "image": "assets/products/pharmaceutical-folding-cartons-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}];

  var SEARCH_API = '/api/products-search';
  var productCache = null;
  var productPromise = null;

  var QUERY_ALIASES = {
    'box': ['boxes','custom boxes','custom gift boxes','rigid boxes','mailer boxes','cardstock product boxes','folding carton','paperboard box','gift packaging'],
    'boxes': ['box','custom boxes','custom gift boxes','rigid boxes','mailer boxes','cardstock product boxes'],
    'rigid box': ['rigid boxes','magnetic rigid box','luxury magnetic boxes','custom gift boxes','foam insert','gift box'],
    'rigid boxes': ['rigid box','magnetic rigid box','luxury magnetic boxes','custom gift boxes'],
    'mailer': ['mailer box','mailer boxes','corrugated mailer box','custom boxes','shipping box'],
    'mailer box': ['mailer boxes','corrugated mailer box','custom boxes','shipping box'],
    'mailer boxes': ['mailer box','corrugated mailer box','custom boxes','shipping box'],
    'corrugated mailer box': ['mailer box','mailer boxes','custom boxes','shipping box'],
    'cardstock': ['cardstock product boxes','cardstock boxes','folding carton','custom boxes','paperboard box'],
    'cardstock product boxes': ['cardstock','cardstock boxes','custom boxes','folding carton'],
    'magnetic packaging': ['magnetic rigid box','luxury magnetic boxes','collapsible magnetic gift box','custom gift boxes','rigid boxes'],
    'magnetic rigid box': ['magnetic packaging','luxury magnetic boxes','collapsible magnetic gift box','custom gift boxes','rigid boxes'],
    'collapsible magnetic gift box': ['magnetic packaging','magnetic rigid box','custom gift boxes','rigid boxes'],
    'sliding drawer box': ['drawer box','custom boxes','rigid boxes','gift box','luxury packaging'],
    'drawer box': ['sliding drawer box','custom boxes','rigid boxes'],
    'cylinder tube packaging': ['tube packaging','cylinder box','paper tube packaging','custom boxes','gift packaging'],
    'pouch': ['pouches','stand up pouch','stand-up pouch','flexible packaging','mylar bags','spout pouch','retort pouch','coffee bags'],
    'pouches': ['pouch','stand up pouch','stand-up pouch','flexible packaging','mylar bags','spout pouch','retort pouch'],
    'paper bag': ['paper bags','paper gift bag','paper shopping bag','luxury paper bag','retail bag'],
    'paper bags': ['paper bag','paper gift bag','paper shopping bag','luxury paper bag'],
    'paper gift bag': ['paper bags','paper shopping bag','luxury paper bag'],
    'food packaging box': ['food packaging boxes','burger box','pizza box','fries box','bakery box','takeaway box'],
    'foam insert': ['insert','custom insert','rigid boxes','magnetic rigid box','custom gift boxes']
  };

  function norm(s){
    return (s || '').toString().toLowerCase().replace(/&/g,' and ').replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
  }

  function unique(list){
    var seen = {};
    return list.filter(function(item){
      item = (item || '').toString().trim();
      if(!item || seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }

  function normalizeUrl(url, slug){
    url = (url || '').toString().trim();
    if(/^https?:\/\//i.test(url)) return url;
    if(url.charAt(0) === '/') return url;
    if(url.indexOf('products/') === 0) return '/' + url.replace(/\.json$/i, '.html');
    if(slug) return '/products/' + slug.replace(/^products\//,'').replace(/\.html$/,'') + '.html';
    return '/products.html';
  }

  function normalizeProduct(p){
    p = p || {};
    var url = normalizeUrl(p.url || p.path || '', p.slug || p.id || p.title || p.name);
    var slug = (p.slug || url.replace(/^\/?products\//,'').replace(/\.html.*$/,'')).toString();
    var title = p.title || p.name || slug.replace(/[-_]+/g,' ');
    var desc = p.description || p.desc || p.quickAnswer || p.metaDescription || 'Custom packaging product from BestPackFactory.';
    var keywords = [];
    if(Array.isArray(p.keywords)) keywords = keywords.concat(p.keywords);
    else keywords = keywords.concat((p.keywords || '').toString().split(/[,\n|]/));
    if(Array.isArray(p.tags)) keywords = keywords.concat(p.tags);
    if(Array.isArray(p.aliases)) keywords = keywords.concat(p.aliases);
    if(Array.isArray(p.searchKeywords)) keywords = keywords.concat(p.searchKeywords);
    keywords = unique(keywords.map(function(v){return (v || '').toString().trim();}));
    return {
      title: title,
      name: title,
      slug: slug,
      url: url,
      desc: desc,
      description: desc,
      image: p.image || p.mainImage || p.ogImage || (Array.isArray(p.images) ? p.images[0] : ''),
      category: p.category || '',
      tags: Array.isArray(p.tags) ? p.tags : [],
      keywords: keywords.join(' ')
    };
  }

  function expandQuery(q){
    q = norm(q);
    if(!q) return [];
    var terms = [q];
    Object.keys(QUERY_ALIASES).forEach(function(key){
      if(q === key || q.indexOf(key) !== -1 || key.indexOf(q) !== -1){
        terms = terms.concat(QUERY_ALIASES[key]);
      }
    });
    if(q.indexOf('box') !== -1) terms = terms.concat(QUERY_ALIASES.box);
    if(q.indexOf('pouch') !== -1 || q.indexOf('bag') !== -1) terms = terms.concat(QUERY_ALIASES.pouch);
    if(q.indexOf('magnetic') !== -1) terms = terms.concat(QUERY_ALIASES['magnetic packaging']);
    if(q.indexOf('mailer') !== -1) terms = terms.concat(QUERY_ALIASES['mailer box']);
    if(q.indexOf('cardstock') !== -1) terms = terms.concat(QUERY_ALIASES.cardstock);
    return unique(terms.map(norm));
  }

  function productHay(product){
    var p = normalizeProduct(product);
    var base = [p.title, p.name, p.desc, p.description, p.url, p.slug, p.keywords, p.category].concat(p.tags || []).join(' ');
    return norm(base);
  }

  function aliasHay(hay){
    var expanded = [hay];
    Object.keys(QUERY_ALIASES).forEach(function(key){
      if(hay.indexOf(key) !== -1){
        expanded = expanded.concat(QUERY_ALIASES[key]);
      }
    });
    return norm(expanded.join(' '));
  }

  function productScore(product, q){
    q = norm(q);
    if(!q) return 1;
    var p = normalizeProduct(product);
    var hay = aliasHay(productHay(p));
    var title = norm(p.title);
    var terms = expandQuery(q);
    var words = q.split(/\s+/).filter(Boolean);
    var score = 0;
    if(title.indexOf(q) !== -1) score += 120;
    if(hay.indexOf(q) !== -1) score += 80;
    if(words.length && words.every(function(w){ return hay.indexOf(w) !== -1; })) score += 45;
    terms.forEach(function(term){
      if(!term) return;
      if(title.indexOf(term) !== -1) score += 45;
      else if(hay.indexOf(term) !== -1) score += 28;
    });
    words.forEach(function(w){
      if(hay.indexOf(w) !== -1) score += 5;
    });
    return score;
  }

  function mergeProducts(staticList, dynamicList){
    var map = {};
    (staticList || []).concat(dynamicList || []).forEach(function(raw){
      var p = normalizeProduct(raw);
      var key = p.slug || p.url || p.title;
      if(!key) return;
      if(map[key]){
        map[key].keywords = unique((map[key].keywords + ' ' + p.keywords).split(/\s+/)).join(' ');
        map[key].desc = p.desc || map[key].desc;
        map[key].description = p.description || map[key].description;
        map[key].image = p.image || map[key].image;
      }else{
        map[key] = p;
      }
    });
    return Object.keys(map).map(function(k){ return map[k]; });
  }

  function getLocalProducts(){
    return STATIC_PRODUCTS.map(normalizeProduct);
  }

  function loadProducts(){
    if(productPromise) return productPromise;
    productPromise = fetch(SEARCH_API, { headers: { 'Accept': 'application/json' } })
      .then(function(res){ return res.ok ? res.json() : null; })
      .then(function(data){
        var apiProducts = data && Array.isArray(data.products) ? data.products : [];
        productCache = mergeProducts(getLocalProducts(), apiProducts);
        return productCache;
      })
      .catch(function(){
        productCache = getLocalProducts();
        return productCache;
      });
    return productPromise;
  }

  function findProducts(products, q, limit){
    q = norm(q);
    if(!q) return [];
    return (products || [])
      .map(function(p){ return { product: normalizeProduct(p), score: productScore(p, q) }; })
      .filter(function(item){ return item.score > 0; })
      .sort(function(a,b){ return b.score - a.score || a.product.title.localeCompare(b.product.title); })
      .slice(0, limit || 8)
      .map(function(item){ return item.product; });
  }

  function getQ(){ return new URLSearchParams(window.location.search).get('q') || ''; }

  function cardHay(card){
    return aliasHay(norm(card.getAttribute('data-search') || card.innerText || ''));
  }

  function matchCard(card, q){
    q = norm(q);
    if(!q) return true;
    var hay = cardHay(card);
    var words = q.split(/\s+/).filter(Boolean);
    if(hay.indexOf(q) !== -1) return true;
    if(words.length && words.every(function(w){ return hay.indexOf(w) !== -1; })) return true;
    return expandQuery(q).some(function(term){ return term && hay.indexOf(term) !== -1; });
  }

  function ensureDynamicResultBox(status){
    var box = document.getElementById('r2DynamicSearchResults');
    if(box) return box;
    box = document.createElement('div');
    box.id = 'r2DynamicSearchResults';
    box.className = 'r2-dynamic-search-results';
    if(status && status.parentNode) status.parentNode.insertBefore(box, status.nextSibling);
    return box;
  }

  function renderDynamicResults(box, results, localUrls, q){
    if(!box) return;
    var extras = results.filter(function(p){
      var url = normalizeUrl(p.url, p.slug).replace(/^\//,'');
      return !localUrls[url] && !localUrls[url.replace(/^products\//,'')];
    }).slice(0, 6);
    if(!q || !extras.length){
      box.classList.remove('is-open');
      box.innerHTML = '';
      return;
    }
    box.innerHTML = '<div class="product-search-status r2-status">Dynamic R2 product matches for “' + q.replace(/</g,'&lt;') + '”</div>' +
      '<div class="r2-result-grid">' + extras.map(function(p){
        return '<a class="r2-result-card" href="' + normalizeUrl(p.url, p.slug) + '">' +
          (p.image ? '<img src="' + p.image + '" alt="' + p.title.replace(/"/g,'&quot;') + '" loading="lazy">' : '') +
          '<strong>' + p.title + '</strong><span>' + (p.desc || '').slice(0, 120) + '</span></a>';
      }).join('') + '</div>';
    box.classList.add('is-open');
  }

  function initProductsPageSearch(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
    if(!cards.length) return;
    var status = document.getElementById('productSearchStatus');
    var localUrls = {};
    cards.forEach(function(card){
      var a = card.querySelector('a[href]');
      if(a){
        var href = a.getAttribute('href') || '';
        localUrls[href.replace(/^\//,'')] = true;
      }
    });
    var dynamicBox = ensureDynamicResultBox(status);

    function filter(q){
      q = norm(q);
      var count = 0;
      cards.forEach(function(card){
        var ok = matchCard(card, q);
        card.classList.toggle('is-hidden', !ok);
        if(ok) count++;
      });
      if(status){
        status.textContent = q ? ('Showing ' + count + ' matching local products for “' + q + '”') : 'Search products by keyword: box, pouch, rigid box, mailer box, cardstock, magnetic packaging...';
      }
      loadProducts().then(function(products){
        renderDynamicResults(dynamicBox, findProducts(products, q, 10), localUrls, q);
      });
    }

    var q = getQ();
    filter(q);
    document.querySelectorAll('form.search input[name="q"]').forEach(function(input){
      if(q && !input.value) input.value = q;
      input.addEventListener('input', function(){ filter(input.value); });
    });
  }

  function initHeaderSearch(){
    document.querySelectorAll('form.search').forEach(function(form){
      var input = form.querySelector('input[name="q"], input');
      if(!input) return;
      var panel = document.createElement('div');
      panel.className = 'search-results-panel';
      form.appendChild(panel);
      var products = getLocalProducts();
      loadProducts().then(function(list){ products = list; });

      function render(){
        var q = norm(input.value);
        if(!q){ panel.classList.remove('is-open'); panel.innerHTML=''; return; }
        var hits = findProducts(products, q, 8);
        panel.innerHTML = hits.length ? hits.map(function(p){
          return '<a class="search-result-item" href="' + normalizeUrl(p.url, p.slug) + '">' + p.title + '<br><small>' + (p.keywords || p.desc || '') + '</small></a>';
        }).join('') : '<div class="search-result-item">No exact match. Try box, pouch, rigid box, mailer box, cardstock or magnetic packaging.</div>';
        panel.classList.add('is-open');
      }

      input.addEventListener('input', function(){
        render();
        loadProducts().then(function(list){ products = list; render(); });
      });
      input.addEventListener('focus', function(){
        loadProducts().then(function(list){ products = list; render(); });
      });
      document.addEventListener('click', function(e){ if(!form.contains(e.target)) panel.classList.remove('is-open'); });
      form.addEventListener('submit', function(e){
        var q = input.value.trim();
        if(!q){ e.preventDefault(); input.focus(); }
      });
    });
  }

  function initRFQWhatsApp(){
    var form = document.getElementById('rfqForm');
    var btn = document.getElementById('rfqWhatsAppButton');
    if(!form || !btn) return;
    function build(){
      var fd = new FormData(form);
      var lines = ['Hello BestPackFactory, I need a custom packaging quote:'];
      ['Product Type','Size','Quantity','Material','Printing Colors','Destination Country','WhatsApp','Email','Message'].forEach(function(k){
        var v = fd.get(k);
        if(v) lines.push(k + ': ' + v);
      });
      btn.href = 'https://wa.me/8615886530985?text=' + encodeURIComponent(lines.join('\n'));
    }
    form.addEventListener('input', build);
    form.addEventListener('change', build);
    build();
  }

  function initSuccessMessage(){
    if(new URLSearchParams(window.location.search).get('rfq') === 'success'){
      var box = document.createElement('div');
      box.className = 'product-search-status';
      box.textContent = 'Thank you. Your RFQ was submitted. We will reply as soon as possible.';
      var form = document.getElementById('rfq-form-section');
      if(form) form.insertBefore(box, form.firstChild);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      initProductsPageSearch(); initHeaderSearch(); initRFQWhatsApp(); initSuccessMessage();
    });
  }else{
    initProductsPageSearch(); initHeaderSearch(); initRFQWhatsApp(); initSuccessMessage();
  }
})();
