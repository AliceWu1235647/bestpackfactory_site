export const SITE_URL = 'https://www.bestpackfactory.com';

export function siteUrl(path = '') {
  const cleanPath = String(path || '');
  if (!cleanPath) return SITE_URL;
  return `${SITE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
}

export function forceWww(value = '') {
  return String(value || '').replace(/https:\/\/bestpackfactory\.com/gi, SITE_URL);
}

export function stripHtml(value = '') {
  return String(value || '')
    .replace(/&lt;\s*a\b[^&]*(?:&gt;)?/gi, '')
    .replace(/&lt;\s*\/\s*a\s*&gt;/gi, '')
    .replace(/<\s*a\b[^>]*>/gi, '')
    .replace(/<\s*\/\s*a\s*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function safeJsonLd(value) {
  if (!value) return null;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return JSON.stringify(JSON.parse(forceWww(JSON.stringify(parsed))));
  } catch {
    return null;
  }
}

export function absoluteImageUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return forceWww(raw);
  if (raw.startsWith('/')) return siteUrl(raw);
  return siteUrl(`/${raw.replace(/^\.?\//, '')}`);
}

export function canonicalForRoute(routePath = '') {
  const clean = String(routePath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^index\.html$/, '')
    .replace(/\/index\.html$/, '/');
  return clean ? siteUrl(`/${clean}`) : `${SITE_URL}/`;
}

function cleanRoute(routePath = '') {
  return String(routePath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/^index\.html$/, '');
}

function productNameFromTitle(title = '', routePath = '') {
  const route = cleanRoute(routePath);
  const overrides = {
    'products/pet-bottles.html': 'Custom PET Bottles',
    'products/pet-bottles-candy-pharma.html': 'Candy Pharma PET Bottles'
  };
  if (overrides[route]) return overrides[route];
  const base = stripHtml(title).split('|')[0].trim();
  if (base) return base;
  const slug = route.replace(/^products\//, '').replace(/\.html$/, '');
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function trimToWord(value = '', maxLength = 160, ending = '.') {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, maxLength - 1).replace(/\s+\S*$/, '').trim();
  return `${shortened}${ending}`;
}

export function conciseProductTitle(title = '', routePath = '') {
  const name = productNameFromTitle(title, routePath);
  const candidates = [
    `${name} | MOQ 500 PCS | BestPackFactory`,
    `${name} | MOQ 500 Custom Packaging`,
    `${name} | Custom Packaging | BPF`
  ];
  const fit = candidates.find((candidate) => candidate.length <= 65);
  if (fit) return fit;
  return `${trimToWord(name, 42, '')} | Custom Packaging`;
}

export function conciseProductDescription(description = '', title = '', routePath = '') {
  const route = cleanRoute(routePath);
  const name = productNameFromTitle(title || description, route);
  const overrides = {
    'products/pet-bottles.html': 'Custom PET bottles from BestPackFactory. MOQ 500 PCS, OEM capacity/color/closure options, label support and export packing for B2B buyers.',
    'products/pet-bottles-candy-pharma.html': 'PET bottles for candy and pharma packaging. MOQ 500 PCS, custom capacity, closures, labeling and export packing from BestPackFactory.',
    'products/custom-shrink-sleeve-labels-bottles-cans.html': 'Custom shrink sleeve labels for bottles and cans. MOQ 500 PCS, OEM size, material, logo, finish and export support from BestPackFactory.'
  };
  if (overrides[route]) return overrides[route];

  const candidates = [
    `${name} from BestPackFactory. MOQ 500 PCS, OEM size/material/logo/finish, free dieline support and worldwide shipping.`,
    `${name}: MOQ 500 PCS custom packaging with OEM size, material, logo, finish, dieline support and worldwide shipping.`,
    `${name}: factory-direct custom packaging, MOQ 500 PCS, OEM branding and export support.`
  ];
  return candidates.find((candidate) => candidate.length <= 160) || trimToWord(candidates.at(-1), 160);
}

export function optimizeMetadataForRoute(metadata = {}, routePath = '') {
  const route = cleanRoute(routePath);
  const canonical = metadata?.alternates?.canonical ? forceWww(metadata.alternates.canonical) : canonicalForRoute(route);
  const pageOverrides = {
    'index.html': {
      title: 'Custom Packaging Manufacturer | MOQ 500 PCS',
      description: 'BestPackFactory makes custom boxes, bags, labels, bottles and pouches. MOQ 500 PCS, factory direct quotes, free dieline and worldwide shipping.'
    },
    'products.html': {
      title: 'Custom Packaging Products | MOQ 500 PCS',
      description: 'Browse custom packaging products: boxes, coffee bags, mylar bags, spout pouches, labels and bottles. Factory direct B2B quotes, MOQ 500 PCS.'
    },
    'about.html': {
      title: 'About BestPackFactory | Packaging Manufacturer',
      description: 'BestPackFactory manufactures custom packaging for global B2B buyers with OEM printing, sampling, QC support and worldwide shipping.'
    },
    'blog.html': {
      title: 'Custom Packaging Blog | B2B Buyer Guides',
      description: 'B2B packaging guides for materials, MOQ, dielines, sampling, QC, shipping and supplier selection from BestPackFactory.'
    },
    'news.html': {
      title: 'Packaging News & Factory Updates | BestPackFactory',
      description: 'BestPackFactory news, sourcing updates and factory notes for B2B custom packaging buyers.'
    },
    'trust-profile.html': {
      title: 'BestPackFactory Trust Profile | B2B Packaging',
      description: 'Official BestPackFactory trust profile for AI search, procurement review, MOQ 500 PCS, factory-direct packaging, sampling, QC and shipping.'
    }
  };
  const optimized = {
    ...metadata,
    alternates: {
      ...(metadata.alternates || {}),
      canonical
    }
  };

  if (pageOverrides[route]) {
    const override = pageOverrides[route];
    optimized.title = override.title;
    optimized.description = override.description;
    optimized.openGraph = {
      ...(metadata.openGraph || {}),
      title: override.title,
      description: override.description,
      url: canonical,
      siteName: metadata.openGraph?.siteName || 'BestPackFactory'
    };
    optimized.twitter = metadata.twitter ? {
      ...metadata.twitter,
      title: override.title,
      description: override.description
    } : {
      card: 'summary_large_image',
      title: override.title,
      description: override.description
    };
  }

  if (!route.startsWith('products/')) return optimized;

  const title = conciseProductTitle(metadata.title, route);
  const description = conciseProductDescription(metadata.description, metadata.title, route);
  optimized.title = title;
  optimized.description = description;
  optimized.openGraph = {
    ...(metadata.openGraph || {}),
    title,
    description,
    url: canonical,
    siteName: metadata.openGraph?.siteName || 'BestPackFactory'
  };
  optimized.twitter = metadata.twitter ? {
    ...metadata.twitter,
    title,
    description
  } : {
    card: 'summary_large_image',
    title,
    description
  };
  return optimized;
}
