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

function providerFrom(value = '') {
  let host = String(value || '').trim().toLowerCase();
  try {
    host = new URL(host.includes('://') ? host : `https://${host}`).hostname;
  } catch {
    host = host.split('/')[0];
  }
  return AI_HOSTS.find(([, pattern]) => pattern.test(host))?.[0] || '';
}

export function sendGaEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('event', name, params);
}

export default function GeoAnalytics() {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const utmSource = query.get('utm_source') || '';
    const referrer = document.referrer || '';
    const provider = providerFrom(utmSource) || providerFrom(referrer);
    const pagePath = window.location.pathname;

    if (provider) {
      const key = `bpf-ai-referral:${provider}:${pagePath}`;
      if (!window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, '1');
        sendGaEvent('ai_referral_landing', {
          ai_provider: provider,
          landing_page: pagePath,
          utm_source: utmSource || '(referrer)',
          page_location: window.location.href
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
      sendGaEvent('rfq_form_start', { page_path: pagePath });
    };
    const onClick = event => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const common = {
        page_path: pagePath,
        link_url: link.href,
        link_text: (link.textContent || '').trim().slice(0, 100)
      };
      if (/^mailto:/i.test(href)) sendGaEvent('email_click', common);
      if (/https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(href)) sendGaEvent('whatsapp_click', common);
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

