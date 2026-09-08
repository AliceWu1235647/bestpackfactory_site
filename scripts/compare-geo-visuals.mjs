import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const beforeDir = path.resolve('artifacts', 'geo-visuals', process.argv[2] || 'baseline');
const afterDir = path.resolve('artifacts', 'geo-visuals', process.argv[3] || 'after');
const componentPattern = /__(?:header|productGrid|whatsappDock|contactForm|localeSwitcher)\.png$/;
const names = fs.readdirSync(beforeDir).filter(name => componentPattern.test(name)).sort();
const report = [];

for (const name of names) {
  const before = await sharp(path.join(beforeDir, name)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(path.join(afterDir, name)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const sameDimensions = before.info.width === after.info.width && before.info.height === after.info.height && before.info.channels === after.info.channels;
  let changedBytes = 0;
  let maxDelta = 0;
  if (sameDimensions) {
    for (let index = 0; index < before.data.length; index++) {
      const delta = Math.abs(before.data[index] - after.data[index]);
      if (delta) changedBytes++;
      if (delta > maxDelta) maxDelta = delta;
    }
  }
  report.push({
    name,
    sameDimensions,
    width: before.info.width,
    height: before.info.height,
    changedBytes,
    maxDelta,
    exactMatch: sameDimensions && changedBytes === 0
  });
}

const output = {
  beforeDir,
  afterDir,
  compared: report.length,
  exactMatches: report.filter(item => item.exactMatch).length,
  failures: report.filter(item => !item.exactMatch)
};
fs.writeFileSync(path.join(afterDir, 'protected-component-diff.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
if (output.failures.length) process.exitCode = 1;
