// AutoCAD R12 ASCII DXF writer.
// R12 is deliberate: every cutting table, Illustrator, CorelDRAW and ArtiosCAD
// build in the last 30 years reads it, and it is plain text so we need no library.

import { LAYERS, LAYER_STYLE, mm } from './geometry.js';

const pair = (code, value) => `${code}\n${value}\n`;

function header() {
  let s = '';
  s += pair(0, 'SECTION') + pair(2, 'HEADER');
  // $INSUNITS = 4 -> millimetres. Without this, receiving apps may assume inches.
  s += pair(9, '$INSUNITS') + pair(70, 4);
  s += pair(9, '$MEASUREMENT') + pair(70, 1);
  s += pair(9, '$LUNITS') + pair(70, 2);
  s += pair(0, 'ENDSEC');
  return s;
}

function tables(layers) {
  let s = '';
  s += pair(0, 'SECTION') + pair(2, 'TABLES');
  s += pair(0, 'TABLE') + pair(2, 'LTYPE') + pair(70, 2);
  s += pair(0, 'LTYPE') + pair(2, 'CONTINUOUS') + pair(70, 0)
    + pair(3, 'Solid line') + pair(72, 65) + pair(73, 0) + pair(40, 0);
  s += pair(0, 'LTYPE') + pair(2, 'DASHED') + pair(70, 0)
    + pair(3, '__ __ __') + pair(72, 65) + pair(73, 2) + pair(40, 5)
    + pair(49, 3) + pair(49, -2);
  s += pair(0, 'ENDTAB');

  s += pair(0, 'TABLE') + pair(2, 'LAYER') + pair(70, layers.length);
  for (const name of layers) {
    const style = LAYER_STYLE[name] || LAYER_STYLE[LAYERS.CUT];
    s += pair(0, 'LAYER') + pair(2, name) + pair(70, 0)
      + pair(62, style.aci) + pair(6, style.dash ? 'DASHED' : 'CONTINUOUS');
  }
  s += pair(0, 'ENDTAB') + pair(0, 'ENDSEC');
  return s;
}

function lineEntity(layer, x1, y1, x2, y2) {
  return pair(0, 'LINE') + pair(8, layer)
    + pair(10, mm(x1)) + pair(20, mm(y1)) + pair(30, 0)
    + pair(11, mm(x2)) + pair(21, mm(y2)) + pair(31, 0);
}

function polylineEntity(layer, pts, closed) {
  let s = pair(0, 'POLYLINE') + pair(8, layer) + pair(66, 1)
    + pair(10, 0) + pair(20, 0) + pair(30, 0) + pair(70, closed ? 1 : 0);
  for (const [x, y] of pts) {
    s += pair(0, 'VERTEX') + pair(8, layer)
      + pair(10, mm(x)) + pair(20, mm(y)) + pair(30, 0);
  }
  s += pair(0, 'SEQEND') + pair(8, layer);
  return s;
}

function circleEntity(layer, cx, cy, r) {
  return pair(0, 'CIRCLE') + pair(8, layer)
    + pair(10, mm(cx)) + pair(20, mm(cy)) + pair(30, 0) + pair(40, mm(r));
}

function arcEntity(layer, cx, cy, r, a1, a2) {
  return pair(0, 'ARC') + pair(8, layer)
    + pair(10, mm(cx)) + pair(20, mm(cy)) + pair(30, 0) + pair(40, mm(r))
    + pair(50, mm(a1)) + pair(51, mm(a2));
}

function textEntity(layer, x, y, value, h, anchor) {
  const align = anchor === 'middle' ? 1 : anchor === 'end' ? 2 : 0;
  let s = pair(0, 'TEXT') + pair(8, layer)
    + pair(10, mm(x)) + pair(20, mm(y)) + pair(30, 0)
    + pair(40, mm(h))
    + pair(1, String(value).replace(/\n/g, ' '));
  if (align) {
    s += pair(72, align) + pair(11, mm(x)) + pair(21, mm(y)) + pair(31, 0);
  }
  return s;
}

export function toDXF(entities) {
  const used = [...new Set(entities.map(e => e.layer))];
  let s = header() + tables(used);
  s += pair(0, 'SECTION') + pair(2, 'ENTITIES');
  for (const e of entities) {
    if (e.k === 'L') s += lineEntity(e.layer, e.x1, e.y1, e.x2, e.y2);
    else if (e.k === 'P') s += polylineEntity(e.layer, e.pts, e.closed);
    else if (e.k === 'C') s += circleEntity(e.layer, e.cx, e.cy, e.r);
    else if (e.k === 'A') s += arcEntity(e.layer, e.cx, e.cy, e.r, e.a1, e.a2);
    else if (e.k === 'T') s += textEntity(e.layer, e.x, e.y, e.text, e.h, e.anchor);
  }
  s += pair(0, 'ENDSEC') + pair(0, 'EOF');
  return s;
}
