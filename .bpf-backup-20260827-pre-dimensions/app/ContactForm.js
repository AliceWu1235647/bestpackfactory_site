'use client';

import { useState } from 'react';

const WHATSAPP_NUMBER = '8615886530985';
const THANK_YOU_URL = '/thank-you.html';

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

const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/lisa@colorprintingpackage.com';

// Fallback delivery channel: FormSubmit AJAX posts directly into Lisa's mailbox.
// Used when the native /api/contact SMTP route is not configured (or fails),
// so no inquiry is ever lost.
async function submitViaFormSubmit(submitted) {
  const payload = {
    name: submitted.name,
    email: submitted.email,
    _subject: `Website inquiry: ${submitted.product} - ${submitted.name}`,
    _template: 'table',
    _captcha: 'false',
    company: submitted.company,
    phone: submitted.phone,
    product: submitted.product,
    quantity: submitted.quantity,
    page: submitted.page,
    message: submitted.message,
    attachment_hint: submitted.fileName ? `Buyer attached file: ${submitted.fileName} (send artwork via email/WhatsApp)` : '',
    _honey: submitted.website
  };
  const response = await fetch(FORMSUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`FormSubmit responded ${response.status}`);
  }
  return response.json();
}

export default function ContactForm({ productName = '' }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => initialForm(productName));
  const [status, setStatus] = useState({ type: 'idle', message: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { checked, files, name, type, value } = event.target;
    if (name === 'artwork') {
      setFormData((current) => ({ ...current, fileName: files && files[0] ? files[0].name : '' }));
    } else {
      setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    }
    if (status.type !== 'idle') setStatus({ type: 'idle', message: '', whatsapp: '' });
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 3));
  }
  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    const submitted = { ...formData, page: window.location.href };
    setLoading(true);
    setStatus({ type: 'idle', message: '', whatsapp: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitted)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        const apiError = result.error || 'Unable to send your inquiry.';
        if (/not configured|Email delivery/i.test(apiError)) {
          await submitViaFormSubmit(submitted);
          window.location.href = THANK_YOU_URL;
          return;
        }
        throw new Error(apiError);
      }

      window.location.href = THANK_YOU_URL;
    } catch (error) {
      // Last-resort retry on the FormSubmit channel before surfacing an error.
      try {
        await submitViaFormSubmit(submitted);
        window.location.href = THANK_YOU_URL;
      } catch {
        setStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          whatsapp: fallbackWhatsAppLink(submitted)
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="contact-form-container" id="rfq-form-section" aria-labelledby="contact-form-title">
      <div className="form-header">
        <span>Factory-direct quotation</span>
        <h2 id="contact-form-title">Get a Free Packaging Quote</h2>
        <p>3 quick steps · response within 24 hours · MOQ 500 PCS · free dieline support</p>
      </div>

      {/* Step indicator */}
      <div className="step-indicator" aria-label="Form progress">
        <span className={step >= 1 ? 'step-dot active' : 'step-dot'}>1</span>
        <span className="step-line" />
        <span className={step >= 2 ? 'step-dot active' : 'step-dot'}>2</span>
        <span className="step-line" />
        <span className={step >= 3 ? 'step-dot active' : 'step-dot'}>3</span>
        <div className="step-labels">
          <span>Product</span><span>Specs</span><span>Contact</span>
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

        {/* STEP 1: product + quantity */}
        {step === 1 && (
          <div className="form-step" data-step="1">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-product">Product Interested <em>*</em></label>
                <select id="contact-product" name="product" value={formData.product} onChange={handleChange} required>
                  <option value="">Select a product...</option>
                  <option value="Magnetic Gift Boxes">Magnetic Foldable Gift Boxes</option>
                  <option value="Rigid Gift Boxes">Rigid Gift Boxes</option>
                  <option value="Paper Bags">Custom Paper Bags</option>
                  <option value="Stand-up Pouches">Stand-up Pouches</option>
                  <option value="Food Packaging">Food Packaging Boxes</option>
                  <option value="Folding Cartons">Folding Cartons</option>
                  <option value="Other">Other Products</option>
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
            <button type="button" className="submit-button step-next" onClick={nextStep}>Next: Size &amp; Artwork →</button>
          </div>
        )}

        {/* STEP 2: size / requirements / artwork upload */}
        {step === 2 && (
          <div className="form-step" data-step="2">
            <div className="form-group full-width">
              <label htmlFor="contact-message">Size &amp; Requirements <em>*</em></label>
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
                {formData.fileName ? `Selected: ${formData.fileName}` : 'AI / PDF / PSD / PNG recommended. Large files: send via email or WhatsApp after submitting.'}
              </small>
            </div>

            <div className="step-nav">
              <button type="button" className="submit-button step-back" onClick={prevStep}>← Back</button>
              <button type="button" className="submit-button step-next" onClick={nextStep}>Next: Contact Info →</button>
            </div>
          </div>
        )}

        {/* STEP 3: contact info + consent + submit */}
        {step === 3 && (
          <div className="form-step" data-step="3">
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
                <label htmlFor="contact-company">Company Name <em>(optional)</em></label>
                <input
                  type="text"
                  id="contact-company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  maxLength={180}
                  autoComplete="organization"
                  placeholder="Your Company Ltd."
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-phone">Phone / WhatsApp <em>(optional)</em></label>
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
              <button type="button" className="submit-button step-back" onClick={prevStep}>← Back</button>
              <button type="submit" className="submit-button" disabled={loading} aria-busy={loading}>
                {loading ? 'Sending Your Inquiry...' : 'Get Free Quote Now'}
              </button>
            </div>
          </div>
        )}

        <div className="status-region" aria-live="polite" aria-atomic="true">
          {status.type === 'success' && (
            <div className="status-message success-message" role="status">
              <strong>✓ Inquiry received.</strong>
              <span>{status.message}</span>
              <a href={status.whatsapp} target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
            </div>
          )}
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

      <style>{`
        .contact-form-container {
          width: min(880px, calc(100% - 32px));
          margin: 58px auto;
          scroll-margin-top: 100px;
        }
        .form-header { margin-bottom: 22px; text-align: center; }
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
        .step-indicator { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 0 0 52px; }
        .step-dot {
          width: 30px; height: 30px; border-radius: 50%; background: #e6efe9; color: #65716b;
          display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;
        }
        .step-dot.active { background: #00843d; color: #fff; }
        .step-line { width: 44px; height: 3px; background: #e6efe9; border-radius: 2px; }
        .step-labels { position: absolute; top: 36px; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 12px; color: #65716b; }
        .contact-form {
          position: relative;
          padding: 36px;
          background: linear-gradient(145deg, #f7fbf8, #fff);
          border: 1px solid #dfe9e3;
          border-radius: 18px;
          box-shadow: 0 18px 48px rgba(20, 50, 35, .1);
        }
        .honeypot { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .form-group { display: flex; flex-direction: column; min-width: 0; }
        .form-group label { margin-bottom: 8px; font-size: 13px; font-weight: 700; color: #17231e; }
        .form-group label em { color: #00843d; font-style: normal; }
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 14px; border: 1.5px solid #dbe5df; border-radius: 10px;
          font: inherit; font-size: 15px; color: #17231e; background: #fff; width: 100%;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none; border-color: #00843d; box-shadow: 0 0 0 3px rgba(0, 132, 61, .12);
        }
        .form-group small { margin-top: 6px; color: #8a9590; font-size: 12px; }
        .form-group.full-width { grid-column: 1 / -1; margin-bottom: 20px; }
        .step-nav { display: flex; gap: 14px; margin-top: 24px; }
        .submit-button {
          flex: 1; padding: 15px 22px; border: 0; border-radius: 10px; background: #00843d; color: #fff;
          font: inherit; font-size: 16px; font-weight: 800; cursor: pointer; transition: background .2s;
        }
        .submit-button:hover { background: #006b32; }
        .submit-button:disabled { opacity: .6; cursor: not-allowed; }
        .step-back { background: #f0f5f2; color: #17231e; flex: 0 0 110px; }
        .step-back:hover { background: #e2ece6; }
        .step-next { margin-top: 6px; }
        .consent-row { display: flex; gap: 10px; align-items: flex-start; margin: 22px 0 6px; font-size: 13px; color: #65716b; cursor: pointer; }
        .consent-row input { margin-top: 2px; }
        .status-region { margin-top: 14px; }
        .status-message { padding: 14px 16px; border-radius: 10px; font-size: 14px; }
        .status-message strong { display: block; margin-bottom: 4px; }
        .status-message a { color: #00843d; font-weight: 700; }
        .success-message { background: #e9f7ef; border: 1px solid #b8e3c9; }
        .error-message { background: #fdeeee; border: 1px solid #f2c2c2; color: #7a1f1f; }
        .privacy-note { margin-top: 14px; text-align: center; color: #8a9590; font-size: 12px; }
        .contact-info {
          margin-top: 28px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .contact-item {
          padding: 16px; background: #f7fbf8; border: 1px solid #dfe9e3; border-radius: 12px; text-align: center;
        }
        .contact-item .icon { display: block; font-size: 18px; margin-bottom: 6px; }
        .contact-item strong { display: block; font-size: 12px; color: #8a9590; text-transform: uppercase; margin-bottom: 4px; }
        .contact-item a, .contact-item span { font-size: 14px; color: #17231e; font-weight: 700; word-break: break-all; }
        @media (max-width: 640px) {
          .contact-form { padding: 24px 18px; }
          .form-row { grid-template-columns: 1fr; gap: 16px; }
          .contact-info { grid-template-columns: 1fr; }
          .step-line { width: 24px; }
        }
      `}</style>
    </section>
  );
}
