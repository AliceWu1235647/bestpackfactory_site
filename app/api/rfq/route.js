import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 50_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const requestBuckets = new Map();

function responseHeaders() {
  return { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
}

function clientKey(request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

function isRateLimited(request) {
  const now = Date.now();
  const key = clientKey(request);
  const current = requestBuckets.get(key);
  if (!current || current.expiresAt <= now) {
    requestBuckets.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  if (requestBuckets.size > 1000) {
    for (const [bucketKey, bucket] of requestBuckets) {
      if (bucket.expiresAt <= now) requestBuckets.delete(bucketKey);
    }
  }
  return current.count > RATE_LIMIT_MAX;
}

function cleanValue(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim().slice(0, 5000);
  if (typeof value === 'object' && value.name) return String(value.name).slice(0, 500);
  return String(value).trim().slice(0, 5000);
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  const payload = {};
  if (contentType.includes('application/json')) {
    const json = await request.json().catch(() => ({}));
    for (const [key, value] of Object.entries(json || {})) payload[key] = cleanValue(value);
    return payload;
  }
  const form = await request.formData().catch(() => null);
  if (form) {
    for (const [key, value] of form.entries()) payload[key] = cleanValue(value);
  }
  return payload;
}

function whatsappMessage(payload) {
  const keys = ['Product Type', 'Size', 'Quantity', 'Material', 'Printing Colors', 'Destination Country', 'WhatsApp', 'Email', 'Message'];
  const lines = ['Hello BestPackFactory, I need a custom packaging quote:'];
  for (const key of keys) if (payload[key]) lines.push(`${key}: ${payload[key]}`);
  return `https://wa.me/8615886530985?text=${encodeURIComponent(lines.join('\n'))}`;
}

async function forwardWebhook(payload) {
  const url = process.env.RFQ_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
  if (!url) return { configured: false };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000)
  });
  return { configured: true, ok: res.ok, status: res.status };
}

export async function POST(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Request body is too large.' }, { status: 413, headers: responseHeaders() });
  }
  if (isRateLimited(request)) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Please try again shortly.' }, { status: 429, headers: responseHeaders() });
  }

  const payload = await readPayload(request);
  if (!Object.keys(payload).length) {
    return NextResponse.json({ ok: false, error: 'No RFQ fields were received.' }, { status: 400, headers: responseHeaders() });
  }
  const enriched = {
    ...payload,
    source: 'bestpackfactory-static-first-rfq-api',
    receivedAt: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || ''
  };
  let webhook = { configured: false };
  try { webhook = await forwardWebhook(enriched); } catch { webhook = { configured: true, ok: false, error: 'Webhook failed' }; }
  console.info('[RFQ API]', JSON.stringify({
    receivedAt: enriched.receivedAt,
    fields: Object.keys(payload),
    webhookConfigured: Boolean(webhook.configured),
    webhookOk: webhook.ok ?? null
  }));
  return NextResponse.json({
    ok: true,
    message: 'RFQ received by dynamic API mirror. FormSubmit or webhook should be used for email delivery.',
    webhook,
    whatsapp: whatsappMessage(enriched),
    email: 'lisa@colorprintingpackage.com'
  }, { headers: responseHeaders() });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/rfq',
    mode: 'dynamic RFQ API mirror for the static-first contact page',
    delivery: 'Set RFQ_WEBHOOK_URL or keep FormSubmit fallback on contact.html.'
  }, { headers: responseHeaders() });
}
