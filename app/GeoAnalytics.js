'use client';

import { useEffect } from 'react';

const AI_HOSTS = [
  ['chatgpt', /(^|\.)chatgpt\.com$/i],
  ['chatgpt', /(^|\.)chat\.openai\.com$/i],
  ['perplexity', /(^|\.)perplexity\.ai$/i],
  ['claude', /(^|\.)claude\.ai$/i],
  ['gemini', /(^|\.)gemini\.google\.com$/i],
  ['copilot', /(^|\.)copilot\.microsoft\.com$/i]
];

const MONEY_PAGES = new Set([
  '/custom-packaging-manufacturer.html',
  '/products/custom-rigid-boxes.html',
  '/products/luxury-magnetic-boxes.html',
  '/products/paper-bags.html',
  '/products/stand-up-pouch.html',
  '/products/custom-stand-up-pouches.html',
  '/products/flexible-packaging.html'
]);

const ATTRIBUTION_KEY = 'bpf:first-touch-attribution:v1';
const QUOTE_INTENT = /\b(quote|rfq|inquir(?:y|e)|get started|manufactur(?:e|ing))\b/i;
const SAMPLE_INTENT = /\bsamples?\b/i;

// Cross-page memory of the visitor's most recent dieline download, so a later
// product-page visit can be attributed back to it. No PII: slug/dimensions/format
// only. Kept separate from ATTRIBUTION_KEY, which is session-scoped and unrelated.
const DIELINE_CONTEXT_KEY = 'bpf:dieline-context:v1';
const DIELINE_CONTEXT_MAX_AGE_DAYS = 30;

// Lets a human tester exempt their own browser from GA4 counts by visiting any
// page once with ?bpf_internal=1. Persisted in localStorage so it survives across
// sessions for the rest of a testing pass.
const INTERNAL_TRAFFIC_KEY = 'bpf:internal-traffic:v1';

const LOCALE_CODES = ['ar', 'de', 'es', 'fr', 'ja'];

export function pageLanguageFromPath(pathname = '') {
  const first = String(pathname || '').replace(/^\/+/, '').split('/')[0]?.toLowerCase() || '';
  return LOCALE_CODES.includes(first) ? first : 'en';
}

export function setDielineContext(context) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      DIELINE_CONTEXT_KEY,
      JSON.stringify({ ...context, ts: new Date().toISOString() })
    );
  } catch {
    // Best effort only; conversion tracking must never block a download.
  }
}

function getDielineContext() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DIELINE_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const ts = Date.parse(parsed?.ts || '');
    if (!Number.isFinite(ts)) return null;
    const daysSince = Math.floor((Date.now() - ts) / 86400000);
    if (daysSince > DIELINE_CONTEXT_MAX_AGE_DAYS) return null;
    return { ...parsed, daysSince };
  } catch {
    return null;
  }
}

function isInternalTraffic() {
  if (typeof window === 'undefined') return false;
  try {
    const query = new URLSearchParams(window.location.search);
    if (query.get('bpf_internal') === '1') {
      window.localStorage.setItem(INTERNAL_TRAFFIC_KEY, '1');
    }
    return window.localStorage.getItem(INTERNAL_TRAFFIC_KEY) === '1';
  } catch {
    return false;
  }
}

function providerFrom(value = '') {
  let host = String(value || '').trim().toLowerCase();
  try {
    host = new URL(host.includes('://') ? host : `https://${host}`).hostname;
  } catch {
    host = host.split('/')[0];
  }
  return AI_HOSTS.find(([, pattern]) => pattern.test(host))?.[0] || '';
}

function getAttribution() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Storage can be unavailable in hardened browsers; analytics remains best effort.
  }

  const query = new URLSearchParams(window.location.search);
  const attribution = {
    landing_page: window.location.pathname,
    utm_source: query.get('utm_source') || '',
    utm_medium: query.get('utm_medium') || '',
    referrer: document.referrer || ''
  };
  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Keep the in-memory values for this event when storage is blocked.
  }
  return attribution;
}

function markSessionEvent(key) {
  try {
    if (window.sessionStorage.getItem(key)) return false;
    window.sessionStorage.setItem(key, '1');
  } catch {
    // Do not disable click tracking when session storage is unavailable.
  }
  return true;
}

export function sendGaEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  if (isInternalTraffic()) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('event', name, {
    ...getAttribution(),
    page_location: window.location.href,
    page_path: window.location.pathname,
    ...params
  });
}

export default function GeoAnalytics() {
  useEffect(() => {
    const attribution = getAttribution();
    const utmSource = attribution.utm_source || '';
    const referrer = attribution.referrer || '';
    const provider = providerFrom(utmSource) || providerFrom(referrer);
    const pagePath = window.location.pathname;

    if (provider) {
      const key = `bpf-ai-referral:${provider}:${pagePath}`;
      if (markSessionEvent(key)) {
        sendGaEvent('ai_referral_landing', {
          ai_provider: provider,
          attribution_source: utmSource ? 'utm' : 'referrer'
        });
      }
    }

    if (MONEY_PAGES.has(pagePath)) {
      sendGaEvent('geo_money_page_view', { landing_page: pagePath });
    }

    if (/^(\/[a-z]{2})?\/products\/[^/]+\.html$/i.test(pagePath)) {
      const dieline = getDielineContext();
      if (dieline && markSessionEvent(`bpf:product-after-dieline:${pagePath}`)) {
        sendGaEvent('product_page_view_after_dieline', {
          dieline_type: dieline.slug || '',
          product_category: dieline.productCategory || '',
          days_since_download: dieline.daysSince,
          matched_related_product: dieline.relatedProduct === pagePath
        });
      }
    }

    let formStarted = false;
    let rfqFormStarted = false;
    const onFocusIn = event => {
      if (!formStarted && event.target.closest?.('#contactQuoteForm')) {
        formStarted = true;
        if (markSessionEvent('bpf:quote-start')) {
          sendGaEvent('quote_start', { interaction_method: 'form_focus' });
        }
        if (markSessionEvent('bpf:quote-form-start:contactQuoteForm')) {
          sendGaEvent('quote_form_start', { form_id: 'contactQuoteForm', interaction_method: 'form_focus' });
        }
      }
      if (!rfqFormStarted && event.target.closest?.('#rfqForm')) {
        rfqFormStarted = true;
        if (markSessionEvent('bpf:quote-form-start:rfqForm')) {
          sendGaEvent('quote_form_start', { form_id: 'rfqForm', interaction_method: 'form_focus' });
        }
      }
    };
    const onSubmit = event => {
      const form = event.target?.closest ? event.target : null;
      if (form?.id === 'rfqForm' && markSessionEvent('bpf:quote-form-submit:rfqForm')) {
        sendGaEvent('quote_form_submit', { form_id: 'rfqForm', interaction_method: 'static_form_submit' });
      }
    };
    const onClick = event => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const linkText = (
        link.textContent || link.getAttribute('aria-label') || link.getAttribute('title') || ''
      ).trim().slice(0, 100);
      const common = {
        link_url: link.href,
        link_text: linkText
      };
      if (/^mailto:/i.test(href)) sendGaEvent('email_click', common);
      if (/https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(href)) sendGaEvent('whatsapp_click', common);

      if (link.closest('.locale-switcher')) {
        const toLanguage = (link.getAttribute('hreflang') || link.getAttribute('lang') || '').toLowerCase();
        sendGaEvent('language_switch', {
          from_language: pageLanguageFromPath(pagePath),
          to_language: toLanguage || pageLanguageFromPath(href)
        });
      }

      const intentText = `${linkText} ${href}`;
      const isContactDestination = /(?:^|\/)contact\.html(?:[?#]|$)|#rfq-form-section/i.test(href);
      const isSampleDestination = /(?:^|\/)samples\.html(?:[?#]|$)/i.test(href);
      const isDirectContact = /^mailto:/i.test(href) || /https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(href);
      if (
        QUOTE_INTENT.test(intentText) &&
        (isContactDestination || isDirectContact) &&
        markSessionEvent('bpf:quote-start')
      ) {
        sendGaEvent('quote_start', { ...common, interaction_method: 'cta_click' });
      }
      if (
        SAMPLE_INTENT.test(intentText) &&
        (isSampleDestination || isContactDestination || isDirectContact) &&
        markSessionEvent('bpf:sample-request')
      ) {
        sendGaEvent('sample_request', { ...common, interaction_method: 'cta_click' });
      }

      if (
        pagePath.startsWith('/dielines') &&
        (isContactDestination || isDirectContact) &&
        markSessionEvent('bpf:dieline-to-quote')
      ) {
        sendGaEvent('dieline_to_quote', { ...common, interaction_method: 'contextual_link' });
      }
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('submit', onSubmit, true);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('submit', onSubmit, true);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}

