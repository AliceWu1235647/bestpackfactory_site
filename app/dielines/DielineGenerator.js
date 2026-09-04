'use client';

import { useMemo, useState, useCallback } from 'react';
import { previewSVG, renderFormat } from '../../lib/dielines/build.js';
import { LAYER_STYLE, LAYERS } from '../../lib/dielines/geometry.js';
import styles from './dielines.module.css';

const FORMATS = [
  { id: 'pdf', label: 'PDF', hint: 'print ready', primary: true },
  { id: 'dxf', label: 'DXF', hint: 'cutting table', primary: true },
  { id: 'ai', label: 'AI', hint: 'Illustrator' },
  { id: 'svg', label: 'SVG', hint: 'web / vector' }
];

const LEGEND = [
  [LAYERS.CUT, 'Cut'],
  [LAYERS.FOLD, 'Fold'],
  [LAYERS.PERF, 'Perf / valve'],
  [LAYERS.BLEED, 'Safe area'],
  [LAYERS.GLUE, 'Glue / seal']
];

function track(event, params) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try { window.gtag('event', event, params); } catch { /* analytics is best effort */ }
}

export default function DielineGenerator({ entry }) {
  const initial = useMemo(() => {
    const out = {};
    for (const f of entry.fields) out[f.key] = f.default;
    return out;
  }, [entry]);

  const [params, setParams] = useState(initial);
  const [activePreset, setActivePreset] = useState(0);
  const [busy, setBusy] = useState('');

  const setValue = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setActivePreset(-1);
  }, []);

  const applyPreset = useCallback((preset, index) => {
    setParams(prev => ({ ...prev, ...preset.values }));
    setActivePreset(index);
  }, []);

  // Preview and downloads share one geometry pipeline, so what is on screen is
  // exactly what lands in the file.
  const { svg, error } = useMemo(() => {
    try {
      return { svg: previewSVG(entry, params), error: null };
    } catch (err) {
      return { svg: null, error: err.message };
    }
  }, [entry, params]);

  const sheet = useMemo(() => {
    try {
      return renderFormat(entry, params, 'svg').size;
    } catch {
      return null;
    }
  }, [entry, params]);

  const download = useCallback((format) => {
    setBusy(format);
    try {
      const { data, mime, filename } = renderFormat(entry, params, format);
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      track('dieline_download', {
        dieline: entry.slug,
        format,
        dimensions: entry.fields.filter(f => f.type !== 'bool').map(f => params[f.key]).join('x')
      });
    } catch (err) {
      // Surface a real message rather than failing silently on the button.
      window.alert(`Could not generate the ${format.toUpperCase()} file: ${err.message}`);
    } finally {
      setBusy('');
    }
  }, [entry, params]);

  const numeric = entry.fields.filter(f => f.type !== 'bool');
  const flags = entry.fields.filter(f => f.type === 'bool');

  // Human-readable size string built from the visitor's current inputs, reused
  // for both the WhatsApp quote link and the pre-filled contact subject. This is
  // the conversion hook: a downloader's exact dimensions become a quote request.
  const sizeSummary = numeric.map(f => `${f.label} ${params[f.key]}${f.unit || 'mm'}`).join(', ');

  const quoteHref = useMemo(() => {
    const lines = [
      `Hello BestPackFactory, I designed a ${entry.name} on your dieline tool and would like a production quote.`,
      `Size: ${sizeSummary}.`,
      'MOQ 500 pcs. Please send pricing and lead time.'
    ];
    return `https://wa.me/8615886530985?text=${encodeURIComponent(lines.join('\n'))}`;
  }, [entry.name, sizeSummary]);

  const contactHref = useMemo(() => {
    const subject = `Quote — ${entry.name} (${sizeSummary})`;
    return `/contact.html?subject=${encodeURIComponent(subject)}`;
  }, [entry.name, sizeSummary]);

  const onQuote = useCallback((channel) => {
    track('dieline_quote_click', {
      dieline: entry.slug,
      channel,
      dimensions: numeric.map(f => params[f.key]).join('x')
    });
  }, [entry.slug, numeric, params]);

  return (
    <div className={styles.layout}>
      <aside className={styles.panel}>
        <h2>Set your dimensions</h2>
        <p className={styles.panelHint}>
          Internal dimensions in millimetres. Fold allowance for board or film thickness
          is applied automatically — you do not need to add it yourself.
        </p>

        {entry.presets?.length ? (
          <div className={styles.presets}>
            {entry.presets.map((preset, i) => (
              <button
                key={preset.name}
                type="button"
                title={preset.note}
                className={`${styles.preset} ${activePreset === i ? styles.active : ''}`}
                onClick={() => applyPreset(preset, i)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        ) : null}

        {numeric.map(f => (
          <div className={styles.field} key={f.key}>
            <div className={styles.fieldTop}>
              <label htmlFor={`f-${f.key}`}>{f.label}</label>
              <span className={styles.fieldVal}>
                <input
                  id={`f-${f.key}`}
                  type="number"
                  value={params[f.key]}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={e => {
                    const raw = Number(e.target.value);
                    if (Number.isFinite(raw)) setValue(f.key, Math.min(f.max, Math.max(f.min, raw)));
                  }}
                />
                <span className={styles.unit}>{f.unit || 'mm'}</span>
              </span>
            </div>
            <input
              className={styles.range}
              type="range"
              aria-label={f.label}
              value={params[f.key]}
              min={f.min}
              max={f.max}
              step={f.step}
              onChange={e => setValue(f.key, Number(e.target.value))}
            />
          </div>
        ))}

        {flags.length ? <div className={styles.divider} /> : null}
        {flags.map(f => (
          <label className={styles.check} key={f.key}>
            <input
              type="checkbox"
              checked={Boolean(params[f.key])}
              onChange={e => setValue(f.key, e.target.checked)}
            />
            {f.label}
          </label>
        ))}

        <div className={styles.divider} />

        {sheet ? (
          <div className={styles.sizeOut}>
            Flat blank <b>{sheet.flatW} × {sheet.flatH} mm</b><br />
            Sheet with legend <b>{sheet.sheetW} × {sheet.sheetH} mm</b>
          </div>
        ) : null}

        <div className={styles.downloads}>
          {FORMATS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`${styles.dl} ${f.primary ? '' : styles.alt}`}
              disabled={Boolean(busy)}
              onClick={() => download(f.id)}
            >
              {busy === f.id ? 'Building…' : `Download ${f.label}`}
              <small>{f.hint}</small>
            </button>
          ))}
        </div>
        <p className={styles.noReg}>
          Free. No sign-up, no email, no watermark.<br />
          Files are generated in your browser.
        </p>

        <div className={styles.quoteBox}>
          <strong>Want these made?</strong>
          <p>
            We are the factory behind this dieline. Get a quote for this exact size —
            MOQ 500 pcs, free artwork check, worldwide shipping from Shenzhen.
          </p>
          <div className={styles.quoteActions}>
            <a
              className={styles.quoteBtn}
              href={quoteHref}
              rel="noopener"
              target="_blank"
              onClick={() => onQuote('whatsapp')}
            >
              Quote this size on WhatsApp
            </a>
            <a
              className={`${styles.quoteBtn} ${styles.quoteGhost}`}
              href={contactHref}
              onClick={() => onQuote('contact')}
            >
              Request a quote by email
            </a>
          </div>
        </div>
      </aside>

      <section className={styles.stage}>
        <div className={styles.stageHead}>
          <h2>Live dieline preview</h2>
          <div className={styles.legend}>
            {LEGEND.map(([layer, label]) => (
              <span key={layer}>
                <i
                  className={styles.swatch}
                  style={{
                    borderTopColor: LAYER_STYLE[layer].color,
                    borderTopStyle: LAYER_STYLE[layer].dash ? 'dashed' : 'solid'
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.canvas}>
          {error ? (
            <p style={{ color: '#d0463b', fontWeight: 800 }}>
              Those dimensions do not form a valid structure. Try the presets above.
            </p>
          ) : (
            <div
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
