# GA4 measurement for AI-search referrals and RFQs

## Implemented events

| Event | Trigger | Parameters without personal data |
|---|---|---|
| `ai_referral_landing` | First landing in a session when `utm_source` or referrer identifies ChatGPT, Perplexity, Claude, Gemini or Copilot | `ai_provider`, `landing_page`, `utm_source`, `page_location` |
| `geo_money_page_view` | View of one of the seven phase-one commercial pages | `landing_page` |
| `rfq_form_start` | First focus inside the quote form | `page_path` |
| `quote_form_submission` | Site API or fallback service reports a successful quote submission | `submission_method`, `product_category`, `quantity_band`, `page_path` |
| `generate_lead` | Same successful quote submission, using GA4’s recommended lead event | same non-PII fields |
| `email_click` | Click on a `mailto:` link | `page_path`, `link_url`, `link_text` |
| `whatsapp_click` | Click on a `wa.me` or WhatsApp API link | `page_path`, `link_url`, `link_text` |

Names, email addresses, company names, phone numbers, RFQ message text and uploaded filenames are not sent to GA4.

## ChatGPT detection

- `utm_source=chatgpt.com` is recognized as provider `chatgpt`.
- Referrers from `chatgpt.com` and `chat.openai.com` are recognized when the browser supplies a referrer.
- UTM tagging is the more reliable explicit test because browsers and AI products can suppress referrer data.

## GA4 configuration

1. Confirm the Vercel environment contains a valid `NEXT_PUBLIC_GA_ID` matching `G-[A-Z0-9]+`.
2. In GA4 Admin → Custom definitions, register event-scoped dimensions for `ai_provider`, `landing_page`, `product_category`, `quantity_band` and `submission_method`.
3. Mark `generate_lead` or `quote_form_submission` as a key event. Use one primary conversion to avoid double-counting.
4. Create an Exploration with rows `Landing page + query string`, columns `ai_provider`, and values Users, `rfq_form_start`, `generate_lead`, `email_click` and `whatsapp_click`.
5. Create a second acquisition filter for Session source containing `chatgpt.com`. Compare it with the custom `ai_referral_landing` event because referrer and UTM coverage differ.

## Acceptance test on Preview

1. Open a Preview money page with `?utm_source=chatgpt.com&utm_medium=referral&utm_campaign=manual_geo_test`.
2. In browser developer tools, confirm `window.dataLayer` contains `ai_referral_landing` and `geo_money_page_view` after hydration.
3. Click one email link and one WhatsApp link; confirm the corresponding events appear without changing navigation behavior.
4. Use a non-production test RFQ only if the recipient has approved receiving it. Successful-form tracking fires after the delivery API or fallback returns success, not merely when the button is clicked.
5. Use GA4 DebugView or Realtime to verify receipt before production promotion.

