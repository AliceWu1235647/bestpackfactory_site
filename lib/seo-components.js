import React from 'react';

export function OrganizationSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BestPackFactory",
    "alternateName": "BPF Packaging",
    "url": "https://bestpackfactory.com",
    "logo": "https://bestpackfactory.com/assets/logo/bestpackfactory-logo.svg",
    "sameAs": [
      "https://bestpackfactory.com"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+86-158-8653-0985",
      "contactType": "sales",
      "areaServed": "Worldwide",
      "availableLanguage": ["English", "Chinese"]
    },
    "description": "B2B custom packaging manufacturer specialized in flexible packaging, luxury boxes, and pharma cartons."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BestPackFactory",
    "url": "https://bestpackfactory.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bestpackfactory.com/products?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
