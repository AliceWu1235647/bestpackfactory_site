import styles from './blog-index.module.css';
import { BLOG_TOPICS, groupBlogPosts, listBlogPosts } from '../lib/blog-index';

const SITE_URL = 'https://www.bestpackfactory.com';
const PAGE_URL = `${SITE_URL}/blog.html`;

function SiteHeader() {
  const navigation = [
    ['Home', '/index.html'],
    ['Products', '/products.html'],
    ['Industries', '/industries.html'],
    ['Materials', '/materials.html'],
    ['Finishes', '/finishes.html'],
    ['Factory', '/factory.html'],
    ['Blog', '/blog.html'],
    ['News', '/news.html'],
    ['Contact', '/contact.html']
  ];

  return (
    <>
      <div className="topbar">
        <div>Custom Packaging Manufacturer | MOQ 500 PCS | Free Design</div>
        <div>Email: lisa@colorprintingpackage.com &nbsp; | &nbsp; WhatsApp: +86 158 8653 0985</div>
      </div>
      <header className="header">
        <div className="header-inner">
          <a className="logo" href="/index.html" aria-label="BestPackFactory home">
            <img src="/assets/logo/bestpackfactory-logo.svg?v=1.2" alt="BestPackFactory" width="560" height="76" />
          </a>
          <form action="/products.html" className="search" data-product-search="true" method="get" role="search">
            <input aria-label="Search custom packaging products" autoComplete="off" name="q" placeholder="Search products: coffee bags, gift boxes, paper bags..." />
            <button type="submit">Search</button>
          </form>
          <nav className="nav" aria-label="Primary navigation">
            {navigation.map(([label, href]) => (
              <a key={href} href={href} aria-current={label === 'Blog' ? 'page' : undefined}>{label}</a>
            ))}
          </nav>
          <button aria-controls="mobileNavPanel" aria-expanded="false" aria-label="Open mobile menu" className="mobile-menu-toggle" type="button">&#9776;</button>
          <a className="btn" href="/contact.html">Get Quote</a>
        </div>
        <div aria-hidden="true" className="mobile-nav-panel" id="mobileNavPanel">
          <div className="mobile-nav-head">
            <strong>BestPackFactory</strong>
            <button aria-label="Close mobile menu" className="mobile-menu-close" type="button">&times;</button>
          </div>
          <div className="mobile-nav-links">
            {navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </div>
          <div className="mobile-nav-actions">
            <a className="mobile-action-wa" href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20a%20custom%20packaging%20quote." rel="noopener" target="_blank">WhatsApp Quote</a>
            <a className="mobile-action-email" href="mailto:lisa@colorprintingpackage.com?subject=Packaging%20Inquiry">Email Inquiry</a>
          </div>
        </div>
        <div aria-hidden="true" className="mobile-backdrop" />
      </header>
    </>
  );
}

function ArticleCard({ post, featured = false, eager = false }) {
  return (
    <article className={featured ? styles.featuredCard : styles.articleCard}>
      <a className={styles.cardImage} href={post.href} tabIndex="-1" aria-hidden="true">
        <img
          src={post.image}
          alt=""
          width="960"
          height="720"
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
        />
      </a>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span>{post.topicLabel}</span>
          <time dateTime={post.published}>{post.displayDate}</time>
        </div>
        <h3><a href={post.href}>{post.title}</a></h3>
        <p>{post.excerpt}</p>
        <a className={styles.readMore} href={post.href} aria-label={`Read ${post.title}`}>Read buyer guide <span aria-hidden="true">&rarr;</span></a>
      </div>
    </article>
  );
}

function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <h3>BestPackFactory</h3>
        <p>B2B custom packaging manufacturer for boxes, bags, labels, bottles, tins and printing.</p>
        <p>Sales Manager: Lisa Wu<br />Email: lisa@colorprintingpackage.com<br />WhatsApp: +86 158 8653 0985</p>
        <p>Printing Industrial Park, Longhua District, Shenzhen, Guangdong Province, 518109, China</p>
      </div>
      <div>
        <h3>Products</h3>
        <a href="/products.html">All Products</a>
        <a href="/products/luxury-magnetic-boxes.html">Magnetic Boxes</a>
        <a href="/products/flexible-packaging.html">Flexible Packaging</a>
        <a href="/products/paper-bags.html">Paper Bags</a>
      </div>
      <div>
        <h3>Inquiry</h3>
        <a href="/contact.html">Request Quote</a>
        <a href="mailto:lisa@colorprintingpackage.com">Email Lisa</a>
        <a href="https://wa.me/8615886530985" rel="noopener" target="_blank">WhatsApp</a>
      </div>
    </footer>
  );
}

export default function BlogIndex() {
  const posts = listBlogPosts();
  const groups = groupBlogPosts(posts);
  const latestPosts = posts.slice(0, 3);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'Custom Packaging Blog & Buyer Guides',
        description: 'Practical B2B guides for custom packaging buyers covering materials, box styles, MOQ, costs, artwork, samples, compliance, supplier checks and shipping.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: { '@id': `${PAGE_URL}#guides` }
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#guides`,
        name: 'BestPackFactory packaging buyer guides',
        numberOfItems: posts.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: posts.map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: post.title,
          url: post.absoluteUrl
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Packaging Blog', item: PAGE_URL }
        ]
      }
    ]
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.blogPage}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <a href="/index.html">Home</a><span aria-hidden="true">/</span><span>Packaging Blog</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <div className={styles.eyebrow}>Packaging Academy</div>
                <h1>Custom Packaging Blog &amp; Buyer Guides</h1>
                <p>Practical guidance for planning packaging structures, materials, artwork, samples, compliance, costs and supplier decisions before you request a quote.</p>
                <div className={styles.heroActions}>
                  <a className={styles.primaryAction} href="#latest-guides">Browse latest guides</a>
                  <a className={styles.secondaryAction} href="/contact.html">Prepare an RFQ</a>
                </div>
              </div>
              <dl className={styles.libraryStats} aria-label="Blog library summary">
                <div><dt>{posts.length}</dt><dd>published guides</dd></div>
                <div><dt>{BLOG_TOPICS.length}</dt><dd>buyer topics</dd></div>
                <div><dt>500</dt><dd>PCS typical MOQ</dd></div>
              </dl>
            </div>
          </div>
        </section>

        <section className={styles.topicNav} aria-labelledby="browse-by-topic">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div>
                <span className={styles.sectionKicker}>Find the right starting point</span>
                <h2 id="browse-by-topic">Browse by buyer question</h2>
              </div>
              <p>Choose a topic based on the decision you need to make, then open a guide for the exact RFQ inputs and checks.</p>
            </div>
            <div className={styles.topicLinks}>
              {groups.map(group => (
                <a key={group.id} href={`#${group.id}`} className={styles.topicLink}>
                  <strong>{group.label}</strong>
                  <span>{group.posts.length} guides</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.latestSection} id="latest-guides" aria-labelledby="latest-heading">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div>
                <span className={styles.sectionKicker}>Recently published</span>
                <h2 id="latest-heading">Latest packaging buyer guides</h2>
              </div>
              <p>New practical resources for sourcing, material, approval and compliance decisions.</p>
            </div>
            <div className={styles.featuredGrid}>
              {latestPosts.map((post, index) => <ArticleCard key={post.slug} post={post} featured eager={index === 0} />)}
            </div>
          </div>
        </section>

        <section className={styles.librarySection} aria-labelledby="all-guides-heading">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <div>
                <span className={styles.sectionKicker}>Complete library</span>
                <h2 id="all-guides-heading">All custom packaging guides</h2>
              </div>
              <p>Every published guide is listed below with its real publication date and article image.</p>
            </div>
            {groups.map(group => (
              <section className={styles.topicSection} id={group.id} key={group.id} aria-labelledby={`${group.id}-heading`}>
                <div className={styles.topicHeading}>
                  <div>
                    <h2 id={`${group.id}-heading`}>{group.label}</h2>
                    <p>{group.description}</p>
                  </div>
                  <span>{group.posts.length} guides</span>
                </div>
                <div className={styles.articleGrid}>
                  {group.posts.map(post => <ArticleCard key={post.slug} post={post} />)}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div>
            <span className={styles.sectionKicker}>From research to a factory-ready brief</span>
            <h2>Ready to discuss your packaging project?</h2>
            <p>Share your product type, dimensions, quantity, artwork status, target market and delivery country for a practical review.</p>
          </div>
          <div className={styles.ctaActions}>
            <a className={styles.primaryAction} href="/contact.html">Request a quote</a>
            <a className={styles.whatsappAction} href="https://wa.me/8615886530985?text=Hello%20BestPackFactory%2C%20I%20need%20help%20with%20a%20custom%20packaging%20project." rel="noopener" target="_blank">Ask on WhatsApp</a>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </>
  );
}

