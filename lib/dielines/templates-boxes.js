// Corrugated and rigid box dielines.
// Corrugated needs real board-thickness compensation, otherwise the folded box
// will not close. foldAllowance() carries that correction.

import {
  LAYERS, line, poly, rect, text, circle, foldAllowance, roundRect
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

  const e = [
    rect(LAYERS.FOLD, xBase, yBase, L, W),
    text(LAYERS.DIM, xBase + L / 2, yBase + W / 2, `Tray ${L} x ${W} x ${H} mm`, 5, 'middle')
  ];
  const cut = (x1, y1, x2, y2) => e.push(line(LAYERS.CUT, x1, y1, x2, y2));

  // Four walls plus corner ears that lock behind the adjacent wall.
  for (const [ox, oy, w, h, ex, ey] of [
    [xBase, yBase - H - a, L, H + a, 1, 0],
    [xBase, yBaseT, L, H + a, 1, 0],
    [xBase - H - a, yBase, H + a, W, 0, 1],
    [xBaseR, yBase, H + a, W, 0, 1]
  ]) {
    cut(ox, oy, ox + (ex ? w : 0), oy + (ey ? h : 0));
    e.push(poly(LAYERS.CUT, ex
      ? [[ox, oy], [ox, oy + h], [ox + w, oy + h], [ox + w, oy]]
      : [[ox, oy], [ox + w, oy], [ox + w, oy + h], [ox, oy + h]]));
    // Ear tabs on the long walls only.
    if (ex) {
      const yTab = oy === yBaseT ? oy + h : oy;
      const dir = oy === yBaseT ? -1 : 1;
      e.push(poly(LAYERS.CUT, [
        [ox, yTab], [ox - ear, yTab + dir * 2.5],
        [ox - ear, yTab + dir * (H - 2.5)], [ox, yTab + dir * H]
      ]));
      e.push(poly(LAYERS.CUT, [
        [ox + w, yTab], [ox + w + ear, yTab + dir * 2.5],
        [ox + w + ear, yTab + dir * (H - 2.5)], [ox + w, yTab + dir * H]
      ]));
    }
  }
  return e;
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
  const seam = 20;
  const base = W + 10;

  const xb = seam;
  const front = xb + L;
  const side1 = front + W;
  const back = side1 + L;
  const right = back + W;

  const e = [
    line(LAYERS.CUT, xb, 0, right, 0),
    line(LAYERS.CUT, right, 0, right, H + hem),
    line(LAYERS.CUT, xb, H + hem, right, H + hem),
    line(LAYERS.CUT, xb, base, xb, H + hem),
    line(LAYERS.FOLD, xb, base, xb, H + hem),
    line(LAYERS.FOLD, xb, H, right, H),
    text(LAYERS.DIM, front + W / 2, base + 8, `Bag ${L} x ${W} x ${H} mm`, 4.5, 'middle'),
    text(LAYERS.DIM, front + W / 2, H + hem / 2, `top hem ${hem} mm`, 3.2, 'middle'),
    poly(LAYERS.CUT, [[0, base], [xb, base], [xb, 0], [0, 0]]),
    text(LAYERS.GLUE, seam / 2, H / 2, 'SIDE SEAM', 2.6, 'middle')
  ];

  for (const x of [front, side1, back]) e.push(line(LAYERS.FOLD, x, 0, x, H + hem));
  // Bottom gusset creases and the base fold-up.
  e.push(line(LAYERS.FOLD, xb, base, right, base));
  for (const x of [front, side1, back]) {
    e.push(line(LAYERS.PERF, x - W / 2, 0, x - W / 2, base));
  }
  e.push(text(LAYERS.PERF, front, base / 2, `bottom gusset ${base} mm`, 3, 'middle'));
  return e;
}
