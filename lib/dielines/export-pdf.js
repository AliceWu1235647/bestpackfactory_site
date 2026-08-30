// Minimal single-page vector PDF writer (PDF 1.4, no compression).
// Written by hand so the browser needs no dependency. Illustrator opens this
// directly, which is why the same bytes are offered as the .ai download.

import { LAYER_STYLE, LAYERS, bounds, mm, PT_PER_MM } from './geometry.js';

const hexToRgb = hex => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ].map(v => Number(v.toFixed(4)));
};

const escapeText = s => String(s)
  .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
  .replace(/[^\x20-\x7E]/g, '');

const P = v => mm(Number(v) * PT_PER_MM);

function contentStream(entities) {
  const ops = ['1 J', '1 j'];
  let currentLayer = null;

  for (const e of entities) {
    if (e.layer !== currentLayer) {
      const style = LAYER_STYLE[e.layer] || LAYER_STYLE[LAYERS.CUT];
      const [r, g, b] = hexToRgb(style.color);
      ops.push(`${r} ${g} ${b} RG`);
      ops.push(`${mm(style.width * PT_PER_MM)} w`);
      ops.push(style.dash
        ? `[${style.dash.map(d => mm(d * PT_PER_MM)).join(' ')}] 0 d`
        : '[] 0 d');
      currentLayer = e.layer;
    }

    if (e.k === 'L') {
      ops.push(`${P(e.x1)} ${P(e.y1)} m ${P(e.x2)} ${P(e.y2)} l S`);
    } else if (e.k === 'P') {
      const [first, ...rest] = e.pts;
      let d = `${P(first[0])} ${P(first[1])} m`;
      for (const [x, y] of rest) d += ` ${P(x)} ${P(y)} l`;
      ops.push(e.closed ? `${d} s` : `${d} S`);
    } else if (e.k === 'C' || e.k === 'A') {
      // Bezier-approximated circle/arc: 4 quadrant curves is plenty at print scale.
      const k = 0.5523;
      const a1 = e.k === 'A' ? e.a1 : 0;
      const a2 = e.k === 'A' ? e.a2 : 360;
      const steps = Math.max(1, Math.ceil(Math.abs(a2 - a1) / 90));
      const seg = ((a2 - a1) / steps) * (Math.PI / 180);
      const pt = ang => [e.cx + e.r * Math.cos(ang), e.cy + e.r * Math.sin(ang)];
      let ang = (a1 * Math.PI) / 180;
      let [sx, sy] = pt(ang);
      let d = `${P(sx)} ${P(sy)} m`;
      for (let i = 0; i < steps; i += 1) {
        const next = ang + seg;
        const [ex, ey] = pt(next);
        const kk = (k * seg) / (Math.PI / 2);
        const c1 = [sx - kk * e.r * Math.sin(ang), sy + kk * e.r * Math.cos(ang)];
        const c2 = [ex + kk * e.r * Math.sin(next), ey - kk * e.r * Math.cos(next)];
        d += ` ${P(c1[0])} ${P(c1[1])} ${P(c2[0])} ${P(c2[1])} ${P(ex)} ${P(ey)} c`;
        ang = next; sx = ex; sy = ey;
      }
      ops.push(e.k === 'C' ? `${d} s` : `${d} S`);
    } else if (e.k === 'T') {
      const style = LAYER_STYLE[e.layer] || LAYER_STYLE[LAYERS.CUT];
      const [r, g, b] = hexToRgb(style.color);
      const size = mm(e.h * PT_PER_MM);
      const width = String(e.text).length * size * 0.5;
      const x = e.anchor === 'middle' ? P(e.x) - width / 2
        : e.anchor === 'end' ? P(e.x) - width
          : P(e.x);
      ops.push(`BT /F1 ${size} Tf ${r} ${g} ${b} rg ${x} ${P(e.y)} Td (${escapeText(e.text)}) Tj ET`);
      currentLayer = null; // fill colour was clobbered; force a stroke-state reset
    }
  }
  return ops.join('\n');
}

export function toPDF(entities, meta = {}) {
  const b = bounds(entities);
  const pad = 6;
  const pageW = P(b.maxX + pad);
  const pageH = P(b.maxY + pad);
  const stream = contentStream(entities);

  const now = meta.date || '20260101000000';
  const info = `<< /Title (${escapeText(meta.title || 'Dieline')}) `
    + `/Author (${escapeText(meta.author || 'BestPackFactory')}) `
    + `/Subject (${escapeText(meta.subject || 'Packaging dieline template')}) `
    + `/Keywords (${escapeText(meta.keywords || 'dieline, packaging template')}) `
    + `/Creator (${escapeText(meta.creator || 'BestPackFactory Dieline Generator')}) `
    + `/Producer (BestPackFactory) /CreationDate (D:${now}Z) >>`;

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] `
      + '/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    info
  ];

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\n`
    + `startxref\n${xrefStart}\n%%EOF\n`;

  return pdf;
}
