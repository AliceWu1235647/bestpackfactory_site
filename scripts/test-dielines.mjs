import { DIELINES, GENERATORS, defaultParams } from '../lib/dielines/catalog.js';
import { renderFormat, buildDieline } from '../lib/dielines/build.js';

let fail = 0;
const failed = (slug, message) => {
  fail += 1;
  console.log(`   !! ${slug}: ${message}`);
};

const segmentKey = segment => {
  const a = segment.slice(0, 2).map(Number);
  const b = segment.slice(2, 4).map(Number);
  const ordered = (a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1])) ? [...a, ...b] : [...b, ...a];
  return ordered.map(v => v.toFixed(3)).join(',');
};

const segments = entity => {
  if (entity.k === 'L') return [[entity.x1, entity.y1, entity.x2, entity.y2]];
  if (entity.k !== 'P') return [];
  const out = entity.pts.slice(1).map((point, index) => [...entity.pts[index], ...point]);
  if (entity.closed && entity.pts.length > 1) out.push([...entity.pts.at(-1), ...entity.pts[0]]);
  return out;
};

for (const d of DIELINES) {
  try {
    const p = defaultParams(d);
    const { entities, size } = buildDieline(d, p);
    const bad = entities.filter(e => {
      if (e.k === 'L') return ![e.x1,e.y1,e.x2,e.y2].every(Number.isFinite);
      if (e.k === 'P') return e.pts.some(([x,y]) => !Number.isFinite(x)||!Number.isFinite(y));
      if (e.k === 'C'||e.k==='A') return ![e.cx,e.cy,e.r].every(Number.isFinite);
      if (e.k === 'T') return !Number.isFinite(e.x)||!Number.isFinite(e.y);
      return false;
    });
    const rendered = {};
    const out = {};
    for (const f of ['svg','dxf','pdf','ai']) {
      rendered[f] = renderFormat(d, p, f).data;
      out[f] = rendered[f].length;
    }
    console.log(`OK  ${d.slug.padEnd(36)} ent=${String(entities.length).padStart(4)} NaN=${bad.length} sheet=${size.sheetW}x${size.sheetH} svg=${out.svg} dxf=${out.dxf} pdf=${out.pdf}`);
    if (bad.length) failed(d.slug, `non-finite geometry ${JSON.stringify(bad.slice(0, 2))}`);
    if (size.sheetW <= 0 || size.sheetH <= 0) failed(d.slug, 'invalid sheet bounds');
    if (!entities.some(e => e.layer === 'CUT')) failed(d.slug, 'missing CUT geometry');
    if (!entities.some(e => e.layer === 'FOLD')) failed(d.slug, 'missing FOLD geometry');

    const cutLines = new Set(entities.filter(e => e.layer === 'CUT').flatMap(segments).map(segmentKey));
    const cutFoldOverlap = entities.filter(e => e.layer === 'FOLD').flatMap(segments)
      .filter(segment => cutLines.has(segmentKey(segment)));
    if (cutFoldOverlap.length) failed(d.slug, `${cutFoldOverlap.length} exact CUT/FOLD line overlap(s)`);

    if (!rendered.svg.includes('width="') || !rendered.svg.includes('mm" height="')) {
      failed(d.slug, 'SVG does not declare millimetre output size');
    }
    if (!rendered.svg.includes('data-scale="1:1"')) failed(d.slug, 'SVG is missing 1:1 scale metadata');
    if (!rendered.dxf.includes('$INSUNITS\n70\n4')) failed(d.slug, 'DXF is not explicitly millimetres');
    if (!rendered.pdf.startsWith('%PDF-1.4') || !rendered.pdf.endsWith('%%EOF\n')) {
      failed(d.slug, 'PDF signature or EOF marker is invalid');
    }
    if (!rendered.ai.startsWith('%PDF-1.4')) failed(d.slug, 'AI download is not PDF-compatible artwork');
  } catch (err) { failed(d.slug, err.message); }
}

let presetCases = 0;
for (const d of DIELINES) {
  for (const preset of (d.presets || [])) {
    presetCases += 1;
    try {
      const params = { ...defaultParams(d), ...preset.values };
      const { entities, size } = buildDieline(d, params);
      if (!entities.length || size.flatW <= 0 || size.flatH <= 0) {
        failed(d.slug, `preset "${preset.name}" produced empty or invalid geometry`);
      }
      // SVG is the browser/download geometry and is cheap enough to validate
      // across every public preset route.
      const svg = renderFormat(d, params, 'svg').data;
      if (!svg.includes('data-scale="1:1"')) failed(d.slug, `preset "${preset.name}" lost scale metadata`);
    } catch (err) {
      failed(d.slug, `preset "${preset.name}": ${err.message}`);
    }
  }
}

const paperBag = DIELINES.find(d => d.slug === 'paper-bag-dieline');
if (paperBag) {
  for (const preset of paperBag.presets) {
    const raw = GENERATORS[paperBag.generator]({ ...defaultParams(paperBag), ...preset.values });
    const handleHoles = raw.filter(e => e.k === 'C' && e.layer === 'CUT');
    const diagonals = raw.filter(e => e.k === 'L' && e.layer === 'FOLD' && e.x1 !== e.x2 && e.y1 !== e.y2);
    if (handleHoles.length !== 4) failed(paperBag.slug, `preset "${preset.name}" expected 4 handle holes, found ${handleHoles.length}`);
    if (diagonals.length < 4) failed(paperBag.slug, `preset "${preset.name}" expected 4 bottom-forming diagonal scores, found ${diagonals.length}`);
    if (!raw.some(e => e.layer === 'SAFE_ARTWORK')) failed(paperBag.slug, `preset "${preset.name}" missing SAFE_ARTWORK panels`);
    if (!raw.some(e => e.layer === 'GLUE')) failed(paperBag.slug, `preset "${preset.name}" missing side-seam / reinforcement guide`);
  }
}

const tuck = DIELINES.find(d => d.slug === 'tuck-end-box-dieline');
if (tuck) {
  for (const straight of [false, true]) {
    const params = { ...defaultParams(tuck), straight };
    const entities = GENERATORS[tuck.generator](params);
    const bodyEdgeCuts = entities.filter(e => e.k === 'L' && e.layer === 'CUT'
      && (e.y1 === 0 && e.y2 === 0 || e.y1 === params.height && e.y2 === params.height));
    if (bodyEdgeCuts.length) failed(tuck.slug, `${straight ? 'straight' : 'reverse'} tuck has a CUT line across a flap hinge`);
  }
}

const expectedGenerators = {
  'display-tray-dieline': 'trayBox',
  'two-piece-gift-box-dieline': 'twoPieceRigidBox',
  'wine-bottle-box-dieline': 'wineBottleRigidBox',
  'gable-top-box-dieline': 'gableTopCarton',
  'roll-end-tray-dieline': 'trayLidBox'
};
for (const [slug, generator] of Object.entries(expectedGenerators)) {
  const entry = DIELINES.find(d => d.slug === slug);
  if (!entry || entry.generator !== generator) {
    failed(slug, `expected dedicated ${generator} generator, found ${entry?.generator || 'missing entry'}`);
  }
}

const expectInfoLabels = (slug, labels, override = {}) => {
  const entry = DIELINES.find(d => d.slug === slug);
  if (!entry) return;
  const entities = GENERATORS[entry.generator]({ ...defaultParams(entry), ...override });
  const info = entities.filter(e => e.k === 'T').map(e => e.text);
  for (const label of labels) {
    if (!info.some(value => value.includes(label))) failed(slug, `missing construction label "${label}"`);
  }
};
expectInfoLabels('two-piece-gift-box-dieline', ['BASE WRAP', 'LID WRAP', 'BASE FLOOR', 'LID FLOOR']);
expectInfoLabels('wine-bottle-box-dieline', ['CENTRE DIVIDER'], { divider: true });
expectInfoLabels('gable-top-box-dieline', ['HANDLE PANEL A', 'HANDLE PANEL B']);
expectInfoLabels('roll-end-tray-dieline', ['BASE TRAY', 'LID — CONFIRM CLEARANCE']);

console.log(`\nvalidated ${DIELINES.length} default drawings and ${presetCases} preset drawings`);
console.log(fail ? `${fail} FAILURES` : 'all generators clean');
process.exit(fail ? 1 : 0);
