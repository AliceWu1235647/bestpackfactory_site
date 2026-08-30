// Site chrome for the dieline routes. These pages are React rather than the
// static HTML pipeline, so the header and footer are mirrored here to match
// content-site markup exactly.

export function SiteHeader() {
  const nav = [
    ['/index.html', 'Home'], ['/products.html', 'Products'], ['/industries.html', 'Industries'],
    ['/materials.html', 'Materials'], ['/finishes.html', 'Finishes'], ['/dielines', 'Dielines'],
    ['/factory.html', 'Factory'], ['/blog.html', 'Blog'], ['/contact.html', 'Contact']
  ];
  return (
    <header className="header">
      <div className="header-inner">
        <a className="logo" href="/index.html">
          <img
            alt="BestPackFactory"
            src="/assets/logo/bestpackfactory-logo.svg?v=1.2"
            width="560"
            height="76"
            decoding="async"
          />
        </a>
        <form action="/products.html" className="search" data-product-search="true" method="get" role="search">
          <input aria-label="Search custom packaging products" autoComplete="off" name="q" placeholder="Search products: coffee bags, pet food, pharma, cannabis..." />
          <button type="submit">Search</button>
        </form>
        <nav className="nav">
          {nav.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <button aria-controls="mobileNavPanel" aria-expanded="false" aria-label="Open mobile menu" className="mobile-menu-toggle" type="button">☰</button>
        <a className="btn" href="/contact.html">Get Quote</a>
      </div>
      <div aria-hidden="true" className="mobile-nav-panel" id="mobileNavPanel">
        <div className="mobile-nav-head">
          <strong>BestPackFactory</strong>
          <button aria-label="Close mobile menu" className="mobile-menu-close" type="button">×</button>
        </div>
        <div className="mobile-nav-links">
          {nav.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </div>
        <div className="mobile-nav-actions">
          <a className="mobile-action-wa" href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20a%20custom%20packaging%20quote." rel="noopener" target="_blank">WhatsApp Quote</a>
          <a className="mobile-action-email" href="mailto:lisa@colorprintingpackage.com?subject=Packaging Inquiry">Email Inquiry</a>
        </div>
      </div>
      <div aria-hidden="true" className="mobile-backdrop" />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <h3>BestPackFactory</h3>
        <p>B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins and printing.</p>
        <p>Sales Manager: Lisa Wu Email: lisa@colorprintingpackage.com WhatsApp +86 158 8653 0985</p>
        <p>Address: Printing Industrial Park, Longhua District, Shenzhen, Guangdong Province, 518109, China</p>
      </div>
      <div>
        <h3>Free Tools</h3>
        <a href="/dielines">Free Dieline Templates</a>
        <a href="/dielines/coffee-bag-250g-valve-dieline">250g Coffee Bag Dieline</a>
        <a href="/dielines/magnetic-rigid-box-dieline">Magnetic Box Dieline</a>
      </div>
      <div>
        <h3>Inquiry</h3>
        <a href="/contact.html">Request Quote</a>
        <a href="mailto:lisa@colorprintingpackage.com">Email Lisa</a>
      </div>
    </footer>
  );
}
