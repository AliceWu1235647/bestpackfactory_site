const urls = [
  'https://www.bestpackfactory.com/',
  'https://www.bestpackfactory.com/products/custom-boxes.html',
  'https://www.bestpackfactory.com/blog/custom-packaging-material-selection-guide.html',
  'https://www.bestpackfactory.com/blog/custom-packaging-supplier-comparison-guide.html'
];

function decodeHtmlEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function showContext(value, position) {
  const start = Math.max(0, position - 160);
  const end = Math.min(value.length, position + 160);
  return value.slice(start, end);
}

(async () => {
  for (const url of urls) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    const html = await response.text();
    const blocks = [];
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = re.exec(html))) blocks.push(match[1].trim());
    if (!blocks.length) throw new Error(`No JSON-LD blocks found: ${url}`);
    const types = blocks.map((block, index) => {
      const decoded = decodeHtmlEntities(block);
      try {
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed)) return parsed.map((item) => item['@type']).join('|');
        return parsed['@type'];
      } catch (error) {
        const pos = Number(String(error.message).match(/position (\d+)/)?.[1] || 0);
        console.error(`SCHEMA_FAIL ${url} block ${index + 1}`);
        console.error(error.message);
        console.error(showContext(decoded, pos));
        throw error;
      }
    });
    console.log(`SCHEMA_OK ${url} :: ${types.join(', ')}`);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
