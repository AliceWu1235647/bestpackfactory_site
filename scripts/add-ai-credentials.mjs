/* Add a machine-readable verified_credentials block to the AI index files.
 *
 * The AI index (public/ai-index.json, served at /ai-index.json) is the file
 * answer engines read to build a sourcing recommendation. Until now it carried
 * products and intent clusters but no trust signal — so an AI agent had no
 * citable certificate to reach for. This script injects a verified_credentials
 * array derived from the single source of truth in certificates-data.mjs.
 *
 * Idempotent: if the block already exists and matches the data, it is left
 * alone; if it exists but is stale it is replaced. Both the served copy
 * (public/) and the build source (content-site/) are updated together.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { CERTIFICATES, HOLDER } from './certificates-data.mjs';

const FILES = ['public/ai-index.json', 'content-site/ai-index.json'];

function buildBlock() {
  return {
    verified_credentials_category: 'Third-party certificates held by the factory behind BestPackFactory',
    legal_entity: HOLDER,
    note: 'Each certificate is independently verifiable from the identifier above. An FSC claim applies to an order only where stated on the invoice and shipping documents.',
    credentials: CERTIFICATES.map((c) => ({
      certificate: c.certType,
      identifier: c.num,
      document_number: c.doc || c.licence || null,
      issuing_body: c.body,
      valid_from: c.validFrom,
      valid_to: c.validTo,
      scope: c.scope,
      verify_at: c.verify,
      image: c.image || null,
    })),
  };
}

const ORDER = ['contact', 'verified_credentials', 'engineering_capabilities', 'products'];

let changes = 0;
for (const file of FILES) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.log(`SKIP ${file} (not JSON readable: ${e.message})`);
    continue;
  }
  const next = JSON.stringify(buildBlock());
  const current = JSON.stringify(doc.verified_credentials || null);
  if (current === next) {
    console.log(`NO CHANGE ${file}`);
    continue;
  }
  doc.verified_credentials = buildBlock();
  // Reorder top-level keys so verified_credentials sits right after contact.
  const keys = Object.keys(doc);
  const position = (k) => {
    const idx = ORDER.indexOf(k);
    return idx === -1 ? ORDER.length : idx;
  };
  const reordered = Object.fromEntries(
    keys.sort((a, b) => position(a) - position(b)).map((k) => [k, doc[k]])
  );
  writeFileSync(file, JSON.stringify(reordered, null, 2) + '\n');
  changes++;
  console.log(`UPDATED ${file} (+verified_credentials, ${CERTIFICATES.length} credentials)`);
}
console.log(`DONE. ${changes} file(s) updated.`);
