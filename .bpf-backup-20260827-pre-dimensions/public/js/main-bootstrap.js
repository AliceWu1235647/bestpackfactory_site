(function () {
  var mainScriptPromise;
  var mainScriptSrc = '/js/main.js?v=20260813_mobile_single_hero1';

  function loadMainScript() {
    if (mainScriptPromise) return mainScriptPromise;
    mainScriptPromise = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-bpf-main]');
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }
      var script = document.createElement('script');
      script.src = mainScriptSrc;
      script.async = true;
      script.dataset.bpfMain = 'true';
      script.addEventListener('load', function () {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
    return mainScriptPromise;
  }

  function ensureMobileMenu() {
    var header = document.querySelector('.header');
    var headerInner = header && header.querySelector('.header-inner');
    if (!header || !headerInner) return;

    var toggle = headerInner.querySelector('.mobile-menu-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'mobile-menu-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-controls', 'mobileNavPanel');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open mobile menu');
      toggle.textContent = '\u2630';
      var headerCta = headerInner.querySelector(':scope > .btn');
      if (headerCta) headerInner.insertBefore(toggle, headerCta);
      else headerInner.appendChild(toggle);
    }

    var panel = document.querySelector('.mobile-nav-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'mobile-nav-panel';
      panel.id = 'mobileNavPanel';
      panel.setAttribute('aria-hidden', 'true');

      var head = document.createElement('div');
      head.className = 'mobile-nav-head';
      var label = document.createElement('strong');
      label.textContent = 'Menu';
      var close = document.createElement('button');
      close.className = 'mobile-menu-close';
      close.type = 'button';
      close.setAttribute('aria-label', 'Close mobile menu');
      close.textContent = '\u00d7';
      head.appendChild(label);
      head.appendChild(close);

      var links = document.createElement('nav');
      links.className = 'mobile-nav-links';
      links.setAttribute('aria-label', 'Mobile navigation');
      [
        ['Home', '/'],
        ['Products', '/products.html'],
        ['Industries', '/industries.html'],
        ['Materials', '/materials.html'],
        ['Finishes', '/finishes.html'],
        ['Factory', '/factory.html'],
        ['Blog', '/blog.html'],
        ['News', '/news.html'],
        ['Contact', '/contact.html']
      ].forEach(function (item) {
        var link = document.createElement('a');
        link.href = item[1];
        link.textContent = item[0];
        links.appendChild(link);
      });

      var actions = document.createElement('div');
      actions.className = 'mobile-nav-actions';
      var whatsapp = document.createElement('a');
      whatsapp.className = 'btn primary';
      whatsapp.href = 'https://wa.me/8615886530985';
      whatsapp.target = '_blank';
      whatsapp.rel = 'noopener noreferrer';
      whatsapp.textContent = 'WhatsApp';
      var email = document.createElement('a');
      email.className = 'btn';
      email.href = 'mailto:lisa@colorprintingpackage.com';
      email.textContent = 'Email Inquiry';
      actions.appendChild(whatsapp);
      actions.appendChild(email);

      panel.appendChild(head);
      panel.appendChild(links);
      panel.appendChild(actions);
      document.body.appendChild(panel);
    } else if (!panel.id) {
      panel.id = 'mobileNavPanel';
    }

    toggle.setAttribute('aria-controls', panel.id);
    var backdrop = document.querySelector('.mobile-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var closeButton = document.querySelector('.mobile-menu-close');
    var panel = document.querySelector('.mobile-nav-panel');
    var backdrop = document.querySelector('.mobile-backdrop');
    if (!toggle || !panel || !backdrop) return;

    function openMenu() {
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-menu-open');
    }

    function closeMenu() {
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-menu-open');
    }

    toggle.addEventListener('click', openMenu);
    if (closeButton) closeButton.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  function interactionNeedsMain(target) {
    if (!target || !target.closest) return false;
    return Boolean(target.closest(
      'form.search, [data-product-search], #rfqForm, #rfqWhatsAppButton, .hero-image-carousel .arrow, .hero-image-carousel .dot'
    ));
  }

  function init() {
    ensureMobileMenu();
    initMobileMenu();

    document.addEventListener('focusin', function (event) {
      if (interactionNeedsMain(event.target)) loadMainScript();
    }, { passive: true });
    document.addEventListener('pointerdown', function (event) {
      if (interactionNeedsMain(event.target)) loadMainScript();
    }, { passive: true });

    var params = new URLSearchParams(window.location.search);
    if (params.has('q') || params.get('rfq') === 'success') loadMainScript();

    var desktopCarousel = document.querySelector('.hero-image-carousel');
    if (desktopCarousel && window.matchMedia('(min-width: 981px)').matches) {
      window.setTimeout(loadMainScript, 1800);
    }
  }

  window.__bpfLoadMainScript = loadMainScript;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
