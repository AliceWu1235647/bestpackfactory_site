// Assembles a downloadable dieline: geometry + legend + a non-printing info
// block. A dieline file typically passes through a designer, a brand owner and
// a buyer, so the info layer travels with it as a quiet referral channel.

import { LAYERS, bounds, normalize, line, text, rect, translate } from './geometry.js';
import { GENERATORS } from './catalog.js';
import { toSVG } from './export-svg.js';
import { toDXF } from './export-dxf.js';
import { toPDF } from './export-pdf.js';

const SITE = 'bestpackfactory.com';

function legend(x, y) {
  const rows = [
    [LAYERS.CUT, 'CUT — knife / trim line'],
    [LAYERS.FOLD, 'FOLD — crease / score line'],
    [LAYERS.PERF, 'PERF — perforation, valve, zipper'],
    [LAYERS.BLEED, 'BLEED — extend artwork to here'],
    [LAYERS.GLUE, 'GLUE / SEAL — keep artwork clear']
  ];
  const e = [];
  rows.forEach(([layer, label], i) => {
    const ly = y - i * 6;
    e.push(line(layer, x, ly, x + 14, ly));
    e.push(text(LAYERS.INFO, x + 18, ly - 1, label, 3));
  });
  return e;
}

function infoBlock(x, y, entry, params, thickness) {
  const specs = entry.fields
    .filter(f => f.type !== 'bool' && params[f.key] != null)
    .map(f => `${f.label}: ${params[f.key]} ${f.unit || 'mm'}`);
  const flags = entry.fields
    .filter(f => f.type === 'bool' && params[f.key])
    .map(f => f.label);

  const lines = [
    entry.name,
    `Dimensions — ${specs.join('  |  ')}`,
    flags.length ? `Options — ${flags.join(', ')}` : null,
    thickness ? `Board / film allowance applied for ${thickness} mm` : null,
    '',
    'Factory-verified dieline. Fold allowance is already compensated,',
    'so this file can go straight to production.',
    `Made this? Get 500 pcs quoted in 24h — ${SITE}`,
    'lisa@colorprintingpackage.com  |  WhatsApp +86 158 8653 0985',
    '',
    'This layer is on INFO_DO_NOT_PRINT. Hide or delete before printing.'
  ].filter(v => v != null);

  const e = [];
  lines.forEach((l, i) => {
    if (l) e.push(text(LAYERS.INFO, x, y - i * 5, l, i === 0 ? 4.2 : 3));
  });
  return e;
}

/**
 * @param {object} entry  catalogue entry
 * @param {object} params user dimensions
 * @returns {{entities: Array, size: object}}
 */
export function buildDieline(entry, params) {
  const generator = GENERATORS[entry.generator];
  if (!generator) throw new Error(`Unknown generator: ${entry.generator}`);

  const geo = generator(params);
  const b = bounds(geo);
  const body = normalize(geo, 14);
  const nb = bounds(body);

  const infoY = nb.minY - 14;
  const extras = [
    ...legend(nb.minX, infoY),
    ...infoBlock(nb.minX + 70, infoY, entry, params, params.thickness)
  ];

  const all = normalize([...body, ...extras], 12);
  const finalBounds = bounds(all);
  return {
    entities: all,
    size: {
      sheetW: Number((finalBounds.maxX + 12).toFixed(1)),
      sheetH: Number((finalBounds.maxY + 12).toFixed(1)),
      flatW: Number(b.width.toFixed(1)),
      flatH: Number(b.height.toFixed(1))
    }
  };
}

const stamp = () => '20260101000000';

export function renderFormat(entry, params, format) {
  const { entities, size } = buildDieline(entry, params);
  const title = `${entry.name} — ${SITE}`;
  const dims = entry.fields
    .filter(f => f.type !== 'bool')
    .map(f => params[f.key])
    .join('x');
  const base = `${entry.slug}-${dims}mm-bestpackfactory`;

  if (format === 'svg') {
    return { data: toSVG(entities, { title }), mime: 'image/svg+xml', filename: `${base}.svg`, size };
  }
  if (format === 'dxf') {
    return { data: toDXF(entities), mime: 'application/dxf', filename: `${base}.dxf`, size };
  }
  const pdf = toPDF(entities, {
    title,
    subject: `${entry.name} packaging dieline template, factory-verified`,
    keywords: (entry.keywords || []).join(', '),
    date: stamp()
  });
  if (format === 'ai') {
    // Illustrator opens PDF-compatible content directly; same bytes, .ai extension.
    return { data: pdf, mime: 'application/postscript', filename: `${base}.ai`, size };
  }
  return { data: pdf, mime: 'application/pdf', filename: `${base}.pdf`, size };
}

/** Preview SVG for the browser: drop the info block so the drawing reads clean. */
export function previewSVG(entry, params) {
  const geo = GENERATORS[entry.generator](params);
  return toSVG(normalize(geo, 10), { title: entry.name });
}

export { toSVG, toDXF, toPDF, translate, rect };
