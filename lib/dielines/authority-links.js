const LINKS_BY_SLUG = {
  'coffee-bag-250g-valve-dieline': [
    ['/products/stand-up-pouch.html', 'Stand-up pouch manufacturer sourcing center'],
    ['/industries/food-packaging-manufacturer.html', 'Food packaging compliance and RFQ center'],
  ],
  'coffee-bag-500g-flat-bottom-dieline': [
    ['/products/flexible-packaging.html', 'Flexible packaging manufacturer sourcing center'],
    ['/industries/food-packaging-manufacturer.html', 'Food packaging compliance and RFQ center'],
  ],
  'mylar-bag-dieline': [
    ['/products/cannabis-mylar-bags.html', 'Cannabis Mylar bag sourcing center'],
    ['/products/flexible-packaging.html', 'Flexible packaging manufacturer sourcing center'],
  ],
  'child-resistant-pouch-dieline': [
    ['/products/cannabis-stand-up-pouches.html', 'Cannabis stand-up pouch compliance center'],
    ['/products/cannabis-mylar-bags.html', 'Cannabis Mylar bag sourcing center'],
  ],
  'stand-up-pouch-dieline': [
    ['/products/stand-up-pouch.html', 'Stand-up pouch manufacturer sourcing center'],
    ['/products/flexible-packaging.html', 'Flexible packaging manufacturer sourcing center'],
  ],
  'magnetic-rigid-box-dieline': [
    ['/products/custom-rigid-boxes.html', 'Rigid box manufacturer sourcing center'],
    ['/products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html', 'Luxury gift box manufacturer sourcing center'],
  ],
  'two-piece-gift-box-dieline': [
    ['/products/custom-rigid-boxes.html', 'Rigid box manufacturer sourcing center'],
    ['/products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html', 'Luxury gift box manufacturer sourcing center'],
  ],
  'wine-bottle-box-dieline': [
    ['/products/custom-rigid-boxes.html', 'Rigid box manufacturer sourcing center'],
    ['/products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html', 'Luxury gift box manufacturer sourcing center'],
  ],
  'paper-bag-dieline': [
    ['/products/paper-bags.html', 'Paper bag manufacturer sourcing center'],
  ],
};

const LINKS_BY_CATEGORY = {
  carton: [['/products/custom-packaging-boxes.html', 'Paper box manufacturer sourcing center']],
  shipping: [['/products/custom-packaging-boxes.html', 'Packaging box sourcing center']],
  bag: [['/products/paper-bags.html', 'Paper bag manufacturer sourcing center']],
  pouch: [['/products/flexible-packaging.html', 'Flexible packaging manufacturer sourcing center']],
  coffee: [['/products/stand-up-pouch.html', 'Stand-up pouch manufacturer sourcing center']],
  rigid: [['/products/custom-rigid-boxes.html', 'Rigid box manufacturer sourcing center']],
};

export function getDielineAuthorityLinks(entry) {
  if (!entry) return [];
  return LINKS_BY_SLUG[entry.slug] || LINKS_BY_CATEGORY[entry.category] || [];
}
