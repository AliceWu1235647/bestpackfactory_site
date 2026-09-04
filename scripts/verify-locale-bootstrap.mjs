// Verifies the in-head bootstrap that sets <html lang>/<html dir> per locale prefix.
// Mirrors the script emitted by app/layout.js; run after changing that script.
const bootstrap = (pathname) => {
  const document = { documentElement: { lang: 'en', dir: 'ltr' } };
  const location = { pathname };
  try {
    var s = location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
    var l = { ar: 'ar', de: 'de', es: 'es', fr: 'fr', ja: 'ja' };
    var d = { ar: 'rtl' };
    var e = document.documentElement;
    if (l[s]) {
      e.lang = l[s];
      if (d[s]) e.dir = d[s];
    }
  } catch (_) {}
  return document.documentElement;
};

const cases = [
  ['/', 'en', 'ltr'],
  ['/ar', 'ar', 'rtl'],
  ['/ar/', 'ar', 'rtl'],
  ['/ar/products/pet-bottle', 'ar', 'rtl'],
  ['/ja', 'ja', 'ltr'],
  ['/de', 'de', 'ltr'],
  ['/fr', 'fr', 'ltr'],
  ['/es', 'es', 'ltr'],
  ['/products/pet-bottle', 'en', 'ltr'],
  ['/arabic-guide', 'en', 'ltr'],
];

let failed = 0;
for (const [path, wantLang, wantDir] of cases) {
  const el = bootstrap(path);
  const ok = el.lang === wantLang && el.dir === wantDir;
  if (!ok) failed++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${path.padEnd(28)} lang=${el.lang.padEnd(3)} dir=${el.dir}` +
      (ok ? '' : `   expected lang=${wantLang} dir=${wantDir}`)
  );
}
console.log(failed === 0 ? '\nAll locale bootstrap cases pass.' : `\n${failed} case(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
