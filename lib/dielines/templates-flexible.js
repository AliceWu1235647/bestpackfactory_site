// Flexible packaging print layouts: coffee bags, stand-up pouches, mylar bags.
// These are not knife dielines but printed film layouts — the working drawing
// still has to show seal zones, gusset folds, valve mounts and notch positions,
// which is exactly what generic dieline libraries leave out.

import { LAYERS, line, poly, rect, text, circle, roundRect } from './geometry.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Seal band drawn as a hatched zone so artwork is kept clear of it. */
function sealBand(x, y, w, h, label) {
  const e = [rect(LAYERS.GLUE, x, y, w, h)];
  const step = 4;
  if (w > h) {
    for (let i = x; i < x + w; i += step) e.push(line(LAYERS.GLUE, i, y, i + h, y + h));
  } else {
    for (let i = y; i < y + h; i += step) e.push(line(LAYERS.GLUE, x, i, x + w, i + w));
  }
  if (label) {
    e.push(text(LAYERS.GLUE, x + w / 2, y + h / 2 - 1.2, label, 2.4, 'middle'));
  }
  return e;
}

/** Degassing valve mount — mandatory on roasted coffee, needs seal clearance. */
function valveMount(cx, cy, dia) {
  return [
    circle(LAYERS.PERF, cx, cy, dia / 2),
    circle(LAYERS.PERF, cx, cy, dia / 2 + 4),
    text(LAYERS.PERF, cx, cy - dia / 2 - 8, `valve ${dia} mm — keep artwork clear`, 2.6, 'middle')
  ];
}

/** Laser tear notch pair on a side seal. */
function tearNotch(x, y, side = 'left') {
  const d = side === 'left' ? 1 : -1;
  return [
    poly(LAYERS.CUT, [[x, y + 2], [x + d * 3.5, y], [x, y - 2]]),
    text(LAYERS.CUT, x + d * 8, y - 1, 'notch', 2.2, side === 'left' ? 'start' : 'end')
  ];
}

/**
 * Stand-up (doypack) pouch — the standard 250 g / 500 g coffee bag.
 * The film prints as one strip folded at the bottom gusset centre, so the flat
 * layout runs: front panel, front gusset half, back gusset half, back panel.
 */
export function standUpPouch(p) {
  const W = Number(p.width);        // face width
  const H = Number(p.height);       // face height
  const D = Number(p.gusset);       // bottom gusset depth
  const seal = Number(p.seal) || 8;
  const topSeal = Number(p.topSeal) || 10;
  const valve = p.valve ? (Number(p.valveDia) || 20) : 0;
  const zipper = p.zipper !== false;

  const xL = 0;
  const xP = seal;
  const xR = seal + W;
  const right = xR + seal;

  const yFront = 0;
  const yGussetF = H;
  const yGussetB = H + D / 2;
  const yBack = H + D;
  const top = 2 * H + D;

  const e = [];

  // Outer trim.
  e.push(rect(LAYERS.CUT, xL, yFront, right, top));
  // Panel boundaries.
  e.push(line(LAYERS.FOLD, xP, yFront, xP, top));
  e.push(line(LAYERS.FOLD, xR, yFront, xR, top));
  // Gusset folds — the centre line is the bottom-most crease of the pouch.
  e.push(line(LAYERS.FOLD, xL, yGussetF, right, yGussetF));
  e.push(line(LAYERS.CUT, xL, yGussetB, right, yGussetB));
  e.push(line(LAYERS.FOLD, xL, yBack, right, yBack));

  // Side seals run the whole film length; top seals close the pouch.
  e.push(...sealBand(xL, yFront, seal, top, null));
  e.push(...sealBand(xR, yFront, seal, top, null));
  e.push(...sealBand(xP, yFront, W, topSeal, `bottom/top seal ${topSeal} mm`));
  e.push(...sealBand(xP, top - topSeal, W, topSeal, `top seal ${topSeal} mm`));

  // Characteristic angled bottom-gusset corner seals.
  const corner = clamp(D * 0.75, 10, W / 2);
  for (const [gx, dir] of [[xP, 1], [xR, -1]]) {
    e.push(line(LAYERS.PERF, gx, yGussetF - corner, gx + dir * corner, yGussetF));
    e.push(line(LAYERS.PERF, gx, yGussetB + corner, gx + dir * corner, yGussetB));
  }
  e.push(text(LAYERS.PERF, xP + W / 2, yGussetF + D / 4,
    `bottom gusset ${D} mm (folds inward)`, 3, 'middle'));

  // Front panel print area.
  const faceTop = top - topSeal;
  e.push(roundRect(LAYERS.BLEED, xP + 3, yBack + 3, W - 6, H - topSeal - 6, 2));
  e.push(text(LAYERS.BLEED, xP + W / 2, yBack + H - topSeal - 10,
    'FRONT panel — safe artwork area', 3.2, 'middle'));
  e.push(text(LAYERS.DIM, xP + W / 2, yFront + topSeal + 12,
    'BACK panel', 3.2, 'middle'));

  if (zipper) {
    const zy = faceTop - topSeal - 6;
    e.push(line(LAYERS.PERF, xP, zy, xR, zy));
    e.push(text(LAYERS.PERF, xP + 4, zy + 2.5, 'resealable zipper', 2.6));
    e.push(...tearNotch(xL + seal, zy - 8, 'left'));
  }
  if (valve) {
    valveMount(xP + W / 2, yBack + H - topSeal - clamp(H * 0.28, 35, 70), valve)
      .forEach(item => e.push(item));
  }

  e.push(text(LAYERS.DIM, xP + W / 2, -10,
    `Stand-up pouch ${W} x ${H} x ${D} mm${valve ? ' + valve' : ''}`, 4.5, 'middle'));
  return e;
}

/**
 * Flat-bottom (box / quad-seal) pouch — the premium 500 g and 1 kg coffee bag.
 * Eight printed panels: two faces, two side gussets, one bottom.
 */
export function flatBottomPouch(p) {
  const W = Number(p.width);
  const H = Number(p.height);
  const D = Number(p.gusset);
  const seal = Number(p.seal) || 8;
  const topSeal = Number(p.topSeal) || 10;
  const valve = p.valve ? (Number(p.valveDia) || 20) : 0;

  const bottom = D / 2;
  const xs = [];
  let x = seal;
  const cols = [
    ['FRONT', W], ['SIDE GUSSET', D], ['BACK', W], ['SIDE GUSSET', D]
  ];
  for (const [, w] of cols) { xs.push(x); x += w; }
  const right = x + seal;
  const top = bottom + H;

  const e = [rect(LAYERS.CUT, 0, 0, right, top)];
  e.push(...sealBand(0, 0, seal, top, null));
  e.push(...sealBand(right - seal, 0, seal, top, null));
  e.push(...sealBand(seal, top - topSeal, right - 2 * seal, topSeal, `top seal ${topSeal} mm`));

  // Bottom panel plus the fold that forms the flat base.
  e.push(line(LAYERS.FOLD, 0, bottom, right, bottom));
  e.push(text(LAYERS.PERF, seal + W / 2, bottom / 2 - 1.5,
    `bottom panel ${D} mm deep`, 3, 'middle'));

  cols.forEach(([label, w], i) => {
    const cx = xs[i];
    if (i > 0) e.push(line(LAYERS.FOLD, cx, 0, cx, top));
    // Gusset centre creases fold inward.
    if (label === 'SIDE GUSSET') {
      e.push(line(LAYERS.PERF, cx + w / 2, 0, cx + w / 2, top));
    }
    e.push(text(LAYERS.DIM, cx + w / 2, top - topSeal - 8, label, 3, 'middle'));
  });
  e.push(line(LAYERS.FOLD, xs[1] + cols[1][1], 0, xs[1] + cols[1][1], top));

  e.push(roundRect(LAYERS.BLEED, seal + 3, bottom + 3, W - 6, H - topSeal - 6, 2));
  if (valve) {
    valveMount(seal + W / 2, top - topSeal - clamp(H * 0.25, 35, 70), valve)
      .forEach(item => e.push(item));
  }
  e.push(...tearNotch(seal, top - topSeal - 14, 'left'));
  e.push(text(LAYERS.DIM, right / 2, -10,
    `Flat-bottom pouch ${W} x ${H} x ${D} mm${valve ? ' + valve' : ''}`, 4.5, 'middle'));
  return e;
}

/**
 * Three-side-seal flat pouch — mylar bags, CBD gummy pouches, sample sachets.
 * Optional child-resistant slider and hang hole.
 */
export function flatPouch(p) {
  const W = Number(p.width);
  const H = Number(p.height);
  const seal = Number(p.seal) || 8;
  const topSeal = Number(p.topSeal) || 10;
  const cr = Boolean(p.childResistant);
  const hangHole = Boolean(p.hangHole);

  const right = W + 2 * seal;
  const top = 2 * H;

  const e = [rect(LAYERS.CUT, 0, 0, right, top)];
  e.push(...sealBand(0, 0, seal, top, null));
  e.push(...sealBand(right - seal, 0, seal, top, null));
  e.push(...sealBand(seal, top - topSeal, W, topSeal, `top seal ${topSeal} mm`));
  e.push(...sealBand(seal, 0, W, topSeal, `top seal ${topSeal} mm`));

  // Bottom fold: film is folded here, so it is a crease and not a cut.
  e.push(line(LAYERS.FOLD, 0, H, right, H));
  e.push(text(LAYERS.FOLD, seal + 4, H + 2.5, 'bottom fold', 2.6));

  e.push(roundRect(LAYERS.BLEED, seal + 3, H + 3, W - 6, H - topSeal - 6, 2));
  e.push(text(LAYERS.BLEED, seal + W / 2, top - topSeal - 10,
    'FRONT panel — safe artwork area', 3.2, 'middle'));
  e.push(text(LAYERS.DIM, seal + W / 2, topSeal + 10, 'BACK panel', 3.2, 'middle'));

  const zy = top - topSeal - 8;
  if (cr) {
    e.push(line(LAYERS.PERF, seal, zy, seal + W, zy));
    e.push(line(LAYERS.PERF, seal, zy - 4, seal + W, zy - 4));
    e.push(text(LAYERS.PERF, seal + 4, zy + 2.5,
      'child-resistant press-to-close slider', 2.6));
  } else {
    e.push(line(LAYERS.PERF, seal, zy, seal + W, zy));
    e.push(text(LAYERS.PERF, seal + 4, zy + 2.5, 'zipper', 2.6));
  }
  e.push(...tearNotch(seal, zy - 10, 'left'));

  if (hangHole) {
    e.push(circle(LAYERS.CUT, seal + W / 2, top - topSeal / 2, 3));
    e.push(text(LAYERS.CUT, seal + W / 2 + 8, top - topSeal / 2 - 1, 'hang hole 6 mm', 2.4));
  }
  e.push(text(LAYERS.DIM, right / 2, -10, `Flat pouch ${W} x ${H} mm`, 4.5, 'middle'));
  return e;
}
