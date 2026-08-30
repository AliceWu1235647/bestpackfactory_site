// Asserts the locale switcher is emitted for every page in the translated cluster
// (and only for those), and that each switcher links the full 6-language set.
import { LOCALES, localeSwitcherHtml, translatedPaths } from '../lib/locales.js';

const paths = translatedPaths();
const routes = [];
for (const rel of paths) {
  routes.push(rel);
  for (const code of LOCALES) routes.push(`${code}/${rel}`);
}

let failed = 0;
let withSwitcher = 0;
for (const route of routes) {
  const html = localeSwitcherHtml(route);
  const links = (html.match(/<a /g) || []).length;
  const current = (html.match(/aria-current="page"/g) || []).length;
  if (links !== 6 || current !== 1) {
    failed += 1;
    console.log(`FAIL ${route}  links=${links} current=${current}`);
  } else withSwitcher += 1;
}

// Routes outside the cluster must get nothing at all.
const negatives = ['dielines', 'samples.html', 'blog.html', 'industries/ecommerce-packaging.html', 'arabic-guide.html'];
for (const route of negatives) {
  if (localeSwitcherHtml(route) !== '') {
    failed += 1;
    console.log(`FAIL ${route} unexpectedly got a switcher`);
  }
}

// Every link target must be a route the cluster actually advertises.
const sample = localeSwitcherHtml('ar/products.html');
const expected = ['/products.html', '/ar/products.html', '/de/products.html', '/es/products.html', '/fr/products.html', '/ja/products.html'];
for (const href of expected) {
  if (!sample.includes(`href="${href}"`)) { failed += 1; console.log(`FAIL missing href ${href}`); }
}
if (!/href="\/ar\/products\.html" hreflang="ar" lang="ar" aria-current="page"/.test(sample)) {
  failed += 1;
  console.log('FAIL ar/products.html did not mark itself current');
}

console.log(`\ncluster pages: ${paths.length} paths x 6 locales = ${routes.length}`);
console.log(`switchers emitted: ${withSwitcher}`);
console.log(`negatives correctly empty: ${negatives.length}`);
console.log(failed === 0 ? 'All locale switcher cases pass.' : `${failed} case(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
