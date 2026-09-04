import { getPage, listHtmlRoutes } from '../../lib/static-pages';
import { siteUrl } from '../../lib/site-structure';

export const revalidate = 3600;

function xmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function articleDetails(jsonLdBlocks = []) {
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block);
      const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length) {
        const item = queue.shift();
        if (!item || typeof item !== 'object') continue;
        if (Array.isArray(item['@graph'])) queue.push(...item['@graph']);
        const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
        if (types.some(type => ['Article', 'BlogPosting', 'NewsArticle'].includes(type))) {
          const author = Array.isArray(item.author) ? item.author[0] : item.author;
          return {
            published: item.datePublished || item.dateModified,
            modified: item.dateModified || item.datePublished,
            author: typeof author === 'string' ? author : author?.name
          };
        }
      }
    } catch {
      // Invalid source JSON-LD is reported by the existing schema audit.
    }
  }
  return {};
}

function absoluteUrl(route) {
  return `${siteUrl()}/${route.replace(/^\/+/, '')}`;
}

export async function GET() {
  const items = listHtmlRoutes()
    .filter(route => /^(blog|news)\/[^/]+\.html$/i.test(route))
    .map(route => {
      const page = getPage(route);
      if (!page) return null;
      const article = articleDetails(page.jsonLd);
      const dateValue = article.modified || article.published;
      const timestamp = dateValue ? Date.parse(dateValue) : Number.NaN;
      return {
        route,
        url: absoluteUrl(route),
        title: page.metadata.title,
        description: page.metadata.description,
        author: article.author || 'Lisa Wu',
        date: Number.isFinite(timestamp) ? new Date(timestamp) : null,
        timestamp: Number.isFinite(timestamp) ? timestamp : 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  const latest = items.find(item => item.date)?.date || new Date('2026-08-15T00:00:00+08:00');
  const entries = items.map(item => `    <item>
      <title>${xmlEscape(item.title)}</title>
      <link>${xmlEscape(item.url)}</link>
      <guid isPermaLink="true">${xmlEscape(item.url)}</guid>
      <description>${xmlEscape(item.description)}</description>
      <dc:creator>${xmlEscape(item.author)}</dc:creator>
      ${item.date ? `<pubDate>${item.date.toUTCString()}</pubDate>` : ''}
    </item>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>BestPackFactory Packaging Insights</title>
    <link>${siteUrl()}/blog.html</link>
    <description>Practical custom packaging engineering, sourcing, quality-control and compliance guidance.</description>
    <language>en</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
${entries}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
