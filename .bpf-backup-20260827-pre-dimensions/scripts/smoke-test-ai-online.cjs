const base = String(process.argv[2] || 'https://www.bestpackfactory.com').replace(/\/$/, '');

const agents = [
  'Googlebot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User'
];

async function request(path, userAgent = 'BestPackFactory-AI-Discoverability-Audit/1.0') {
  const started = Date.now();
  const response = await fetch(`${base}${path}`, {
    headers: { 'user-agent': userAgent, accept: 'text/html,application/json,application/xml,text/plain;q=0.9,*/*;q=0.8' },
    redirect: 'follow'
  });
  const body = await response.text();
  return {
    path,
    userAgent,
    status: response.status,
    elapsedMs: Date.now() - started,
    contentType: response.headers.get('content-type') || '',
    xRobotsTag: response.headers.get('x-robots-tag') || '',
    body
  };
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

(async () => {
  const failures = [];
  const botResults = [];
  for (const agent of agents) {
    const result = await request('/', agent);
    botResults.push({ userAgent: agent, status: result.status, elapsedMs: result.elapsedMs });
    assert(result.status === 200, `${agent} received HTTP ${result.status} on /`, failures);
    assert(!/access denied|captcha|verify you are human|cf-chl/i.test(result.body), `${agent} received a bot challenge`, failures);
  }

  const paths = [
    '/robots.txt',
    '/llms.txt',
    '/ai-index.json',
    '/feed.xml',
    '/sitemap-index.xml',
    '/products/custom-coffee-bags.html',
    '/blog/custom-packaging-supplier-comparison-guide.html',
    '/api/products-search?q=coffee'
  ];
  const checks = {};
  for (const path of paths) checks[path] = await request(path, 'OAI-SearchBot');

  assert(/User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i.test(checks['/robots.txt'].body), 'robots.txt does not explicitly allow OAI-SearchBot', failures);
  assert(/User-agent:\s*Claude-SearchBot[\s\S]*?Allow:\s*\//i.test(checks['/robots.txt'].body), 'robots.txt does not explicitly allow Claude-SearchBot', failures);
  assert(/https:\/\/www\.bestpackfactory\.com\/feed\.xml/i.test(checks['/llms.txt'].body), 'llms.txt does not link the RSS feed', failures);
  try {
    const index = JSON.parse(checks['/ai-index.json'].body);
    assert(Array.isArray(index.products) && index.products.length === 99, `AI index product count is ${index.products?.length ?? 'invalid'}`, failures);
  } catch {
    failures.push('AI index is not valid JSON');
  }
  assert(/<rss\b/i.test(checks['/feed.xml'].body) && /<item>/i.test(checks['/feed.xml'].body), 'RSS feed is missing or empty', failures);
  assert(/<loc>https:\/\/www\.bestpackfactory\.com\/ai-sitemap\.xml<\/loc>/i.test(checks['/sitemap-index.xml'].body), 'Sitemap index does not link AI sitemap', failures);
  assert(/<loc>https:\/\/www\.bestpackfactory\.com\/feed\.xml<\/loc>/i.test(checks['/sitemap-index.xml'].body), 'Sitemap index does not link RSS feed', failures);

  for (const path of ['/products/custom-coffee-bags.html', '/blog/custom-packaging-supplier-comparison-guide.html']) {
    const page = checks[path];
    assert(page.status === 200, `${path} returned HTTP ${page.status}`, failures);
    assert(/name="googlebot" content="index, follow,[^"]*max-image-preview:large[^"]*max-snippet:-1/i.test(page.body), `${path} is missing expanded Google preview directives`, failures);
    assert(/rel="alternate" type="text\/plain" href="\/llms\.txt"/i.test(page.body), `${path} is missing llms.txt discovery link`, failures);
    assert(/rel="canonical" href="https:\/\/www\.bestpackfactory\.com\//i.test(page.body), `${path} is missing canonical`, failures);
  }

  const api = checks['/api/products-search?q=coffee'];
  assert(/noindex/i.test(api.xRobotsTag), 'API response is missing X-Robots-Tag noindex', failures);

  const endpointResults = Object.values(checks).map(result => ({
    path: result.path,
    status: result.status,
    elapsedMs: result.elapsedMs,
    contentType: result.contentType,
    xRobotsTag: result.xRobotsTag || undefined
  }));
  console.log(JSON.stringify({ base, botResults, endpointResults, failures }, null, 2));
  if (failures.length) process.exit(1);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
