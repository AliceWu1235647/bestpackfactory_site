// Folding carton dielines. Dimensions follow the trade convention
// L x W x H = front panel width x side panel depth x body height.

import {
  LAYERS, line, poly, rect, text, taperedFlap, foldAllowance, roundRect, circle
} from './geometry.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Glue tab hinged off the left edge of the first panel. */
function glueTab(x, h, tabW) {
  const inset = clamp(h * 0.04, 1.5, 4);
  return [
    poly(LAYERS.CUT, [
      [x, inset],
      [x - tabW, inset + 2.5],
      [x - tabW, h - inset - 2.5],
      [x, h - inset]
    ]),
    line(LAYERS.CUT, x, 0, x, inset),
    line(LAYERS.CUT, x, h - inset, x, h),
    line(LAYERS.FOLD, x, 0, x, h),
    text(LAYERS.GLUE, x - tabW / 2, h / 2, 'GLUE', 2.6, 'middle')
  ];
}

/**
 * Reverse / straight tuck end carton.
 * @param {object} p { length, width, height, thickness, straight }
 */
export function tuckEndCarton(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 0.4;
  const a = foldAllowance(t);
  const straight = Boolean(p.straight);

  const tabW = clamp(L * 0.18, 10, 18);
  const tuck = clamp(W - 2 - a, 8, W);          // tuck panel depth
  const lip = clamp(tuck * 0.55, 5, 14);        // rolled tuck lip
  const dust = clamp(W - 3 - a, 6, W);          // dust flap depth
  const taper = clamp(W * 0.12, 1.5, 4);

  const xb = tabW;
  const p1 = xb;                 // back  (L)
  const p2 = p1 + L;             // side  (W)
  const p3 = p2 + W;             // front (L)
  const p4 = p3 + L;             // side  (W)
  const right = p4 + W;

  const e = [];

  // Body outline and vertical creases.
  e.push(line(LAYERS.CUT, xb, 0, right, 0));
  e.push(line(LAYERS.CUT, xb, H, right, H));
  e.push(line(LAYERS.CUT, right, 0, right, H));
  for (const x of [p2, p3, p4]) e.push(line(LAYERS.FOLD, x, 0, x, H));
  e.push(...glueTab(xb, H, tabW));

  // Tuck assembly on one panel, plus its retaining slit.
  const tuckAt = (x, w, up) => {
    const dir = up ? 1 : -1;
    const base = up ? H : 0;
    const tp = clamp(w * 0.1, 2, 5);
    e.push(poly(LAYERS.CUT, [
      [x, base],
      [x + tp, base + dir * tuck],
      [x + w - tp, base + dir * tuck],
      [x + w, base]
    ]));
    e.push(poly(LAYERS.CUT, [
      [x + tp, base + dir * tuck],
      [x + tp + 2, base + dir * (tuck + lip)],
      [x + w - tp - 2, base + dir * (tuck + lip)],
      [x + w - tp, base + dir * tuck]
    ]));
    e.push(line(LAYERS.FOLD, x, base, x + w, base));
    e.push(line(LAYERS.FOLD, x + tp, base + dir * tuck, x + w - tp, base + dir * tuck));
  };

  const dustAt = (x, w, up) => {
    e.push(taperedFlap(LAYERS.CUT, x, up ? H : 0, w, dust, taper, up));
    e.push(line(LAYERS.FOLD, x, up ? H : 0, x + w, up ? H : 0));
  };

  // Reverse tuck alternates ends so the blank nests tighter on the sheet.
  const topTuckX = straight ? p3 : p1;
  const botTuckX = p3;
  tuckAt(topTuckX, L, true);
  tuckAt(botTuckX, L, false);
  dustAt(p2, W, true);
  dustAt(p4, W, true);
  dustAt(p2, W, false);
  dustAt(p4, W, false);

  // The panel opposite each tuck stays open; mark its free edge as cut.
  e.push(line(LAYERS.CUT, straight ? p1 : p3, H, straight ? p1 + L : p3 + L, H));
  e.push(line(LAYERS.CUT, p1, 0, p1 + L, 0));

  e.push(text(LAYERS.DIM, p3 + L / 2, -dust - 8, `${L} x ${W} x ${H} mm`, 4, 'middle'));
  return e;
}

/** Open-ended sleeve / belly band. */
export function sleeve(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 0.4;
  const a = foldAllowance(t);
  const tabW = clamp(L * 0.16, 10, 20);

  const xb = tabW;
  const stops = [xb, xb + L + a, xb + L + W + 2 * a, xb + 2 * L + W + 3 * a];
  const right = xb + 2 * L + 2 * W + 4 * a;

  const e = [
    line(LAYERS.CUT, xb, 0, right, 0),
    line(LAYERS.CUT, xb, H, right, H),
    line(LAYERS.CUT, right, 0, right, H),
    ...glueTab(xb, H, tabW),
    text(LAYERS.DIM, xb + L / 2, -8, `Sleeve ${L} x ${W} x ${H} mm`, 4, 'middle')
  ];
  for (const x of stops.slice(1)) e.push(line(LAYERS.FOLD, x, 0, x, H));
  return e;
}

/** Pillow box with curved end closures. */
export function pillowBox(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const tabW = clamp(L * 0.14, 8, 16);
  const curve = clamp(W * 0.5, 6, W);
  const seg = 14;

  const xb = tabW;
  const spanW = L + W * 0.6;
  const stops = [xb, xb + spanW, xb + 2 * spanW];
  const right = xb + 2 * spanW;

  const e = [...glueTab(xb, H, tabW)];
  e.push(line(LAYERS.CUT, right, 0, right, H));
  for (const x of stops.slice(1, -1)) e.push(line(LAYERS.FOLD, x, 0, x, H));

  // Mirrored cosine arcs top and bottom form the pillow closure.
  for (const up of [true, false]) {
    const base = up ? H : 0;
    const dir = up ? 1 : -1;
    const pts = [];
    for (let i = 0; i <= seg * 2; i += 1) {
      const x = xb + (right - xb) * (i / (seg * 2));
      const phase = ((x - xb) / spanW) * Math.PI * 2;
      pts.push([x, base + dir * (curve / 2) * (1 - Math.cos(phase)) * 0.5]);
    }
    e.push(poly(LAYERS.CUT, pts));
  }
  e.push(text(LAYERS.DIM, xb + spanW, -curve - 8, `Pillow ${L} x ${W} x ${H} mm`, 4, 'middle'));
  return e;
}

/** Hanging header card with euro slot, common on retail cartons. */
export function euroSlot(x, y, w) {
  const r = 3;
  const slot = clamp(w * 0.22, 12, 30);
  return [
    circle(LAYERS.CUT, x - slot / 2 + r, y, r),
    circle(LAYERS.CUT, x + slot / 2 - r, y, r),
    roundRect(LAYERS.CUT, x - slot / 2, y - r, slot, r * 2, r)
  ];
}

export { rect };
