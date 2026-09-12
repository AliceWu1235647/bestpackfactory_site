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
      [x, 0],
      [x - tabW, inset + 2.5],
      [x - tabW, h - inset - 2.5],
      [x, h]
    ]),
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
  const straight = Boolean(p.straight);

  if (![L, W, H, t].every(Number.isFinite) || L <= 0 || W <= 0 || H <= 0 || t <= 0) {
    throw new Error('Length, width, height and board thickness must be positive numbers.');
  }

  // The requested dimensions are finished inside dimensions. For folding
  // board, each score-to-score panel receives one caliper of working room.
  // The final crease matrix still has to be approved for the actual stock.
  const panelL = L + t;
  const panelW = W + t;
  const tabW = clamp(L * 0.18, 12, 20);
  const tuck = clamp(W - t - 1.2, 8, W - 0.5);
  const roll = clamp(tuck * 0.18, 4, 8);
  const dust = clamp(Math.min(L * 0.48, W * 0.82), 8, Math.max(8, W - 1));
  const inner = clamp(W * 0.48, 7, Math.max(7, W - 2));
  const shoulder = clamp(panelL * 0.045, 2, 6);
  const relief = clamp(t + 0.6, 0.8, 2.5);

  const xb = tabW;
  const p1 = xb;                       // back  (L)
  const p2 = p1 + panelL;              // side  (W)
  const p3 = p2 + panelW;              // front (L)
  const p4 = p3 + panelL;              // side  (W)
  const right = p4 + panelW;

  const e = [];

  // Body outline and vertical creases. There are deliberately no CUT lines
  // across y=0 or y=H: those are flap hinge scores. A cut there would detach
  // the closure flaps, which was the main production defect in the old file.
  e.push(line(LAYERS.CUT, right, 0, right, H));
  for (const x of [p2, p3, p4]) e.push(line(LAYERS.FOLD, x, 0, x, H));
  e.push(...glueTab(xb, H, tabW));

  // Tuck assembly. Open polylines draw only knife edges; the hinge is emitted
  // separately as a FOLD line so CUT and FOLD can never overlap.
  const tuckAt = (x, w, up) => {
    const dir = up ? 1 : -1;
    const base = up ? H : 0;
    const free = base + dir * tuck;
    e.push(poly(LAYERS.CUT, [
      [x + relief, base],
      [x + shoulder, base + dir * (tuck - roll)],
      [x + shoulder + 2, free],
      [x + w - shoulder - 2, free],
      [x + w - shoulder, base + dir * (tuck - roll)],
      [x + w - relief, base]
    ]));
    e.push(line(LAYERS.FOLD, x + relief, base, x + w - relief, base));
    e.push(line(LAYERS.FOLD, x + shoulder, base + dir * (tuck - roll),
      x + w - shoulder, base + dir * (tuck - roll)));
  };

  const dustAt = (x, w, up) => {
    const base = up ? H : 0;
    const taper = clamp(w * 0.12, 1.5, 4);
    e.push(taperedFlap(LAYERS.CUT, x + relief, base, w - 2 * relief, dust, taper, up));
    e.push(line(LAYERS.FOLD, x + relief, base, x + w - relief, base));
  };

  const innerAt = (x, w, up) => {
    const base = up ? H : 0;
    const taper = clamp(w * 0.06, 2, 5);
    e.push(taperedFlap(LAYERS.CUT, x + relief, base, w - 2 * relief, inner, taper, up));
    e.push(line(LAYERS.FOLD, x + relief, base, x + w - relief, base));
    e.push(text(LAYERS.INFO, x + w / 2, base + (up ? 1 : -1) * inner * 0.55,
      'INNER FLAP', 2.4, 'middle'));
  };

  // Reverse tuck alternates ends so the blank nests tighter on the sheet.
  const topTuckX = straight ? p3 : p1;
  const botTuckX = p3;
  tuckAt(topTuckX, panelL, true);
  tuckAt(botTuckX, panelL, false);
  innerAt(topTuckX === p1 ? p3 : p1, panelL, true);
  innerAt(p1, panelL, false);
  dustAt(p2, panelW, true);
  dustAt(p4, panelW, true);
  dustAt(p2, panelW, false);
  dustAt(p4, panelW, false);

  e.push(text(LAYERS.DIM, p3 + panelL / 2, -Math.max(tuck, dust) - 8,
    `${L} x ${W} x ${H} mm inside / board ${t} mm`, 4, 'middle'));
  return e;
}

/** Carry-handle gable carton with opposed roof/handle panels and side gables. */
export function gableTopCarton(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 0.4;
  if (![L, W, H, t].every(Number.isFinite) || [L, W, H, t].some(v => v <= 0)) {
    throw new Error('Gable carton dimensions and board thickness must be positive numbers.');
  }

  const panelL = L + t;
  const panelW = W + t;
  const tabW = clamp(L * 0.16, 12, 20);
  const relief = clamp(t + 0.7, 1, 2.8);
  const roof = clamp(W * 0.55, 24, 85);
  const handleH = clamp(W * 0.2, 16, 28);
  const majorBottom = clamp(W * 0.58, 18, Math.max(18, W - 2));
  const dustBottom = clamp(Math.min(W * 0.48, L * 0.32), 14, Math.max(14, W - 3));
  const shoulder = clamp(L * 0.08, 5, 14);

  const xb = tabW;
  const stops = [xb, xb + panelL, xb + panelL + panelW,
    xb + 2 * panelL + panelW, xb + 2 * panelL + 2 * panelW];
  const e = [...glueTab(xb, H, tabW), line(LAYERS.CUT, stops[4], 0, stops[4], H)];
  for (const x of stops.slice(1, -1)) e.push(line(LAYERS.FOLD, x, 0, x, H));

  const bottomFlap = (x, w, depth, taper) => {
    e.push(poly(LAYERS.CUT, [
      [x + relief, 0], [x + relief + taper, -depth],
      [x + w - relief - taper, -depth], [x + w - relief, 0]
    ]));
    e.push(line(LAYERS.FOLD, x + relief, 0, x + w - relief, 0));
  };

  const roofHandle = (x, w, label) => {
    e.push(poly(LAYERS.CUT, [
      [x + relief, H], [x + relief, H + roof],
      [x + shoulder, H + roof + handleH],
      [x + w - shoulder, H + roof + handleH],
      [x + w - relief, H + roof], [x + w - relief, H]
    ]));
    e.push(line(LAYERS.FOLD, x + relief, H, x + w - relief, H));
    e.push(line(LAYERS.FOLD, x + relief, H + roof, x + w - relief, H + roof));
    const slotW = clamp(w * 0.42, 28, 65);
    const slotH = clamp(handleH * 0.34, 5, 9);
    e.push(roundRect(LAYERS.CUT, x + (w - slotW) / 2,
      H + roof + (handleH - slotH) / 2, slotW, slotH, slotH / 2));
    e.push(text(LAYERS.INFO, x + w / 2, H + roof + 3, label, 2.3, 'middle'));
  };

  const sideGable = (x, w) => {
    const apexX = x + w / 2;
    const apexY = H + roof;
    e.push(poly(LAYERS.CUT, [
      [x + relief, H], [x + relief, apexY],
      [x + w - relief, apexY], [x + w - relief, H]
    ]));
    e.push(line(LAYERS.FOLD, x + relief, H, x + w - relief, H));
    e.push(line(LAYERS.FOLD, x + relief, H, apexX, apexY));
    e.push(line(LAYERS.FOLD, x + w - relief, H, apexX, apexY));
  };

  bottomFlap(stops[0], panelL, majorBottom, clamp(L * 0.07, 3, 8));
  bottomFlap(stops[1], panelW, dustBottom, clamp(W * 0.1, 2, 5));
  bottomFlap(stops[2], panelL, majorBottom, clamp(L * 0.07, 3, 8));
  bottomFlap(stops[3], panelW, dustBottom, clamp(W * 0.1, 2, 5));
  roofHandle(stops[0], panelL, 'HANDLE PANEL A');
  sideGable(stops[1], panelW);
  roofHandle(stops[2], panelL, 'HANDLE PANEL B');
  sideGable(stops[3], panelW);
  e.push(text(LAYERS.DIM, stops[2] + panelL / 2, -majorBottom - 8,
    `${L} x ${W} x ${H} mm inside / board ${t} mm`, 4, 'middle'));
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
