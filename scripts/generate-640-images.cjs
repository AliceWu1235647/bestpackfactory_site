const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(process.cwd(), 'public', 'assets', 'products');
const csDir = path.join(process.cwd(), 'content-site', 'assets', 'products');

async function run() {
  const files = fs.readdirSync(dir);
  const originals = files.filter(f => /\.(jpg|jpeg|webp|png)$/i.test(f) && !f.includes('-640'));

  let generated = 0;
  let errors = 0;

  for (const file of originals) {
    const ext = path.extname(file);
    const base = file.replace(ext, '');
    const thumbName = `${base}-640.webp`;

    if (files.includes(thumbName)) continue;

    const srcPath = path.join(dir, file);
    const dstPath = path.join(dir, thumbName);

    try {
      await sharp(srcPath)
        .resize(640, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(dstPath);
      generated++;

      // Also copy to content-site/assets/products/ if that dir exists
      if (fs.existsSync(csDir)) {
        fs.copyFileSync(dstPath, path.join(csDir, thumbName));
      }

      process.stdout.write(`\r${generated} generated...`);
    } catch (e) {
      errors++;
      console.error(`\nERROR ${file}: ${e.message}`);
    }
  }

  console.log(`\n\nDONE. ${generated} 640px WebP variants generated, ${errors} errors.`);
}

run();
