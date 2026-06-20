
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".slider") || document.querySelector(".slides");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  const nextBtn = document.querySelector(".arrow.next") || document.querySelector(".next") || document.querySelector(".carousel-next");
  const prevBtn = document.querySelector(".arrow.prev") || document.querySelector(".prev") || document.querySelector(".carousel-prev");

  if (!slider || slides.length === 0) return;

  let current = 0;
  let timer = null;
  const intervalMs = 4200;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slider.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  }

  function stopAutoPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = setInterval(function () {
      show(current + 1);
    }, intervalMs);
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

  const hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("mouseenter", stopAutoPlay);
    hero.addEventListener("mouseleave", startAutoPlay);
  }

  show(0);
  startAutoPlay();
});


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


// HIGH TRAFFIC UPGRADE: real front-end product search and RFQ WhatsApp builder
(function(){
  var PRODUCTS = [{"title": "Custom Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-boxes.html", "image": "assets/products/custom-boxes-01.jpg", "keywords": ""}, {"title": "Flexible Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/flexible-packaging.html", "image": "assets/products/flexible-packaging-01.jpg", "keywords": ""}, {"title": "Luxury Magnetic Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/luxury-magnetic-boxes.html", "image": "assets/products/luxury-magnetic-boxes-01.jpg", "keywords": ""}, {"title": "Food Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/food-packaging.html", "image": "assets/products/food-packaging-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Pharma Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pharma-packaging.html", "image": "assets/products/pharma-packaging-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/coffee-bags.html", "image": "assets/products/coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Pet Food Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pet-food-bags.html", "image": "assets/products/pet-food-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Cannabis Mylar Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cannabis-mylar-bags.html", "image": "assets/products/cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Paper Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/paper-bags.html", "image": "assets/products/paper-bags-01.jpg", "keywords": "paper bags shopping bags"}, {"title": "Labels & Stickers", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/labels-stickers.html", "image": "assets/products/labels-stickers-01.jpg", "keywords": "labels roll labels stickers"}, {"title": "PET Bottles", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pet-bottles.html", "image": "assets/products/pet-bottles-01.jpg", "keywords": ""}, {"title": "Tin Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/tin-boxes.html", "image": "assets/products/tin-boxes-01.jpg", "keywords": ""}, {"title": "250g Coffee Bags With Valve", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/250g-coffee-bags-with-valve.html", "image": "assets/products/250g-coffee-bags-with-valve-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "500g Flat Bottom Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/500g-flat-bottom-coffee-bags.html", "image": "assets/products/500g-flat-bottom-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "1kg Coffee Bean Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/1kg-coffee-bean-bags.html", "image": "assets/products/1kg-coffee-bean-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Kraft Paper Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/kraft-paper-coffee-bags.html", "image": "assets/products/kraft-paper-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Matte Black Coffee Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/matte-black-coffee-bags.html", "image": "assets/products/matte-black-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Custom Tea Packaging Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-tea-packaging-bags.html", "image": "assets/products/custom-tea-packaging-bags-01.jpg", "keywords": ""}, {"title": "Protein Powder Stand Up Pouches", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/protein-powder-stand-up-pouches.html", "image": "assets/products/protein-powder-stand-up-pouches-01.jpg", "keywords": ""}, {"title": "Collagen Powder Packaging Pouches", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/collagen-powder-packaging-pouches.html", "image": "assets/products/collagen-powder-packaging-pouches-01.jpg", "keywords": ""}, {"title": "Dog Food Flat Bottom Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/dog-food-flat-bottom-bags.html", "image": "assets/products/dog-food-flat-bottom-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Child Resistant Cannabis Mylar Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/child-resistant-cannabis-mylar-bags.html", "image": "assets/products/child-resistant-cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Cannabis Flower Packaging Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cannabis-flower-packaging-bags.html", "image": "assets/products/cannabis-flower-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pre Roll Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pre-roll-packaging-boxes.html", "image": "assets/products/pre-roll-packaging-boxes-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "CBD Gummies Packaging Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cbd-gummies-packaging-bags.html", "image": "assets/products/cbd-gummies-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Smell Proof Mylar Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/smell-proof-mylar-bags.html", "image": "assets/products/smell-proof-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pharmaceutical Folding Cartons", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pharmaceutical-folding-cartons.html", "image": "assets/products/pharmaceutical-folding-cartons-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Weight Loss Pill Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/weight-loss-pill-packaging-boxes.html", "image": "assets/products/weight-loss-pill-packaging-boxes-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Vitamin Supplement Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/vitamin-supplement-packaging-boxes.html", "image": "assets/products/vitamin-supplement-packaging-boxes-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Custom Cosmetic Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-cosmetic-packaging-boxes.html", "image": "assets/products/custom-cosmetic-packaging-boxes-01.jpg", "keywords": ""}, {"title": "Wine Magnetic Gift Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/wine-magnetic-gift-boxes.html", "image": "assets/products/wine-magnetic-gift-boxes-01.jpg", "keywords": ""}, {"title": "Custom Pizza Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-pizza-boxes.html", "image": "assets/products/custom-pizza-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Sandwich Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/sandwich-packaging-boxes.html", "image": "assets/products/sandwich-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Bakery Paper Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/bakery-paper-bags.html", "image": "assets/products/bakery-paper-bags-01.jpg", "keywords": "bakery burger box food packaging fries box paper bags pizza box shopping bags"}, {"title": "Luxury Retail Paper Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/luxury-retail-paper-bags.html", "image": "assets/products/luxury-retail-paper-bags-01.jpg", "keywords": "paper bags shopping bags"}, {"title": "Custom Printed Tissue Paper", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-printed-tissue-paper.html", "image": "assets/products/custom-printed-tissue-paper-01.jpg", "keywords": "accessories custom tape tissue paper"}, {"title": "Custom Printed Tape", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/custom-printed-tape.html", "image": "assets/products/custom-printed-tape-01.jpg", "keywords": "accessories custom tape tissue paper"}, {"title": "Roll Labels For Automatic Labeling", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/roll-labels-for-automatic-labeling.html", "image": "assets/products/roll-labels-for-automatic-labeling-01.jpg", "keywords": "labels roll labels stickers"}, {"title": "GS1 Pharma Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/gs1-pharma-packaging-boxes.html", "image": "assets/products/gs1-pharma-packaging-boxes-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Burger Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/burger-packaging-boxes.html", "image": "assets/products/burger-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Fries Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/fries-packaging-boxes.html", "image": "assets/products/fries-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Fried Chicken Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/fried-chicken-packaging-boxes.html", "image": "assets/products/fried-chicken-packaging-boxes-01.jpg", "keywords": ""}, {"title": "Bakery Donut Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/bakery-donut-packaging-boxes.html", "image": "assets/products/bakery-donut-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Shawarma Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/shawarma-packaging-boxes.html", "image": "assets/products/shawarma-packaging-boxes-01.jpg", "keywords": ""}, {"title": "Pizza Packaging Boxes", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pizza-packaging-boxes.html", "image": "assets/products/pizza-packaging-boxes-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Tissue Paper Packaging", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/tissue-paper-packaging.html", "image": "assets/products/tissue-paper-packaging-01.jpg", "keywords": "accessories custom tape tissue paper"}, {"title": "Child Resistant Cannabis Bags", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/cannabis-child-resistant-bags.html", "image": "assets/products/cannabis-child-resistant-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "PET Bottles", "desc": "B2B custom packaging MOQ 500 PCS", "url": "products/pet-bottles-candy-pharma.html", "image": "assets/products/pet-bottles-candy-pharma-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Flexible Packaging", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/flexible-packaging.html", "image": "assets/products/flexible-packaging-01.jpg", "keywords": ""}, {"title": "Luxury Magnetic Boxes", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/luxury-magnetic-boxes.html", "image": "assets/products/luxury-magnetic-boxes-01.jpg", "keywords": ""}, {"title": "Food Packaging", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/food-packaging.html", "image": "assets/products/food-packaging-01.jpg", "keywords": "bakery burger box food packaging fries box pizza box"}, {"title": "Pharma Packaging", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/pharma-packaging.html", "image": "assets/products/pharma-packaging-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}, {"title": "Coffee Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/coffee-bags.html", "image": "assets/products/coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Pet Food Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/pet-food-bags.html", "image": "assets/products/pet-food-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Cannabis Mylar Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/cannabis-mylar-bags.html", "image": "assets/products/cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Paper Bags", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/paper-bags.html", "image": "assets/products/paper-bags-01.jpg", "keywords": "paper bags shopping bags"}, {"title": "Labels & Stickers", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/labels-stickers.html", "image": "assets/products/labels-stickers-01.jpg", "keywords": "labels roll labels stickers"}, {"title": "PET Bottles", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/pet-bottles.html", "image": "assets/products/pet-bottles-01.jpg", "keywords": ""}, {"title": "Tin Boxes", "desc": "MOQ 500 PCS. Factory direct quote with custom size, material, logo and finish.", "url": "products/tin-boxes.html", "image": "assets/products/tin-boxes-01.jpg", "keywords": ""}, {"title": "250g Coffee Bags With Valve", "desc": "Custom 250g coffee bags with one-way degassing valve for roasters and coffee brands.", "url": "products/250g-coffee-bags-with-valve.html", "image": "assets/products/250g-coffee-bags-with-valve-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "500g Flat Bottom Coffee Bags", "desc": "Custom 500g flat bottom coffee bags with high barrier films and premium shelf display.", "url": "products/500g-flat-bottom-coffee-bags.html", "image": "assets/products/500g-flat-bottom-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "1kg Coffee Bean Bags", "desc": "Wholesale 1kg coffee bean bags for roasters, distributors and private label coffee brands.", "url": "products/1kg-coffee-bean-bags.html", "image": "assets/products/1kg-coffee-bean-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags labels roll labels stickers valve coffee bags"}, {"title": "Kraft Paper Coffee Bags", "desc": "Custom kraft paper coffee bags with valve, zipper and full color brand printing.", "url": "products/kraft-paper-coffee-bags.html", "image": "assets/products/kraft-paper-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Matte Black Coffee Bags", "desc": "Premium matte black coffee bags with foil logo, zipper and one-way valve options.", "url": "products/matte-black-coffee-bags.html", "image": "assets/products/matte-black-coffee-bags-01.jpg", "keywords": "250g coffee 500g coffee coffee bags valve coffee bags"}, {"title": "Custom Tea Packaging Bags", "desc": "Custom tea packaging bags for loose leaf tea, herbal tea and premium tea brands.", "url": "products/custom-tea-packaging-bags.html", "image": "assets/products/custom-tea-packaging-bags-01.jpg", "keywords": ""}, {"title": "Protein Powder Stand Up Pouches", "desc": "Custom stand up pouches for protein powder, supplements and nutrition brands.", "url": "products/protein-powder-stand-up-pouches.html", "image": "assets/products/protein-powder-stand-up-pouches-01.jpg", "keywords": ""}, {"title": "Collagen Powder Packaging Pouches", "desc": "Custom collagen powder pouches with high barrier materials and resealable zipper.", "url": "products/collagen-powder-packaging-pouches.html", "image": "assets/products/collagen-powder-packaging-pouches-01.jpg", "keywords": ""}, {"title": "Dog Food Flat Bottom Bags", "desc": "Custom dog food flat bottom bags with zipper, handle and high barrier material options.", "url": "products/dog-food-flat-bottom-bags.html", "image": "assets/products/dog-food-flat-bottom-bags-01.jpg", "keywords": "bakery burger box cat food dog food food packaging fries box pet food pet packaging pizza box"}, {"title": "Child Resistant Cannabis Mylar Bags", "desc": "Custom child resistant cannabis Mylar bags for compliant cannabis brands.", "url": "products/child-resistant-cannabis-mylar-bags.html", "image": "assets/products/child-resistant-cannabis-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Cannabis Flower Packaging Bags", "desc": "Custom cannabis flower packaging bags with odor barrier, zipper and matte finish.", "url": "products/cannabis-flower-packaging-bags.html", "image": "assets/products/cannabis-flower-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pre Roll Packaging Boxes", "desc": "Custom pre roll packaging boxes for cannabis pre-roll tubes and retail display.", "url": "products/pre-roll-packaging-boxes.html", "image": "assets/products/pre-roll-packaging-boxes-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "CBD Gummies Packaging Bags", "desc": "Custom CBD gummies packaging bags with high barrier films and premium printing.", "url": "products/cbd-gummies-packaging-bags.html", "image": "assets/products/cbd-gummies-packaging-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Smell Proof Mylar Bags", "desc": "Custom smell proof Mylar bags with odor barrier materials and resealable zipper.", "url": "products/smell-proof-mylar-bags.html", "image": "assets/products/smell-proof-mylar-bags-01.jpg", "keywords": "cannabis child resistant mylar pre roll smell proof weed packaging"}, {"title": "Pharmaceutical Folding Cartons", "desc": "Custom pharmaceutical folding cartons for medicine, supplements and healthcare brands.", "url": "products/pharmaceutical-folding-cartons.html", "image": "assets/products/pharmaceutical-folding-cartons-01.jpg", "keywords": "datamatrix gs1 medical packaging medicine box pharma pharmaceutical"}];
  function norm(s){ return (s || '').toString().toLowerCase().trim(); }
  function getQ(){ return new URLSearchParams(window.location.search).get('q') || ''; }

  function matchProduct(product, q){
    q = norm(q);
    if(!q) return true;
    var hay = norm([product.title, product.desc, product.url, product.keywords].join(' '));
    var words = q.split(/\s+/).filter(Boolean);
    return words.every(function(w){ return hay.indexOf(w) !== -1; }) || hay.indexOf(q) !== -1;
  }

  function initProductsPageSearch(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
    if(!cards.length) return;
    var status = document.getElementById('productSearchStatus');
    function filter(q){
      q = norm(q);
      var count = 0;
      cards.forEach(function(card){
        var hay = norm(card.getAttribute('data-search') || card.innerText || '');
        var words = q.split(/\s+/).filter(Boolean);
        var ok = !q || words.every(function(w){ return hay.indexOf(w) !== -1; }) || hay.indexOf(q) !== -1;
        card.classList.toggle('is-hidden', !ok);
        if(ok) count++;
      });
      if(status){
        status.textContent = q ? ('Showing ' + count + ' matching products for “' + q + '”') : 'Search products by keyword: coffee bags, pet food, pharma, cannabis, burger boxes, labels...';
      }
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
      function render(){
        var q = norm(input.value);
        if(!q){ panel.classList.remove('is-open'); panel.innerHTML=''; return; }
        var hits = PRODUCTS.filter(function(p){ return matchProduct(p, q); }).slice(0,6);
        panel.innerHTML = hits.length ? hits.map(function(p){
          return '<a class="search-result-item" href="' + (form.getAttribute('action') || 'products.html') + '?q=' + encodeURIComponent(q) + '">' + p.title + '<br><small>' + (p.keywords || p.desc || '') + '</small></a>';
        }).join('') : '<div class="search-result-item">No exact match. Try coffee, pet food, pharma or cannabis.</div>';
        panel.classList.add('is-open');
      }
      input.addEventListener('input', render);
      input.addEventListener('focus', render);
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
