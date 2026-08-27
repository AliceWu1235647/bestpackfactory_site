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
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-menu-open');
    }

    function closeMenu() {
      panel.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
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
