import 'server-only';

import fs from 'fs';
import path from 'path';
import { metadataFromHtml } from './static-pages';

const SITE_URL = 'https://www.bestpackfactory.com';
const BLOG_ROOT = path.join(process.cwd(), 'content-site', 'blog');

export const BLOG_TOPICS = [
  {
    id: 'cost-planning',
    label: 'Cost & Planning',
    description: 'MOQ, landed cost, lead time, freight and inventory decisions.',
    matches: /cost|moq|lead-time|landed|shipping|dimensional|seasonal/i
  },
  {
    id: 'boxes-inserts',
    label: 'Boxes & Inserts',
    description: 'Rigid boxes, folding cartons, mailers, tubes and fitted inserts.',
    matches: /box|carton|mailer|gift|insert|tube|skincare/i
  },
  {
    id: 'flexible-packaging',
    label: 'Flexible Packaging',
    description: 'Coffee bags, pouches, mylar bags, pet food and cannabis packaging.',
    matches: /coffee|pouch|bag|mylar|pet-food|cannabis|flexible/i
  },
  {
    id: 'artwork-production',
    label: 'Artwork & Production',
    description: 'Dielines, samples, color approval, labels and production control.',
    matches: /dieline|artwork|sample|color|roll-label|variable-data|production/i
  },
  {
    id: 'compliance-materials',
    label: 'Compliance & Materials',
    description: 'Food-contact documents, FSC labels, barrier materials and pharma.',
    matches: /compliance|food-safe|fsc|material|barrier|pharma/i
  },
  {
    id: 'supplier-rfq',
    label: 'Supplier & RFQ',
    description: 'Supplier evaluation, quote inputs, briefs and sourcing decisions.',
    matches: /.*/i
  }
];

function decodeHtml(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function cleanTitle(value = '') {
  return decodeHtml(value)
    .replace(/\s*[|\u2013-]\s*BestPackFactory(?:\.com)?\s*$/i, '')
    .trim();
}

function localAssetUrl(value = '') {
  if (!value) return '/assets/hero/slide-01-one-stop.webp';
  try {
    const url = new URL(value, SITE_URL);
    if (/^(www\.)?bestpackfactory\.com$/i.test(url.hostname)) return url.pathname;
  } catch {}
  return value;
}

function readPublishedDate(html = '') {
  return html.match(/["']datePublished["']\s*:\s*["']([^"']+)["']/i)?.[1] || '';
}

function topicFor(post) {
  const haystack = `${post.slug} ${post.title}`;
  return BLOG_TOPICS.find(topic => topic.matches.test(haystack)) || BLOG_TOPICS[BLOG_TOPICS.length - 1];
}

export function formatBlogDate(value = '') {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

export function listBlogPosts() {
  if (!fs.existsSync(BLOG_ROOT)) return [];

  return fs.readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => {
      const slug = entry.name.replace(/\.html$/i, '');
      const html = fs.readFileSync(path.join(BLOG_ROOT, entry.name), 'utf8');
      const metadata = metadataFromHtml(html, `blog/${entry.name}`);
      const published = readPublishedDate(html);
      const image = metadata.openGraph?.images?.[0]?.url || `${SITE_URL}/assets/hero/slide-01-one-stop.webp`;
      const post = {
        slug,
        href: `/blog/${slug}.html`,
        absoluteUrl: `${SITE_URL}/blog/${slug}.html`,
        title: cleanTitle(metadata.title),
        excerpt: decodeHtml(metadata.description),
        published,
        displayDate: formatBlogDate(published),
        image: localAssetUrl(image),
        absoluteImage: image
      };
      const topic = topicFor(post);
      return { ...post, topicId: topic.id, topicLabel: topic.label };
    })
    .sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title));
}

export function groupBlogPosts(posts) {
  return BLOG_TOPICS.map(topic => ({
    ...topic,
    posts: posts.filter(post => post.topicId === topic.id)
  })).filter(topic => topic.posts.length > 0);
}

