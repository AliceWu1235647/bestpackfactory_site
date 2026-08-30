'use client';

import { useState } from 'react';

const WHATSAPP_NUMBER = '8615886530985';
const SUCCESS_PATH = '/thank-you.html';

function initialForm(productName) {
  return {
    name: '',
    email: '',
    company: '',
    phone: '',
    product: productName || '',
    quantity: '',
    message: '',
    consent: false,
    website: '',
    fileName: ''
  };
}

function fallbackWhatsAppLink(formData) {
  const lines = [
    'Hello Lisa, I would like a custom packaging quote.',
    `Name: ${formData.name}`,
    `Company: ${formData.company}`,
    `Product: ${formData.product}`,
    `Quantity: ${formData.quantity}`
  ];
  if (formData.message) lines.push(`Requirements: ${formData.message}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

async function formSubmitFallback(data) {
  const payload = {
    name: data.name,
    email: data.email,
    _subject: `Website inquiry: ${data.product} - ${data.name}`,
    _template: 'table',
    _captcha: 'false',
    company: data.company,
    phone: data.phone,
    product: data.product,
    quantity: data.quantity,
    page: data.page,
    message: data.message,
    attachment_hint: data.fileName
      ? `Buyer attached file: ${data.fileName} (send artwork via email/WhatsApp)`
      : '',
    _honey: data.website
  };
  const res = await fetch('https://formsubmit.co/ajax/lisa@colorprintingpackage.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`);
}

export default function ContactForm({ productName = '' }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => initialForm(productName));
  const [status, setStatus] = useState({ type: 'idle', message: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { checked, files, name, type, value } = event.target;
    if (name === 'artwork') {
      setFormData((cur) => ({ ...cur, fileName: files && files[0] ? files[0].name : '' }));
    } else {
      setFormData((cur) => ({ ...cur, [name]: type === 'checkbox' ? checked : value }));
    }
    if (status.type !== 'idle') setStatus({ type: 'idle', message: '', whatsapp: '' });
  }

  function nextStep() { setStep((s) => Math.min(s + 1, 3)); }
  function prevStep() { setStep((s) => Math.max(s - 1, 1)); }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    const submitted = { ...formData, page: window.location.href };
    setLoading(true);
    setStatus({ type: 'idle', message: '', whatsapp: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitted)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        const msg = result.error || 'Unable to send your inquiry.';
        if (/not configured|Email delivery/i.test(msg)) {
          await formSubmitFallback(submitted);
          window.location.href = SUCCESS_PATH;
          return;
        }
        throw new Error(msg);
      }
      window.location.href = SUCCESS_PATH;
    } catch (err) {
      try {
        await formSubmitFallback(submitted);
        window.location.href = SUCCESS_PATH;
      } catch {
        setStatus({
          type: 'error',
          message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          whatsapp: fallbackWhatsAppLink(submitted)
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const dotClass = (n) => `step-dot${step >= n ? ' active' : ''}`;

  return (
    <section className="contact-form-container" id="rfq-form-section" aria-labelledby="contact-form-title">
      <div className="form-header">
        <span>Factory-direct quotation</span>
        <h2 id="contact-form-title">Get a Free Packaging Quote</h2>
        <p>3 quick steps · response within 24 hours · MOQ 500 PCS · free dieline support</p>
      </div>

      <div aria-label="Form progress" className="step-indicator">
        <span className={dotClass(1)}>1</span>
        <span className="step-line" />
        <span className={dotClass(2)}>2</span>
        <span className="step-line" />
        <span className={dotClass(3)}>3</span>
        <div className="step-labels">
          <span>Product</span>
          <span>Specs</span>
          <span>Contact</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="contact-form" id="contactQuoteForm">
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* ── Step 1: Product & Quantity ── */}
        {step === 1 && (
          <div data-step="1" className="form-step">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-product">Product Interested <em>*</em></label>
                <select id="contact-product" name="product" value={formData.product} onChange={handleChange} required>
                  <option value="">Select a product...</option>
                  <option value="Magnetic Gift Boxes">Magnetic Foldable Gift Boxes</option>
                  <option value="Rigid Gift Boxes">Rigid Gift Boxes</option>
                  <option value="Custom Paper Bags">Custom Paper Bags</option>
                  <option value="Stand-up Pouches">Stand-up Pouches</option>
                  <option value="Food Packaging Boxes">Food Packaging Boxes</option>
                  <option value="Folding Cartons">Folding Cartons</option>
                  <option value="Other Products">Other Products</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="contact-quantity">Estimated Quantity <em>*</em></label>
                <select id="contact-quantity" name="quantity" value={formData.quantity} onChange={handleChange} required>
                  <option value="">Select quantity...</option>
                  <option value="500-1,000">500 - 1,000 pcs</option>
                  <option value="1,000-5,000">1,000 - 5,000 pcs</option>
                  <option value="5,000-10,000">5,000 - 10,000 pcs</option>
                  <option value="10,000+">10,000+ pcs</option>
                </select>
              </div>
            </div>
            <div className="step-nav">
              <button type="button" onClick={nextStep} className="submit-button step-next">
                Next: Size &amp; Artwork →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Specs & Artwork ── */}
        {step === 2 && (
          <div data-step="2" className="form-step">
            <div className="form-group full-width">
              <label htmlFor="contact-message">Size, Material &amp; Requirements <em>*</em></label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                maxLength={4000}
                required
                placeholder="e.g. 200x150x60 mm, kraft cardboard, 4-color print, matte lamination, delivery to USA"
              />
              <small>{formData.message.length}/4000</small>
            </div>
            <div className="form-group full-width">
              <label htmlFor="contact-artwork">Upload Logo or Artwork (optional)</label>
              <input
                type="file"
                id="contact-artwork"
                name="artwork"
                accept=".ai,.pdf,.psd,.png,.jpg,.svg,.cdr"
                onChange={handleChange}
              />
              <small>
                {formData.fileName
                  ? `Selected: ${formData.fileName}`
                  : 'AI / PDF / PSD / PNG recommended. Large files: send via email or WhatsApp after submitting.'}
              </small>
            </div>
            <div className="step-nav">
              <button type="button" onClick={prevStep} className="submit-button step-back">← Back</button>
              <button type="button" onClick={nextStep} className="submit-button step-next">
                Next: Contact Info →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Contact Details ── */}
        {step === 3 && (
          <div data-step="3" className="form-step">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name <em>*</em></label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  autoComplete="name"
                  placeholder="John Smith"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email Address <em>*</em></label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={254}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="john@company.com"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-company">Company Name <em>*</em></label>
                <input
                  type="text"
                  id="contact-company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  maxLength={180}
                  autoComplete="organization"
                  placeholder="Your Company Ltd."
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-phone">Phone / WhatsApp</label>
                <input
                  type="tel"
                  id="contact-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={60}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <label className="consent-row" htmlFor="contact-consent">
              <input
                id="contact-consent"
                name="consent"
                type="checkbox"
                checked={formData.consent}
                onChange={handleChange}
                required
              />
              <span>
                I agree that my inquiry details may be emailed to BestPackFactory and used to prepare and respond to my quotation.
              </span>
            </label>
            <div className="step-nav">
              <button type="button" onClick={prevStep} className="submit-button step-back">← Back</button>
              <button type="submit" className="submit-button" disabled={loading} aria-busy={loading}>
                {loading ? 'Sending Your Inquiry...' : 'Get Free Quote Now'}
              </button>
            </div>
          </div>
        )}

        <div className="status-region" aria-live="polite" aria-atomic="true">
          {status.type === 'error' && (
            <div className="status-message error-message" role="alert">
              <strong>We couldn&apos;t send the form.</strong>
              <span>{status.message}</span>
              <a href={status.whatsapp} target="_blank" rel="noopener noreferrer">Send the inquiry on WhatsApp</a>
            </div>
          )}
        </div>

        <p className="privacy-note">Your information is used only to prepare and respond to your packaging quotation.</p>
      </form>

      <div className="contact-info" aria-label="Contact information">
        <div className="contact-item">
          <span className="icon" aria-hidden="true">✉</span>
          <div><strong>Email</strong><a href="mailto:lisa@colorprintingpackage.com">lisa@colorprintingpackage.com</a></div>
        </div>
        <div className="contact-item">
          <span className="icon" aria-hidden="true">●</span>
          <div><strong>WhatsApp</strong><a href="https://wa.me/8615886530985" target="_blank" rel="noopener noreferrer">+86 158 8653 0985 (Lisa Wu)</a></div>
        </div>
        <div className="contact-item">
          <span className="icon" aria-hidden="true">⌂</span>
          <div><strong>Factory</strong><span>Shenzhen, China · 15+ years experience</span></div>
        </div>
      </div>

      <style jsx>{`
        .contact-form-container {
          width: min(880px, calc(100% - 32px));
          margin: 58px auto;
          scroll-margin-top: 100px;
        }
        .form-header { margin-bottom: 28px; text-align: center; }
        .form-header > span {
          display: inline-block;
          margin-bottom: 10px;
          color: #00843d;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .form-header h2 { margin: 0 0 10px; color: #17231e; font-size: clamp(28px, 4vw, 38px); line-height: 1.15; }
        .form-header p { margin: 0; color: #65716b; font-size: 15px; }

        /* ── Step indicator ── */
        .step-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0 0 52px;
        }
        .step-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e6efe9;
          color: #65716b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
        }
        .step-dot.active { background: #00843d; color: #fff; }
        .step-line { width: 44px; height: 3px; background: #e6efe9; border-radius: 2px; }
        .step-labels {
          position: absolute;
          top: 36px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #65716b;
        }

        /* ── Form ── */
        .contact-form {
          position: relative;
          padding: 36px;
          background: linear-gradient(145deg, #f7fbf8, #fff);
          border: 1px solid #dfe9e3;
          border-radius: 18px;
          box-shadow: 0 18px 48px rgba(20, 50, 35, .1);
        }
        .honeypot { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
        .form-step { }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .form-group { display: flex; flex-direction: column; min-width: 0; }
        .form-group.full-width { margin-bottom: 20px; }
        label { margin-bottom: 8px; color: #2d3b34; font-size: 14px; font-weight: 800; }
        label em { color: #b22626; font-style: normal; }
        input, select, textarea {
          width: 100%;
          min-height: 48px;
          padding: 11px 14px;
          color: #17231e;
          background: #fff;
          border: 1px solid #cfdad4;
          border-radius: 9px;
          box-sizing: border-box;
          font: inherit;
          font-size: 15px;
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        input[type="file"] { min-height: auto; padding: 10px 12px; cursor: pointer; }
        textarea { min-height: 126px; resize: vertical; }
        input:focus, select:focus, textarea:focus {
          border-color: #00843d;
          box-shadow: 0 0 0 3px rgba(0, 132, 61, .13);
          outline: none;
        }
        .form-group small { align-self: flex-end; margin-top: 5px; color: #7a857f; font-size: 11px; }

        /* ── Step nav ── */
        .step-nav { display: flex; gap: 14px; margin-top: 24px; }
        .step-next { margin-top: 6px; }
        .step-back {
          background: #f0f5f2;
          color: #17231e;
          flex: 0 0 110px;
        }
        .step-back:hover { background: #e2ece6; }

        /* ── Submit button ── */
        .submit-button {
          flex: 1;
          min-height: 54px;
          padding: 14px 20px;
          color: #fff;
          background: linear-gradient(135deg, #168f4f, #087669);
          border: 0;
          border-radius: 10px;
          font-size: 17px;
          font-weight: 900;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .submit-button:hover:not(:disabled), .submit-button:focus-visible:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(8, 118, 105, .28);
        }
        .submit-button:focus-visible { outline: 3px solid rgba(37, 211, 102, .28); outline-offset: 2px; }
        .submit-button:disabled { cursor: wait; opacity: .66; }

        /* ── Consent ── */
        .consent-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 6px 2px 0;
          color: #5e6c65;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.45;
        }
        .consent-row input { width: 17px; min-height: 17px; margin: 1px 0 0; flex: 0 0 auto; accent-color: #00843d; }

        /* ── Status ── */
        .status-region:empty { display: none; }
        .status-message {
          display: grid;
          gap: 5px;
          margin-top: 18px;
          padding: 15px 17px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.45;
        }
        .status-message a { width: fit-content; margin-top: 5px; font-weight: 900; text-decoration: underline; }
        .error-message { color: #802727; background: #fff0f0; border: 1px solid #efc4c4; }
        .privacy-note { margin: 16px 0 0; color: #6f7c76; font-size: 12px; text-align: center; }

        /* ── Contact info ── */
        .contact-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          margin-top: 26px;
          padding: 25px;
          background: #fff;
          border: 1px solid #e2e9e5;
          border-radius: 14px;
        }
        .contact-item { display: flex; align-items: flex-start; gap: 11px; min-width: 0; }
        .contact-item .icon { color: #00843d; font-size: 22px; line-height: 1; }
        .contact-item div { display: flex; flex-direction: column; min-width: 0; }
        .contact-item strong { margin-bottom: 4px; color: #6b7670; font-size: 12px; text-transform: uppercase; }
        .contact-item a, .contact-item div > span { color: #27362f; font-size: 13px; overflow-wrap: anywhere; }
        .contact-item a { color: #087b49; font-weight: 800; text-decoration: none; }
        .contact-item a:hover { text-decoration: underline; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .contact-form-container { margin: 38px auto; }
          .contact-form { padding: 24px 18px; border-radius: 14px; }
          .form-row { grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }
          .contact-info { grid-template-columns: 1fr; gap: 18px; padding: 21px; }
          .step-back { flex: 0 0 90px; font-size: 15px; }
        }
        @media (prefers-reduced-motion: reduce) {
          input, select, textarea, .submit-button { transition: none; }
        }
      `}</style>
    </section>
  );
}
