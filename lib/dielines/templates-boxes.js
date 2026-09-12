// Corrugated and rigid box dielines.
// Corrugated needs real board-thickness compensation, otherwise the folded box
// will not close. foldAllowance() carries that correction.

import {
  LAYERS, line, poly, rect, text, circle, foldAllowance, roundRect, bounds, translate
} from './geometry.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Roll-end tuck-front mailer (FEFCO 0427 family) — the standard e-commerce
 * shipping mailer. Side walls rise from the base, wall wings wrap over them.
 */
export function mailerBox(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 3;
  const a = foldAllowance(t);
  const ft = clamp(H * 0.7, 12, 30);       // tuck flap
  const wing = clamp(H - a, 8, H);         // wall wings
  const nick = clamp(t, 1, 4);             // relief gap between adjacent flaps

  const x0 = 0;
  const xBase = H + a;
  const xBaseR = xBase + L;
  const right = xBaseR + H + a;

  let y = 0;
  const yFrontTuck = y; y += ft;
  const yFront = y; y += H + a;
  const yBase = y; y += W;
  const yBack = y + a; y += W === 0 ? 0 : 0;
  const yBackTop = yBase + W + a; const backH = H + a;
  const yLid = yBackTop + backH;
  const yLidFront = yLid + W + a;
  const yLidTuck = yLidFront + H + a;
  const top = yLidTuck + ft;

  const e = [];
  const cut = (x1, y1, x2, y2) => e.push(line(LAYERS.CUT, x1, y1, x2, y2));
  const fold = (x1, y1, x2, y2) => e.push(line(LAYERS.FOLD, x1, y1, x2, y2));

  // Base and the creases that define every wall.
  fold(xBase, yBase, xBaseR, yBase);
  fold(xBase, yBase + W, xBaseR, yBase + W);
  fold(xBase, yBase, xBase, yBase + W);
  fold(xBaseR, yBase, xBaseR, yBase + W);

  // Left / right side walls rising from the base.
  cut(x0, yBase, x0, yBase + W);
  cut(x0, yBase, xBase, yBase);
  cut(x0, yBase + W, xBase, yBase + W);
  cut(right, yBase, right, yBase + W);
  cut(xBaseR, yBase, right, yBase);
  cut(xBaseR, yBase + W, right, yBase + W);

  // Front wall with wings, then the tuck flap.
  fold(xBase, yFront + H + a, xBaseR, yFront + H + a);
  fold(xBase, yFront, xBase, yFront + H + a);
  fold(xBaseR, yFront, xBaseR, yFront + H + a);
  cut(xBase - wing, yFront + nick, xBase, yFront + nick);
  cut(xBase - wing, yFront + nick, xBase - wing, yFront + H + a);
  cut(xBase - wing, yFront + H + a, xBase, yFront + H + a);
  cut(xBaseR + wing, yFront + nick, xBaseR, yFront + nick);
  cut(xBaseR + wing, yFront + nick, xBaseR + wing, yFront + H + a);
  cut(xBaseR + wing, yFront + H + a, xBaseR, yFront + H + a);
  fold(xBase, yFront, xBaseR, yFront);
  e.push(poly(LAYERS.CUT, [
    [xBase + nick, yFront],
    [xBase + nick + 3, yFrontTuck],
    [xBaseR - nick - 3, yFrontTuck],
    [xBaseR - nick, yFront]
  ]));

  // Back wall with wings.
  fold(xBase, yBackTop, xBaseR, yBackTop);
  fold(xBase, yBackTop + backH, xBaseR, yBackTop + backH);
  fold(xBase, yBackTop, xBase, yBackTop + backH);
  fold(xBaseR, yBackTop, xBaseR, yBackTop + backH);
  cut(xBase - wing, yBackTop, xBase, yBackTop);
  cut(xBase - wing, yBackTop, xBase - wing, yBackTop + backH - nick);
  cut(xBase - wing, yBackTop + backH - nick, xBase, yBackTop + backH - nick);
  cut(xBaseR + wing, yBackTop, xBaseR, yBackTop);
  cut(xBaseR + wing, yBackTop, xBaseR + wing, yBackTop + backH - nick);
  cut(xBaseR + wing, yBackTop + backH - nick, xBaseR, yBackTop + backH - nick);

  // Lid, lid front wall and closing tuck.
  fold(xBase, yLid, xBaseR, yLid);
  fold(xBase, yLidFront, xBaseR, yLidFront);
  fold(xBase, yLidTuck, xBaseR, yLidTuck);
  cut(xBase, yLid, xBase, yLidTuck);
  cut(xBaseR, yLid, xBaseR, yLidTuck);
  e.push(poly(LAYERS.CUT, [
    [xBase + nick, yLidTuck],
    [xBase + nick + 3, top],
    [xBaseR - nick - 3, top],
    [xBaseR - nick, yLidTuck]
  ]));

  e.push(text(LAYERS.DIM, (xBase + xBaseR) / 2, yBase + W / 2, `${L} x ${W} x ${H} mm`, 5, 'middle'));
  e.push(text(LAYERS.DIM, (xBase + xBaseR) / 2, yBase + W / 2 - 8,
    `board ${t} mm / allowance ${a} mm`, 3.2, 'middle'));
  return e;
}

/** Open display / bakery tray with locking corners. */
export function trayBox(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 1.5;
  const a = foldAllowance(t);
  const ear = clamp(H - a, 6, H);

  const xBase = H + a;
  const xBaseR = xBase + L;
  const yBase = H + a;
  const yBaseT = yBase + W;

  const wall = H + a;
  const relief = clamp(t + 0.5, 0.8, 3);
  const e = [
    line(LAYERS.FOLD, xBase, yBase, xBaseR, yBase),
    line(LAYERS.FOLD, xBase, yBaseT, xBaseR, yBaseT),
    line(LAYERS.FOLD, xBase, yBase, xBase, yBaseT),
    line(LAYERS.FOLD, xBaseR, yBase, xBaseR, yBaseT),
    text(LAYERS.DIM, xBase + L / 2, yBase + W / 2,
      `Tray ${L} x ${W} x ${H} mm / board ${t} mm`, 5, 'middle')
  ];

  // Open cut paths omit the hinge edge; the four base edges above are scores.
  // This prevents the old CUT/FOLD overlap that would detach every tray wall.
  e.push(line(LAYERS.CUT, xBase + relief, yBase - wall, xBaseR - relief, yBase - wall));
  e.push(line(LAYERS.CUT, xBase + relief, yBaseT + wall, xBaseR - relief, yBaseT + wall));
  e.push(poly(LAYERS.CUT, [
    [xBase, yBase + relief], [xBase - wall, yBase + relief],
    [xBase - wall, yBaseT - relief], [xBase, yBaseT - relief]
  ]));
  e.push(poly(LAYERS.CUT, [
    [xBaseR, yBase + relief], [xBaseR + wall, yBase + relief],
    [xBaseR + wall, yBaseT - relief], [xBaseR, yBaseT - relief]
  ]));

  // Locking ears remain on the long walls and tuck behind the short walls.
  for (const [wallY, dir] of [[yBase, -1], [yBaseT, 1]]) {
    e.push(poly(LAYERS.CUT, [
      [xBase + relief, wallY], [xBase - ear, wallY + dir * 2.5],
      [xBase - ear, wallY + dir * (wall - 2.5)],
      [xBase + relief, wallY + dir * wall]
    ]));
    e.push(poly(LAYERS.CUT, [
      [xBaseR - relief, wallY], [xBaseR + ear, wallY + dir * 2.5],
      [xBaseR + ear, wallY + dir * (wall - 2.5)],
      [xBaseR - relief, wallY + dir * wall]
    ]));
  }
  return e;
}

function rigidWrapBlank(length, width, wallHeight, turnIn, label) {
  const L = Number(length);
  const W = Number(width);
  const H = Number(wallHeight);
  const T = Number(turnIn);
  const arm = H + T;
  const e = [
    poly(LAYERS.CUT, [
      [0, -arm], [L, -arm], [L, 0], [L + arm, 0],
      [L + arm, W], [L, W], [L, W + arm], [0, W + arm],
      [0, W], [-arm, W], [-arm, 0], [0, 0]
    ], true),
    line(LAYERS.FOLD, 0, 0, L, 0),
    line(LAYERS.FOLD, L, 0, L, W),
    line(LAYERS.FOLD, L, W, 0, W),
    line(LAYERS.FOLD, 0, W, 0, 0),
    line(LAYERS.FOLD, 0, -H, L, -H),
    line(LAYERS.FOLD, L + H, 0, L + H, W),
    line(LAYERS.FOLD, 0, W + H, L, W + H),
    line(LAYERS.FOLD, -H, 0, -H, W),
    roundRect(LAYERS.SAFE, 7, 7, Math.max(1, L - 14), Math.max(1, W - 14), 2),
    text(LAYERS.INFO, L / 2, W / 2, label, 4, 'middle'),
    text(LAYERS.GLUE, L / 2, -H - T / 2, `TURN-IN ${T} mm`, 2.5, 'middle')
  ];
  return e;
}

function rigidBoardPieces(length, width, wallHeight, thickness, label) {
  const L = Number(length);
  const W = Number(width);
  const H = Number(wallHeight);
  const t = Number(thickness);
  const gap = Math.max(8, t * 4);
  const e = [];
  const piece = (x, y, w, h, name) => {
    e.push(rect(LAYERS.CUT, x, y, w, h));
    e.push(text(LAYERS.INFO, x + w / 2, y + h / 2, name, 2.5, 'middle'));
  };
  piece(0, 0, L, W, `${label} FLOOR`);
  piece(0, W + gap, L, H, `${label} LONG WALL 1`);
  piece(0, W + H + 2 * gap, L, H, `${label} LONG WALL 2`);
  piece(L + gap, 0, W, H, `${label} SHORT WALL 1`);
  piece(L + W + 2 * gap, 0, W, H, `${label} SHORT WALL 2`);
  e.push(text(LAYERS.DIM, 0, -7, `GREYBOARD ${t} mm — verify mitres and wrap stock`, 3));
  return e;
}

function placeRight(left, right, gap = 35) {
  const a = bounds(left);
  const b = bounds(right);
  return translate(right, a.maxX - b.minX + gap, a.minY - b.minY);
}

function placeBelow(top, bottom, gap = 30) {
  const a = bounds(top);
  const b = bounds(bottom);
  return translate(bottom, a.minX - b.minX, a.minY - b.maxY - gap);
}

/** Separate greyboard pieces and wrap sheets for a rigid lid-and-base set-up box. */
export function twoPieceRigidBox(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 1.5;
  const clearance = Number(p.lidClearance) || 3;
  const lidH = Number(p.lidHeight) || Math.max(18, H * 0.5);
  const turnIn = Number(p.turnIn) || 18;
  if (![L, W, H, t, clearance, lidH, turnIn].every(Number.isFinite)
    || [L, W, H, t, clearance, lidH, turnIn].some(v => v <= 0)) {
    throw new Error('Rigid box dimensions and construction values must be positive numbers.');
  }

  const lidL = L + 2 * t + clearance;
  const lidW = W + 2 * t + clearance;
  const baseWrap = rigidWrapBlank(L, W, H, turnIn, 'BASE WRAP / ARTWORK');
  const baseBoard = placeBelow(baseWrap, rigidBoardPieces(L, W, H, t, 'BASE'));
  const baseAssembly = [...baseWrap, ...baseBoard];
  const lidWrap = rigidWrapBlank(lidL, lidW, lidH, turnIn, 'LID WRAP / ARTWORK');
  const lidBoard = placeBelow(lidWrap, rigidBoardPieces(lidL, lidW, lidH, t, 'LID'));
  const lidAssembly = placeRight(baseAssembly, [...lidWrap, ...lidBoard]);
  const wrapBounds = bounds([...baseAssembly, ...lidAssembly]);
  return [
    ...baseAssembly,
    ...lidAssembly,
    text(LAYERS.DIM, wrapBounds.minX, wrapBounds.maxY + 10,
      `FINISHED INSIDE BASE ${L} x ${W} x ${H} mm / LID CLEARANCE ${clearance} mm`, 4)
  ];
}

/** Tall rigid bottle box with a separate lift-off lid and optional divider blank. */
export function wineBottleRigidBox(p) {
  const e = twoPieceRigidBox(p);
  if (!p.divider) return e;
  const W = Number(p.width);
  const H = Number(p.height);
  const tab = clamp(Number(p.dividerTab) || 15, 10, 25);
  const dividerH = H * 0.7;
  const divider = [
    poly(LAYERS.CUT, [[0, 0], [tab + W + tab, 0], [tab + W + tab, dividerH], [0, dividerH]], true),
    line(LAYERS.FOLD, tab, 0, tab, dividerH),
    line(LAYERS.FOLD, tab + W, 0, tab + W, dividerH),
    text(LAYERS.GLUE, tab / 2, dividerH / 2, 'GLUE', 2.5, 'middle'),
    text(LAYERS.INFO, tab + W / 2, dividerH / 2, 'CENTRE DIVIDER', 3, 'middle'),
    text(LAYERS.GLUE, tab + W + tab / 2, dividerH / 2, 'GLUE', 2.5, 'middle')
  ];
  return [...e, ...placeRight(e, divider, 40)];
}

/** Two separately cut locking-corner trays: product tray plus clearance lid. */
export function trayLidBox(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 3;
  const clearance = Number(p.lidClearance) || Math.max(3, t * 1.5);
  const lidH = Number(p.lidHeight) || Math.max(18, H * 0.3);
  const base = trayBox({ length: L, width: W, height: H, thickness: t });
  base.push(text(LAYERS.INFO, H + foldAllowance(t) + L / 2,
    H + foldAllowance(t) + W / 2 - 8, 'BASE TRAY', 4, 'middle'));
  const lid = trayBox({
    length: L + 2 * t + clearance,
    width: W + 2 * t + clearance,
    height: lidH,
    thickness: t
  });
  lid.push(text(LAYERS.INFO, lidH + foldAllowance(t) + (L + 2 * t + clearance) / 2,
    lidH + foldAllowance(t) + (W + 2 * t + clearance) / 2 - 8,
    'LID — CONFIRM CLEARANCE', 4, 'middle'));
  return [...base, ...placeRight(base, lid, 35)];
}

/**
 * Magnetic collapsible rigid box — greyboard structure plus the wrap sheet
 * turn-in margin. Rigid boxes are two drawings, and the wrap is where most
 * artwork goes wrong, so both are emitted.
 */
export function magneticRigidBox(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const t = Number(p.thickness) || 2;
  const turnIn = Number(p.turnIn) || 15;
  const gap = t + 0.5;                     // hinge gap between greyboard panels
  const magnet = Number(p.magnetDia) || 10;

  const xb = turnIn;
  const yb = turnIn;
  const e = [];

  // Greyboard: lid, spine, base, front wall, plus side walls.
  const lidY = yb + H + gap + W + gap + H + gap;
  e.push(rect(LAYERS.CUT, xb, yb, L, H));                          // front wall
  e.push(rect(LAYERS.CUT, xb, yb + H + gap, L, W));                // base
  e.push(rect(LAYERS.CUT, xb, yb + H + gap + W + gap, L, H));      // back wall / spine
  e.push(rect(LAYERS.CUT, xb, lidY, L, W));                        // lid
  e.push(rect(LAYERS.CUT, xb, lidY + W + gap, L, H));              // lid front lip

  // Side walls flanking the base.
  e.push(rect(LAYERS.CUT, xb - H - gap, yb + H + gap, H, W));
  e.push(rect(LAYERS.CUT, xb + L + gap, yb + H + gap, H, W));

  // Magnet positions: lid lip and front wall must line up when closed.
  const mInset = clamp(L * 0.18, 15, 40);
  for (const mx of [xb + mInset, xb + L - mInset]) {
    e.push(circle(LAYERS.PERF, mx, yb + H / 2, magnet / 2));
    e.push(circle(LAYERS.PERF, mx, lidY + W + gap + H / 2, magnet / 2));
  }
  e.push(text(LAYERS.PERF, xb + L / 2, yb + H / 2 - magnet,
    `magnet ${magnet} mm x4`, 3, 'middle'));

  // Wrap sheet turn-in margin — artwork must bleed to this line.
  e.push(roundRect(LAYERS.BLEED, xb - H - gap - turnIn, yb - turnIn,
    L + 2 * H + 2 * gap + 2 * turnIn, lidY + W + gap + H + turnIn - yb + turnIn, 4));
  e.push(text(LAYERS.BLEED, xb + L / 2, yb - turnIn + 4,
    `wrap turn-in ${turnIn} mm — extend artwork to this line`, 3.4, 'middle'));
  e.push(text(LAYERS.DIM, xb + L / 2, yb + H + gap + W / 2,
    `${L} x ${W} x ${H} mm / greyboard ${t} mm`, 5, 'middle'));
  return e;
}

/** Flat-bottom paper bag with gusseted sides and turn-over top hem. */
export function paperBag(p) {
  const L = Number(p.length);
  const W = Number(p.width);
  const H = Number(p.height);
  const hem = Number(p.hem) || 30;
  const seam = Number(p.seam) || 20;
  const caliper = Number(p.paperThickness) || 0.2;
  const bottom = Number(p.bottomFold) || clamp(W * 0.55 + 12, 30, W);
  const handleHole = Number(p.handleHole) || 5;
  const handleSpacing = Number(p.handleSpacing) || 95;
  const handles = p.handles !== false;

  if (![L, W, H, hem, seam, caliper, bottom, handleHole, handleSpacing]
    .every(Number.isFinite) || [L, W, H, hem, seam, caliper, bottom, handleHole].some(v => v <= 0)) {
    throw new Error('Paper bag dimensions and construction values must be positive numbers.');
  }
  if (bottom >= H * 0.75) throw new Error('Bottom turn-in is too deep for the selected bag height.');
  if (handles && handleSpacing > L - 24) {
    throw new Error('Handle-hole centres need at least 12 mm clearance from both panel edges.');
  }

  // Flat tube sequence: side glue seam + front + side gusset + back + side
  // gusset. The bottom is a converter fold, not a row of cut-off carton flaps.
  const x0 = seam;
  const x1 = x0 + L;
  const x2 = x1 + W;
  const x3 = x2 + L;
  const x4 = x3 + W;
  const side1Centre = x1 + W / 2;
  const side2Centre = x3 + W / 2;
  const yBody = bottom;
  const yTop = yBody + H;
  const top = yTop + hem;

  const e = [
    rect(LAYERS.CUT, 0, 0, x4, top),
    rect(LAYERS.GLUE, 0, yBody, seam, H + hem),
    line(LAYERS.FOLD, x0, yBody, x0, top),
    line(LAYERS.FOLD, x1, 0, x1, top),
    line(LAYERS.FOLD, x2, 0, x2, top),
    line(LAYERS.FOLD, x3, 0, x3, top),
    line(LAYERS.FOLD, x0, yBody, x4, yBody),
    line(LAYERS.FOLD, x0, yTop, x4, yTop),
    line(LAYERS.PERF, side1Centre, yBody, side1Centre, top),
    line(LAYERS.PERF, side2Centre, yBody, side2Centre, top),
    text(LAYERS.GLUE, seam / 2, yBody + H / 2, `SIDE GLUE ${seam} mm`, 2.5, 'middle'),
    text(LAYERS.DIM, x0 + L / 2, yBody + 10,
      `Bag ${L} x ${W} x ${H} mm finished / paper ${caliper} mm`, 4.2, 'middle'),
    text(LAYERS.DIM, x0 + L / 2, yTop + hem / 2,
      `top turn-over ${hem} mm`, 3, 'middle'),
    text(LAYERS.DIM, x0 + L / 2, bottom / 2,
      `bottom turn-in ${bottom} mm`, 3, 'middle')
  ];

  // The four diagonal scores create the two square-bottom side diamonds. This
  // is the construction detail missing from the previous rectangular sketch.
  for (const [left, centre, right] of [[x1, side1Centre, x2], [x3, side2Centre, x4]]) {
    e.push(line(LAYERS.FOLD, left, 0, centre, yBody));
    e.push(line(LAYERS.FOLD, right, 0, centre, yBody));
  }

  // Front/back artwork safe areas. Bleed remains a printer-specific preflight
  // decision because it must follow the exact machine trim and top treatment.
  const safe = 8;
  e.push(roundRect(LAYERS.SAFE, x0 + safe, yBody + safe,
    L - 2 * safe, H - 2 * safe, 2));
  e.push(roundRect(LAYERS.SAFE, x2 + safe, yBody + safe,
    L - 2 * safe, H - 2 * safe, 2));

  if (handles) {
    const handleY = yTop + hem * 0.52;
    for (const centre of [x0 + L / 2, x2 + L / 2]) {
      // Reinforcement patch guide is non-printing; the actual patch material
      // and size are confirmed by load testing.
      e.push(roundRect(LAYERS.GLUE, centre - handleSpacing / 2 - 12,
        yTop + 3, handleSpacing + 24, hem - 6, 3));
      e.push(circle(LAYERS.CUT, centre - handleSpacing / 2, handleY, handleHole / 2));
      e.push(circle(LAYERS.CUT, centre + handleSpacing / 2, handleY, handleHole / 2));
    }
    e.push(text(LAYERS.INFO, x0 + L / 2, yTop + 4,
      `handle holes ${handleHole} mm / centres ${handleSpacing} mm`, 2.4, 'middle'));
  }

  e.push(line(LAYERS.DIM, x0 + 12, yBody + H * 0.25, x0 + 12, yBody + H * 0.75));
  e.push(text(LAYERS.DIM, x0 + 16, yBody + H * 0.5,
    'recommended machine / grain direction', 2.5));
  return e;
}
