// Dieline geometry primitives.
// All coordinates are millimetres in a Y-up space with the origin at the
// bottom-left of the flat sheet. Only the SVG writer flips Y, because DXF and
// PDF are both Y-up natively.

export const LAYERS = {
  CUT: 'CUT',
  FOLD: 'FOLD',
  PERF: 'PERF',
  BLEED: 'BLEED',
  GLUE: 'GLUE',
  DIM: 'DIM',
  INFO: 'INFO_DO_NOT_PRINT'
};

// Colour + stroke conventions a prepress operator expects to see.
export const LAYER_STYLE = {
  [LAYERS.CUT]: { color: '#151f1b', aci: 7, dash: null, width: 0.35 },
  [LAYERS.FOLD]: { color: '#007A3F', aci: 3, dash: [3, 2], width: 0.3 },
  [LAYERS.PERF]: { color: '#b68f3e', aci: 2, dash: [1.2, 1.2], width: 0.3 },
  [LAYERS.BLEED]: { color: '#d0463b', aci: 1, dash: [6, 3], width: 0.25 },
  [LAYERS.GLUE]: { color: '#8a94b8', aci: 5, dash: [0.8, 1.6], width: 0.25 },
  [LAYERS.DIM]: { color: '#66736d', aci: 8, dash: null, width: 0.2 },
  [LAYERS.INFO]: { color: '#9aa4a0', aci: 9, dash: null, width: 0.2 }
};

export const line = (layer, x1, y1, x2, y2) => ({ k: 'L', layer, x1, y1, x2, y2 });
export const poly = (layer, pts, closed = false) => ({ k: 'P', layer, pts, closed });
export const circle = (layer, cx, cy, r) => ({ k: 'C', layer, cx, cy, r });
export const arc = (layer, cx, cy, r, a1, a2) => ({ k: 'A', layer, cx, cy, r, a1, a2 });
export const text = (layer, x, y, value, h = 3, anchor = 'start') => ({
  k: 'T', layer, x, y, text: String(value), h, anchor
});

export const rect = (layer, x, y, w, h) =>
  poly(layer, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);

/**
 * Rounded rectangle approximated with line segments so every exporter can
 * consume it without needing arc support.
 */
export function roundRect(layer, x, y, w, h, r, seg = 8) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (radius === 0) return rect(layer, x, y, w, h);
  const pts = [];
  const corner = (cx, cy, from) => {
    for (let i = 0; i <= seg; i += 1) {
      const a = from + (Math.PI / 2) * (i / seg);
      pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
    }
  };
  corner(x + w - radius, y + radius, -Math.PI / 2);
  corner(x + w - radius, y + h - radius, 0);
  corner(x + radius, y + h - radius, Math.PI / 2);
  corner(x + radius, y + radius, Math.PI);
  return poly(layer, pts, true);
}

/** Horizontal crease across a panel, used constantly by folding cartons. */
export const crease = (y, x1, x2, layer = LAYERS.FOLD) => line(layer, x1, y, x2, y);

/** Vertical crease between two panels. */
export const creaseV = (x, y1, y2, layer = LAYERS.FOLD) => line(layer, x, y1, x, y2);

/**
 * Trapezoid tuck/dust flap. `taper` pulls the free edge in on both sides so the
 * flap clears the adjacent panel when the carton closes.
 */
export function taperedFlap(layer, x, y, w, h, taper, up = true) {
  const dir = up ? 1 : -1;
  return poly(layer, [
    [x, y],
    [x + taper, y + dir * h],
    [x + w - taper, y + dir * h],
    [x + w, y]
  ]);
}

/** Board-thickness allowance. Corrugated needs real compensation, folding box board barely any. */
export function foldAllowance(thickness) {
  const t = Number(thickness) || 0;
  if (t <= 0.6) return 0;
  return Number((t * 1.15).toFixed(2));
}

export function bounds(entities) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const hit = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  for (const e of entities) {
    if (e.k === 'L') { hit(e.x1, e.y1); hit(e.x2, e.y2); }
    else if (e.k === 'P') { for (const [x, y] of e.pts) hit(x, y); }
    else if (e.k === 'C' || e.k === 'A') { hit(e.cx - e.r, e.cy - e.r); hit(e.cx + e.r, e.cy + e.r); }
    else if (e.k === 'T') hit(e.x, e.y);
  }
  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function translate(entities, dx, dy) {
  return entities.map(e => {
    if (e.k === 'L') return { ...e, x1: e.x1 + dx, y1: e.y1 + dy, x2: e.x2 + dx, y2: e.y2 + dy };
    if (e.k === 'P') return { ...e, pts: e.pts.map(([x, y]) => [x + dx, y + dy]) };
    if (e.k === 'C' || e.k === 'A') return { ...e, cx: e.cx + dx, cy: e.cy + dy };
    if (e.k === 'T') return { ...e, x: e.x + dx, y: e.y + dy };
    return e;
  });
}

/** Shift a drawing so its bounding box starts at (margin, margin). */
export function normalize(entities, margin = 10) {
  const b = bounds(entities);
  return translate(entities, margin - b.minX, margin - b.minY);
}

export const mm = value => Number(Number(value).toFixed(3));
export const PT_PER_MM = 72 / 25.4;
