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

    let formStarted = false;
    const onFocusIn = event => {
      if (formStarted || !event.target.closest?.('#contactQuoteForm')) return;
      formStarted = true;
      if (markSessionEvent('bpf:quote-start')) {
        sendGaEvent('quote_start', { interaction_method: 'form_focus' });
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

      if (pagePath.startsWith('/dielines') && (isContactDestination || isDirectContact)) {
        sendGaEvent('dieline_to_quote', { ...common, interaction_method: 'contextual_link' });
      }
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}

