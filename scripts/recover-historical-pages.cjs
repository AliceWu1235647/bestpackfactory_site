const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const projectRoot = process.cwd();
const oldSitemap = path.join(projectRoot, '..', 'recovered-site', 'sitemap.xml');
const currentSitemap = path.join(projectRoot, 'public', 'sitemap.xml');
const contentRoot = path.join(projectRoot, 'content-site');
const deployment = 'https://bestpackfactory-site-gmrk-el2n2ud32-alicewu1235647s-projects.vercel.app';
const canonicalOrigin = 'https://www.bestpackfactory.com';

function sitemapUrls(file) {
  const xml = fs.readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
}

const oldUrls = sitemapUrls(oldSitemap);
const currentUrls = new Set(sitemapUrls(currentSitemap));
const missing = oldUrls.filter(url =>
  url.startsWith(canonicalOrigin) &&
  url.endsWith('.html') &&
  !currentUrls.has(url)
);

function runVercelCurl(url) {
  return new Promise(resolve => {
    const route = new URL(url).pathname;
    const relative = route.replace(/^\/+/, '');
    const output = path.join(contentRoot, ...relative.split('/'));
    fs.mkdirSync(path.dirname(output), { recursive: true });

    const command = process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
    const child = spawn(command, [
      'curl',
      route,
      '--deployment',
      deployment,
      '--',
      '--silent',
      '--output',
      output
    ], {
      cwd: projectRoot,
      stdio: ['ignore', 'ignore', 'pipe'],
      shell: process.platform === 'win32'
    });

    let errorText = '';
    child.stderr.on('data', chunk => {
      errorText += chunk.toString();
    });
    child.on('close', code => {
      let valid = false;
      if (code === 0 && fs.existsSync(output)) {
        const html = fs.readFileSync(output, 'utf8');
        valid = /<!doctype html|<html[\s>]/i.test(html) && !/<title>404:/i.test(html);
      }
      if (!valid && fs.existsSync(output)) fs.rmSync(output, { force: true });
      resolve({ url, output, code, valid, errorText: errorText.trim() });
    });
  });
}

async function main() {
  const queue = [...missing];
  const results = [];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const url = queue.shift();
      const result = await runVercelCurl(url);
      results.push(result);
      console.log(`${result.valid ? 'OK' : 'FAIL'} ${url}`);
    }
  });

  await Promise.all(workers);
  const recovered = results.filter(result => result.valid).map(result => result.url);
  const failed = results.filter(result => !result.valid);
  fs.writeFileSync(
    path.join(projectRoot, 'recovered-pages-report.json'),
    JSON.stringify({ deployment, requested: missing.length, recovered, failed }, null, 2)
  );

  console.log(JSON.stringify({
    requested: missing.length,
    recovered: recovered.length,
    failed: failed.length
  }));
  if (failed.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
