// SVG writer. Doubles as the on-screen preview and a downloadable vector file,
// so the preview is literally the same geometry the customer receives.

import { LAYER_STYLE, LAYERS, bounds, mm } from './geometry.js';

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function entitySvg(e, flipY) {
  const style = LAYER_STYLE[e.layer] || LAYER_STYLE[LAYERS.CUT];
  const dash = style.dash ? ` stroke-dasharray="${style.dash.join(' ')}"` : '';
  const common = `fill="none" stroke="${style.color}" stroke-width="${style.width}"${dash}`;
  const Y = y => mm(flipY - y);

  if (e.k === 'L') {
    return `<line x1="${mm(e.x1)}" y1="${Y(e.y1)}" x2="${mm(e.x2)}" y2="${Y(e.y2)}" ${common}/>`;
  }
  if (e.k === 'P') {
    const d = e.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${mm(x)} ${Y(y)}`).join(' ')
      + (e.closed ? ' Z' : '');
    return `<path d="${d}" ${common}/>`;
  }
  if (e.k === 'C') {
    return `<circle cx="${mm(e.cx)}" cy="${Y(e.cy)}" r="${mm(e.r)}" ${common}/>`;
  }
  if (e.k === 'A') {
    const p = a => {
      const rad = (a * Math.PI) / 180;
      return [e.cx + e.r * Math.cos(rad), e.cy + e.r * Math.sin(rad)];
    };
    const [x1, y1] = p(e.a1);
    const [x2, y2] = p(e.a2);
    const sweep = ((e.a2 - e.a1 + 360) % 360) > 180 ? 1 : 0;
    return `<path d="M${mm(x1)} ${Y(y1)} A${mm(e.r)} ${mm(e.r)} 0 ${sweep} 0 ${mm(x2)} ${Y(y2)}" ${common}/>`;
  }
  if (e.k === 'T') {
    const anchor = e.anchor === 'middle' ? 'middle' : e.anchor === 'end' ? 'end' : 'start';
    return `<text x="${mm(e.x)}" y="${Y(e.y)}" font-family="Helvetica, Arial, sans-serif" `
      + `font-size="${mm(e.h)}" fill="${style.color}" text-anchor="${anchor}">${esc(e.text)}</text>`;
  }
  return '';
}

/**
 * @param {Array} entities dieline entities in Y-up mm space
 * @param {object} opts    { hiddenLayers, title }
 */
export function toSVG(entities, opts = {}) {
  const hidden = new Set(opts.hiddenLayers || []);
  const visible = entities.filter(e => !hidden.has(e.layer));
  const b = bounds(entities);
  const pad = 6;
  const w = mm(b.maxX + pad);
  const h = mm(b.maxY + pad);
  const flipY = b.maxY + pad;

  const groups = {};
  for (const e of visible) {
    if (!groups[e.layer]) groups[e.layer] = [];
    groups[e.layer].push(entitySvg(e, flipY));
  }
  // Cut last so it reads on top of shaded glue/bleed hints.
  const order = [LAYERS.BLEED, LAYERS.GLUE, LAYERS.DIM, LAYERS.INFO, LAYERS.PERF, LAYERS.FOLD, LAYERS.CUT];
  const keys = [...order.filter(k => groups[k]), ...Object.keys(groups).filter(k => !order.includes(k))];

  const body = keys
    .map(k => `<g id="${esc(k)}" data-layer="${esc(k)}">\n${groups[k].join('\n')}\n</g>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">
<title>${esc(opts.title || 'Dieline')}</title>
${body}
</svg>`;
}
