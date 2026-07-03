import os, re, glob

BASE_URL = 'https://bestpackfactory.com'

# Map of page -> (title, description, og_image)
PAGE_SEO = {
    'index.html': {
        'title': 'Custom Packaging Manufacturer | B2B MOQ 500 PCS | BestPackFactory',
        'desc': 'BestPackFactory is a B2B custom packaging manufacturer. MOQ 500 PCS for boxes, bags, labels, bottles, pouches and flexible packaging. Factory direct. Free dieline.',
        'og_image': BASE_URL + '/assets/hero/slide-01-one-stop.webp',
        'canonical': BASE_URL + '/',
    },
    'products.html': {
        'title': 'Custom Packaging Products | MOQ 500 PCS Factory Direct | BestPackFactory',
        'desc': 'Browse 60+ custom packaging products: coffee bags, cannabis mylar bags, spout pouches, retort pouches, ring binders, shrink labels. B2B manufacturer MOQ 500 PCS.',
        'og_image': BASE_URL + '/assets/hero/slide-01-one-stop.webp',
        'canonical': BASE_URL + '/products.html',
    },
    'about.html': {
        'title': 'About BestPackFactory | B2B Packaging Manufacturer Since 2010',
        'desc': 'BestPackFactory manufactures custom packaging for 50,000+ global brands. ISO 9001, food-safe materials, worldwide shipping. Learn about our factory and capabilities.',
        'og_image': BASE_URL + '/assets/hero/slide-01-one-stop.webp',
        'canonical': BASE_URL + '/about.html',
    },
    'contact.html': {
        'title': 'Contact BestPackFactory | Get a Free Custom Packaging Quote',
        'desc': 'Contact BestPackFactory for a free quote on custom packaging. MOQ 500 PCS. WhatsApp, email or RFQ form. Fast response within 24 hours.',
        'og_image': BASE_URL + '/assets/hero/slide-01-one-stop.webp',
        'canonical': BASE_URL + '/contact.html',
    },
    'blog.html': {
        'title': 'Custom Packaging Blog | B2B Insights & Industry Guides | BestPackFactory',
        'desc': 'Expert guides on custom packaging for B2B buyers. Topics: coffee bags, flexible packaging, MOQ, material selection, printing techniques and more.',
        'og_image': BASE_URL + '/assets/hero/slide-01-one-stop.webp',
        'canonical': BASE_URL + '/blog.html',
    },
}

OG_TEMPLATE = '''<meta property="og:type" content="website"/>
<meta property="og:site_name" content="BestPackFactory"/>
<meta property="og:title" content="{title}"/>
<meta property="og:description" content="{desc}"/>
<meta property="og:image" content="{og_image}"/>
<meta property="og:url" content="{canonical}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{title}"/>
<meta name="twitter:description" content="{desc}"/>
<meta name="twitter:image" content="{og_image}"/>'''

SCHEMA_ORG_TEMPLATE = '''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BestPackFactory",
  "url": "https://bestpackfactory.com",
  "logo": "https://bestpackfactory.com/assets/logo/bestpackfactory-logo.svg",
  "description": "B2B custom packaging manufacturer. MOQ 500 PCS. Boxes, bags, labels, pouches, flexible packaging.",
  "foundingDate": "2010",
  "numberOfEmployees": {{"@type": "QuantitativeValue", "value": "200"}},
  "address": {{"@type": "PostalAddress", "addressCountry": "CN"}},
  "contactPoint": {{
    "@type": "ContactPoint",
    "contactType": "sales",
    "email": "lisa@colorprintingpackage.com",
    "availableLanguage": ["English", "Chinese"]
  }},
  "sameAs": ["https://bestpackfactory.com"]
}}
</script>'''

for page, seo in PAGE_SEO.items():
    if not os.path.exists(page):
        print('SKIP: ' + page)
        continue

    with open(page, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()

    # 1. Fix/update title
    new_title = '<title>' + seo['title'] + '</title>'
    if re.search(r'<title>.*?</title>', c):
        c = re.sub(r'<title>.*?</title>', new_title, c)
    else:
        c = c.replace('</head>', new_title + '\n</head>')

    # 2. Fix/update meta description
    new_desc = '<meta content="' + seo['desc'] + '" name="description"/>'
    if re.search(r'<meta[^>]+name="description"[^>]*/>', c) or re.search(r'<meta[^>]+name=.description.[^>]*/>', c):
        c = re.sub(r'<meta[^>]+name=["\']description["\'][^>]*/>', new_desc, c)
    else:
        c = c.replace('</head>', new_desc + '\n</head>')

    # 3. Add canonical if missing
    if 'rel="canonical"' not in c:
        canon = '<link href="' + seo['canonical'] + '" rel="canonical"/>'
        c = c.replace('</head>', canon + '\n</head>')

    # 4. Add/update Open Graph tags
    og_block = OG_TEMPLATE.format(**seo)
    if 'og:title' not in c:
        c = c.replace('</head>', og_block + '\n</head>')
    else:
        c = re.sub(r'<meta property="og:title"[^>]*/>', 
                   '<meta property="og:title" content="' + seo['title'] + '"/>', c)
        c = re.sub(r'<meta property="og:description"[^>]*/>', 
                   '<meta property="og:description" content="' + seo['desc'] + '"/>', c)

    # 5. Add Organization Schema to homepage
    if page == 'index.html' and 'schema.org' not in c.lower():
        c = c.replace('</head>', SCHEMA_ORG_TEMPLATE + '\n</head>')

    with open(page, 'w', encoding='utf-8') as f:
        f.write(c)
    print('SEO FIXED: ' + page)

print('Step 1 complete.')
