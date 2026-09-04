import { DIELINES, defaultParams } from '../lib/dielines/catalog.js';
import { renderFormat, buildDieline } from '../lib/dielines/build.js';
let fail = 0;
for (const d of DIELINES) {
  try {
    const p = defaultParams(d);
    const { entities, size } = buildDieline(d, p);
    const bad = entities.filter(e => {
      if (e.k === 'L') return ![e.x1,e.y1,e.x2,e.y2].every(Number.isFinite);
      if (e.k === 'P') return e.pts.some(([x,y]) => !Number.isFinite(x)||!Number.isFinite(y));
      if (e.k === 'C'||e.k==='A') return ![e.cx,e.cy,e.r].every(Number.isFinite);
      if (e.k === 'T') return !Number.isFinite(e.x)||!Number.isFinite(e.y);
      return false;
    });
    const out = {};
    for (const f of ['svg','dxf','pdf','ai']) out[f] = renderFormat(d, p, f).data.length;
    console.log(`OK  ${d.slug.padEnd(36)} ent=${String(entities.length).padStart(4)} NaN=${bad.length} sheet=${size.sheetW}x${size.sheetH} svg=${out.svg} dxf=${out.dxf} pdf=${out.pdf}`);
    if (bad.length) { fail++; console.log('   !! NaN', JSON.stringify(bad.slice(0,2))); }
    if (size.sheetW <= 0 || size.sheetH <= 0) { fail++; console.log('   !! bad sheet'); }
  } catch (err) { fail++; console.log(`ERR ${d.slug}: ${err.message}`); }
}
console.log(fail ? `\n${fail} FAILURES` : '\nall generators clean');
