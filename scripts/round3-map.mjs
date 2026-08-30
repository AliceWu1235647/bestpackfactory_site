// Round-3 补齐:为仍弱链的 21 篇博客补充语义对应的产品页入链。
// 三元组 [productSlug, blogSlug, 锚文本] —— 避免键覆盖,合并进主映射后注入。
export const ROUND3 = [
  // candle packaging
  ["custom-luxury-candle-boxes-rigid-inserts.html", "candle-packaging-materials-guide", "Candle Packaging Materials Guide"],
  ["custom-luxury-cosmetic-boxes-eva-inserts.html", "candle-packaging-materials-guide", "Candle Packaging Materials Guide"],
  ["custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html", "candle-packaging-materials-guide", "Candle Packaging Materials Guide"],
  ["custom-luxury-candle-boxes-rigid-inserts.html", "luxury-candle-packaging", "Luxury Candle Packaging"],
  ["custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html", "luxury-candle-packaging", "Luxury Candle Packaging"],
  ["custom-luxury-candle-boxes-rigid-inserts.html", "wine-spirits-packaging-guide", "Wine & Spirits Packaging Guide"],

  // folding carton printing
  ["custom-folding-cartons.html", "custom-folding-carton-printing-guide", "Custom Folding Carton Printing Guide"],
  ["pharmaceutical-folding-cartons.html", "custom-folding-carton-printing-guide", "Custom Folding Carton Printing Guide"],
  ["custom-boxes.html", "custom-folding-carton-printing-guide", "Custom Folding Carton Printing Guide"],

  // subscription boxes
  ["custom-pr-boxes-influencer-kits-compartment-inserts.html", "custom-packaging-for-subscription-boxes", "Custom Packaging for Subscription Boxes"],
  ["custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html", "custom-packaging-for-subscription-boxes", "Custom Packaging for Subscription Boxes"],
  ["custom-packaging-boxes.html", "custom-packaging-for-subscription-boxes", "Custom Packaging for Subscription Boxes"],
  ["custom-luxury-apparel-magnetic-boxes-tissue-paper.html", "subscription-box-packaging", "Subscription Box Packaging"],
  ["custom-pr-boxes-influencer-kits-compartment-inserts.html", "subscription-box-packaging", "Subscription Box Packaging"],
  ["custom-boxes.html", "subscription-box-packaging", "Subscription Box Packaging"],

  // flat pack / cost reduction / rigid vs folding
  ["custom-boxes.html", "flat-pack-vs-assembled-packaging", "Flat Pack vs Assembled Packaging"],
  ["custom-packaging-boxes.html", "flat-pack-vs-assembled-packaging", "Flat Pack vs Assembled Packaging"],
  ["custom-rigid-boxes.html", "flat-pack-vs-assembled-packaging", "Flat Pack vs Assembled Packaging"],
  ["custom-packaging-boxes.html", "packaging-cost-reduction", "Packaging Cost Reduction"],
  ["custom-rigid-boxes.html", "packaging-cost-reduction", "Packaging Cost Reduction"],
  ["custom-rigid-boxes.html", "rigid-box-vs-folding-carton", "Rigid Box vs Folding Carton"],
  ["custom-boxes.html", "rigid-box-vs-folding-carton", "Rigid Box vs Folding Carton"],

  // reduce packaging weight
  ["custom-compostable-stand-up-pouches.html", "how-to-reduce-packaging-weight", "How to Reduce Packaging Weight"],
  ["custom-retort-pouches-ready-meal-packaging.html", "how-to-reduce-packaging-weight", "How to Reduce Packaging Weight"],
  ["food-packaging.html", "how-to-reduce-packaging-weight", "How to Reduce Packaging Weight"],

  // baby products / electronics esd
  ["custom-keepsake-gift-boxes-compartments-baby-book-sets.html", "packaging-for-baby-products", "Packaging for Baby Products"],
  ["custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html", "packaging-for-baby-products", "Packaging for Baby Products"],
  ["custom-jewelry-packaging-boxes-inserts-pouches.html", "packaging-for-baby-products", "Packaging for Baby Products"],
  ["custom-pr-boxes-influencer-kits-compartment-inserts.html", "packaging-for-electronics-esd", "Packaging for Electronics (ESD)"],
  ["custom-boxes.html", "packaging-for-electronics-esd", "Packaging for Electronics (ESD)"],
  ["custom-pp-ring-binder-folders.html", "packaging-for-electronics-esd", "Packaging for Electronics (ESD)"],

  // perfume / fragrance
  ["custom-perfume-packaging-boxes-flocked-inserts.html", "perfume-packaging-design", "Perfume Packaging Design"],
  ["custom-perfume-packaging-boxes-flocked-inserts.html", "packaging-for-perfume-fragrance", "Packaging for Perfume & Fragrance"],
  ["custom-luxury-cosmetic-boxes-eva-inserts.html", "perfume-packaging-design", "Perfume Packaging Design"],
  ["custom-cosmetic-packaging-boxes.html", "packaging-for-perfume-fragrance", "Packaging for Perfume & Fragrance"],

  // pet food requirements / tea coffee trends
  ["pet-food-bags.html", "pet-food-packaging-requirements", "Pet Food Packaging Requirements"],
  ["dog-food-flat-bottom-bags.html", "pet-food-packaging-requirements", "Pet Food Packaging Requirements"],
  ["protein-powder-stand-up-pouches.html", "pet-food-packaging-requirements", "Pet Food Packaging Requirements"],
  ["custom-tea-packaging-bags.html", "tea-coffee-packaging-trends", "Tea & Coffee Packaging Trends"],
  ["kraft-paper-coffee-bags.html", "tea-coffee-packaging-trends", "Tea & Coffee Packaging Trends"],
  ["custom-coffee-bags.html", "tea-coffee-packaging-trends", "Tea & Coffee Packaging Trends"],

  // wine spirits
  ["wine-magnetic-gift-boxes.html", "wine-spirits-packaging-guide", "Wine & Spirits Packaging Guide"],
  ["custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html", "wine-spirits-packaging-guide", "Wine & Spirits Packaging Guide"],

  // factory audit (0-link)
  ["custom-boxes.html", "china-packaging-factory-audit-checklist", "China Packaging Factory Audit Checklist"],
  ["custom-rigid-boxes.html", "china-packaging-factory-audit-checklist", "China Packaging Factory Audit Checklist"],
  ["custom-packaging-boxes.html", "china-packaging-factory-audit-checklist", "China Packaging Factory Audit Checklist"],
  ["custom-folding-cartons.html", "china-packaging-factory-audit-checklist", "China Packaging Factory Audit Checklist"],
  ["custom-boxes.html", "packaging-factory-audit-guide", "Packaging Factory Audit Guide"],
  ["custom-rigid-boxes.html", "packaging-factory-audit-guide", "Packaging Factory Audit Guide"],
  ["custom-packaging-boxes.html", "packaging-factory-audit-guide", "Packaging Factory Audit Guide"],
  ["custom-folding-cartons.html", "packaging-factory-audit-guide", "Packaging Factory Audit Guide"],
  ["pet-food-bags.html", "packaging-factory-audit-guide", "Packaging Factory Audit Guide"],

  // MOQ / payment / incoterms (0-link)
  ["custom-compostable-stand-up-pouches.html", "packaging-minimum-order-guide", "Packaging Minimum Order Guide"],
  ["custom-stand-up-pouches.html", "packaging-minimum-order-guide", "Packaging Minimum Order Guide"],
  ["custom-paper-bags.html", "packaging-minimum-order-guide", "Packaging Minimum Order Guide"],
  ["custom-rigid-boxes.html", "packaging-payment-terms-guide", "Packaging Payment Terms Guide"],
  ["custom-boxes.html", "packaging-payment-terms-guide", "Packaging Payment Terms Guide"],
  ["custom-compostable-stand-up-pouches.html", "packaging-payment-terms-guide", "Packaging Payment Terms Guide"],
  ["custom-rigid-boxes.html", "packaging-incoterms-guide-fob-exw-ddp", "Packaging Incoterms: FOB, EXW, DDP"],
  ["food-packaging.html", "packaging-incoterms-guide-fob-exw-ddp", "Packaging Incoterms: FOB, EXW, DDP"],
  ["pet-food-bags.html", "packaging-incoterms-guide-fob-exw-ddp", "Packaging Incoterms: FOB, EXW, DDP"],
];
