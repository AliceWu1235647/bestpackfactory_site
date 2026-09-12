# Dieline engineering standard and release gate

## Protected baseline recorded before this change

- Source branch: `restored-correct-20260904`
- Baseline commit: `a208257bc4199d3d27972155e5ff50905a8349bf`
- Production rollback deployment: `dpl_BmzskungFWcRfiqa1nKKZY1ezzve`
- Code rollback branch: `codex/rollback-before-production-dielines-20260912`
- Static build: 729 pages
- Canonical URLs in the local sitemap: 460
- Dielines: 17 primary routes and 180 preset-size routes
- Locale switcher baseline: 23 paths across six locales (138 passing cases)
- Browser baseline: 11 representative routes at 390 px and 1440 px (22 passing captures)
- Paper-bag download baseline: PDF, DXF, AI and SVG all downloaded successfully and were non-empty

The URL inventory remains the generated `public/sitemap.xml`. No route, slug,
download format, locale, product, blog or news URL may be removed by a dieline
change.

## What “production-preflight” means

The generator produces a dimensioned, 1:1 millimetre engineering template. It
is suitable for artwork planning, CAD review, blank sampling and supplier RFQ.
It is not an automatically released cutting die. Before tooling, the converting
factory must approve:

1. finished inside or outside dimension convention;
2. exact paper or board caliper and moisture condition;
3. die rule, crease rule and matrix/channel selection;
4. grain or flute direction;
5. glue, seal, handle and reinforcement construction;
6. machine-specific tolerances, nicks and waste stripping;
7. a physical unprinted blank and, where relevant, load or barrier testing.

No page or generated file may claim that an unreviewed parametric drawing can
go directly to press or tooling.

## Engineering changes in this release

### Square-bottom paper bag

- exposes top turn-over, bottom turn-in, side seam, paper caliper, handle-hole
  spacing and handle-hole diameter;
- includes two side-gusset centre scores and four bottom-forming diagonal
  scores;
- includes four handle punches, two reinforcement-patch guides, front/back
  safe-artwork areas and a machine/grain-direction guide;
- keeps the existing URL and four free download formats.

### Reverse and straight tuck-end carton

- treats entered dimensions as finished inside dimensions and adds board
  caliper to score-to-score panels;
- separates knife lines from flap hinge score lines;
- adds closure support flaps, tapered dust flaps, relief clearance, tuck
  shoulders and a secondary roll score;
- verifies both straight-tuck and reverse-tuck configurations.

### Dedicated carton and rigid-box structures

- two-piece rigid boxes generate separate base/lid wrap blanks and individual
  greyboard floor/wall pieces instead of reusing a folding tray;
- double wine-bottle presets add a glue-tab centre divider, while the page
  explicitly requires the actual bottle profile for the fitted insert;
- gable-top cartons have a dedicated roof, two side-gable panels and paired
  die-cut handle panels;
- roll-end tray pages generate separate locking-corner base and lid blanks with
  adjustable caliper allowance, clearance and lid-wall depth;
- mapping tests prevent these named structures from silently falling back to a
  generic tray or tuck-carton generator.

### Every generated file

- uses the same geometry pipeline for SVG, DXF, PDF and PDF-compatible AI;
- identifies 1:1 millimetre scale and includes a 100 mm calibration bar;
- includes a visible preflight status and the required converter approval gate;
- rejects unsupported export formats;
- is checked for finite coordinates, positive sheet bounds, CUT/FOLD presence,
  exact CUT/FOLD line overlap, millimetre units and file signatures.

## Release commands

Run these before creating a Vercel Preview:

```text
npm run test:dielines
npm run check:protected-markup
npm run build
```

Then repeat the protected browser test at 390 px and 1440 px, click-download
PDF/DXF/AI/SVG from the paper-bag and the six carton/rigid-box regression pages,
and compare all protected screenshots against the baseline. Production promotion
requires a separately approved Preview deployment ID.
