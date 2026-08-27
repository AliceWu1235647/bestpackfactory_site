import { createHash } from 'crypto';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 20_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = 5;
const DEFAULT_CONTACT_EMAIL = 'lisa@colorprintingpackage.com';
const requestBuckets = new Map();

let cachedTransporter;
let cachedMailConfig;

function responseHeaders() {
  return { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
}

function clean(value, max = 500, preserveNewlines = false) {
  if (typeof value !== 'string') return '';
  const sliced = value.slice(0, max);
  if (preserveNewlines) {
    return sliced
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  return sliced.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function htmlWithBreaks(value) {
  return escapeHtml(value).replaceAll('\n', '<br/>');
}

function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clientKey(request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

function isRateLimited(request) {
  const now = Date.now();
  const key = clientKey(request);
  const bucket = requestBuckets.get(key);
  if (!bucket || bucket.expiresAt <= now) {
    requestBuckets.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function allowedOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const originHost = new URL(origin).hostname.toLowerCase();
    const allowedHosts = new Set(['bestpackfactory.com', 'www.bestpackfactory.com', 'localhost', '127.0.0.1']);
    for (const candidate of [process.env.SITE_URL, process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`]) {
      if (!candidate) continue;
      try {
        allowedHosts.add(new URL(candidate).hostname.toLowerCase());
      } catch {
        // Ignore malformed optional environment values.
      }
    }
    return allowedHosts.has(originHost);
  } catch {
    return false;
  }
}

function whatsappLink(payload) {
  const lines = [
    'Hello Lisa, I would like a custom packaging quote.',
    `Name: ${payload.name}`,
    `Company: ${payload.company}`,
    `Email: ${payload.email}`,
    `Product: ${payload.product}`,
    `Quantity: ${payload.quantity}`
  ];
  if (payload.phone) lines.push(`Phone / WhatsApp: ${payload.phone}`);
  if (payload.message) lines.push(`Requirements: ${payload.message}`);
  return `https://wa.me/8615886530985?text=${encodeURIComponent(lines.join('\n'))}`;
}

function booleanEnv(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value.trim().toLowerCase() === 'true';
}

function smtpConfiguration() {
  const host = clean(process.env.SMTP_HOST, 255);
  const port = Number(process.env.SMTP_PORT || 587);
  const user = clean(process.env.SMTP_USER, 254);
  const pass = typeof process.env.SMTP_PASS === 'string' ? process.env.SMTP_PASS : '';
  const from = clean(process.env.SMTP_FROM, 254) || user;
  const to = clean(process.env.CONTACT_TO_EMAIL || process.env.CONTACT_EMAIL, 254) || DEFAULT_CONTACT_EMAIL;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65_535 || !user || !pass || !validEmail(from) || !validEmail(to)) {
    return null;
  }

  const secure = booleanEnv(process.env.SMTP_SECURE, port === 465);
  const requireTLS = booleanEnv(process.env.SMTP_REQUIRE_TLS, !secure);
  return { host, port, secure, requireTLS, user, pass, from, to };
}

function mailer() {
  const config = smtpConfiguration();
  if (!config) return null;

  const cacheKey = `${config.host}:${config.port}:${config.secure}:${config.requireTLS}:${config.user}:${config.from}:${config.to}`;
  if (cachedTransporter && cachedMailConfig?.cacheKey === cacheKey) {
    return { transporter: cachedTransporter, config: cachedMailConfig };
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTLS,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
    disableFileAccess: true,
    disableUrlAccess: true,
    tls: { minVersion: 'TLSv1.2' }
  });
  cachedMailConfig = { ...config, pass: undefined, cacheKey };
  return { transporter: cachedTransporter, config: cachedMailConfig };
}

function adminMessage(payload, config) {
  const text = [
    'New Customer Inquiry',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company: ${payload.company}`,
    `Phone / WhatsApp: ${payload.phone || 'Not provided'}`,
    `Product: ${payload.product}`,
    `Quantity: ${payload.quantity}`,
    `Page: ${payload.page || 'Not provided'}`,
    '',
    'Message:',
    payload.message || 'No additional message',
    '',
    'Sent from bestpackfactory.com contact form'
  ].join('\n');

  const html = `
    <h2>New Customer Inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Company:</strong> ${escapeHtml(payload.company)}</p>
    <p><strong>Phone / WhatsApp:</strong> ${escapeHtml(payload.phone || 'Not provided')}</p>
    <p><strong>Product:</strong> ${escapeHtml(payload.product)}</p>
    <p><strong>Quantity:</strong> ${escapeHtml(payload.quantity)}</p>
    <p><strong>Page:</strong> ${escapeHtml(payload.page || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${htmlWithBreaks(payload.message || 'No additional message')}</p>
    <hr/>
    <p><small>Sent from bestpackfactory.com contact form</small></p>
  `;

  return {
    from: `BestPackFactory Website <${config.from}>`,
    to: config.to,
    replyTo: payload.email,
    subject: `New inquiry: ${payload.product} - ${payload.name}`,
    text,
    html
  };
}

function customerReply(payload, config) {
  const text = [
    `Dear ${payload.name},`,
    '',
    `Thank you for contacting BestPackFactory. We received your inquiry about ${payload.product}.`,
    'Lisa Wu will review the details and reply within 24 hours.',
    '',
    'For urgent inquiries:',
    'WhatsApp: +86 158 8653 0985',
    `Email: ${config.to}`,
    '',
    'Best regards,',
    'BestPackFactory Team'
  ].join('\n');

  const html = `
    <h2>Thank you for contacting BestPackFactory</h2>
    <p>Dear ${escapeHtml(payload.name)},</p>
    <p>We received your inquiry about <strong>${escapeHtml(payload.product)}</strong>.</p>
    <p>Lisa Wu will review the details and reply within 24 hours.</p>
    <p>For urgent inquiries:</p>
    <ul>
      <li>WhatsApp: +86 158 8653 0985</li>
      <li>Email: ${escapeHtml(config.to)}</li>
    </ul>
    <p>Best regards,<br/>BestPackFactory Team</p>
  `;

  return {
    from: `BestPackFactory <${config.from}>`,
    to: payload.email,
    replyTo: config.to,
    subject: 'Thank you for your inquiry - BestPackFactory',
    text,
    html
  };
}

async function parsePayload(request) {
  const bodyText = await request.text();
  if (Buffer.byteLength(bodyText, 'utf8') > MAX_BODY_BYTES) {
    return { tooLarge: true, raw: {} };
  }

  let raw = {};
  try {
    raw = JSON.parse(bodyText);
  } catch {
    raw = {};
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) raw = {};

  return {
    tooLarge: false,
    raw: {
      name: clean(raw.name, 120),
      email: clean(raw.email, 254).toLowerCase(),
      company: clean(raw.company, 180),
      phone: clean(raw.phone, 60),
      product: clean(raw.product, 160),
      quantity: clean(raw.quantity, 80),
      message: clean(raw.message, 4000, true),
      page: clean(raw.page, 500),
      consent: raw.consent === true,
      website: clean(raw.website, 300)
    }
  };
}

export async function POST(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'Your inquiry is too large.' }, { status: 413, headers: responseHeaders() });
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ ok: false, error: 'Please submit the form as JSON.' }, { status: 415, headers: responseHeaders() });
  }
  if (!allowedOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'This submission origin is not allowed.' }, { status: 403, headers: responseHeaders() });
  }
  if (isRateLimited(request)) {
    return NextResponse.json({ ok: false, error: 'Too many submissions. Please wait a few minutes and try again.' }, { status: 429, headers: responseHeaders() });
  }

  const parsed = await parsePayload(request);
  if (parsed.tooLarge) {
    return NextResponse.json({ ok: false, error: 'Your inquiry is too large.' }, { status: 413, headers: responseHeaders() });
  }
  const payload = parsed.raw;

  // Bots commonly fill this visually hidden field. Return a neutral success without sending mail.
  if (payload.website) {
    return NextResponse.json({ ok: true, message: 'Thank you! Your inquiry has been received.', whatsapp: whatsappLink(payload) }, { headers: responseHeaders() });
  }
  if (!payload.name || !payload.email || !payload.company || !payload.product || !payload.quantity || !payload.consent) {
    return NextResponse.json({ ok: false, error: 'Please complete all required fields.' }, { status: 400, headers: responseHeaders() });
  }
  if (!validEmail(payload.email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400, headers: responseHeaders() });
  }

  const smtp = mailer();
  if (!smtp) {
    console.error('[Contact API] SMTP configuration is incomplete.');
    return NextResponse.json({
      ok: false,
      error: 'Email delivery is not configured. Please send your inquiry on WhatsApp.',
      whatsapp: whatsappLink(payload)
    }, { status: 503, headers: responseHeaders() });
  }

  let autoReplyDelivered = false;
  try {
    await smtp.transporter.sendMail(adminMessage(payload, smtp.config));
    try {
      await smtp.transporter.sendMail(customerReply(payload, smtp.config));
      autoReplyDelivered = true;
    } catch (error) {
      console.warn('[Contact API] Customer auto-reply failed.', { code: error?.code, responseCode: error?.responseCode });
    }
  } catch (error) {
    console.error('[Contact API] SMTP delivery failed.', { code: error?.code, responseCode: error?.responseCode });
    return NextResponse.json({
      ok: false,
      error: 'Email delivery is temporarily unavailable. Please send your inquiry on WhatsApp.',
      whatsapp: whatsappLink(payload)
    }, { status: 502, headers: responseHeaders() });
  }

  console.info('[Contact API]', JSON.stringify({ delivered: true, autoReplyDelivered, channel: 'smtp', product: payload.product }));
  return NextResponse.json({
    ok: true,
    message: 'Thank you! Lisa will contact you within 24 hours.',
    whatsapp: whatsappLink(payload)
  }, { headers: responseHeaders() });
}
