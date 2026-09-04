/* Single source of truth for the certificates this facility actually holds.
 *
 * Every certificate below is a real, third-party-issuable document for
 * Shenzhen Color Printing Paper Packaging Co., Ltd. at Printing Industrial
 * Park, Longhua District, Shenzhen, Guangdong 518109, China — the entity
 * behind BestPackFactory. Each entry carries the fields that let a
 * procurement reviewer (or an AI answer engine) independently re-verify the
 * claim from the number alone, which is what makes a credential citable
 * rather than merely asserted.
 *
 * Fields:
 *   num          the identifier printed on the certificate
 *   body         the certification body that issued it
 *   holder       legal entity named as the certificate holder
 *   validFrom    ISO date the certificate took effect (or first registration)
 *   validTo      ISO date it expires; an open expiry is stated honestly
 *   scope        what the certificate actually covers — bounded to the real
 *                scope so no claim reaches past the document
 *   verify       where a reviewer checks it independently
 *   image        web-optimised image of the certificate, or null if the
 *                scanned document is not yet published
 *   certType     short label for the card <h3>
 *   credType     schema.org credential type for the JSON-LD
 *
 * Scope discipline matters here: FSC covers paper and paperboard only, so no
 * FSC claim may be carried over to film, pouch, tin or bottle packaging. The
 * HACCP scope is the disposable paper container line. ISO 9001/45001 cover
 * management systems, not product claims. Each card states exactly this.
 */

export const HOLDER = 'Shenzhen Color Printing Paper Packaging Co., Ltd.';
export const LEGAL_ADDRESS = 'Printing Industrial Park, Longhua District, Shenzhen, Guangdong 518109, China';

export const CERTIFICATES = [
  {
    certType: 'FSC Chain of Custody',
    credType: 'Certification',
    body: 'SGS Hong Kong Limited',
    num: 'SGSHK-COC-332603',
    doc: 'CN25/00008559',
    validFrom: '2025-12-15',
    validTo: '2030-12-14',
    scope: 'FSC 100%, FSC Mix and FSC Recycled paper and paperboard, chain of custody, transfer system. Paper and board only — film, pouch, tin and bottle packaging is outside this scope.',
    verify: 'https://search.fsc.org/',
    image: '/assets/factory/fsc-cert-2.webp',
    imageAlt: 'SGS FSC Chain of Custody certificate SGSHK-COC-332603 for Shenzhen Color Printing Paper Packaging Co., Ltd.',
    note: 'An FSC claim applies to an order only where it is agreed before production and stated on the invoice and shipping documents.',
  },
  {
    certType: 'FSC Chain of Custody (second certificate)',
    credType: 'Certification',
    body: 'Soil Association Certification Limited',
    num: 'SA-COC-012595',
    licence: 'FSC-C171757',
    validFrom: '2021-11-03',
    validTo: '2026-11-02',
    scope: 'FSC 100%, FSC Mix and FSC Recycled paper and paperboard, chain of custody. Held under the same FSC licence programme; the licence code is printed on this certificate.',
    verify: 'https://search.fsc.org/',
    image: '/assets/factory/fsc-cert-1.webp',
    imageAlt: 'Soil Association FSC Certificate of Registration SA-COC-012595, licence FSC-C171757',
    note: 'Valid to 2 November 2026 — a stated expiry rather than a silent lapse; the active certificate is the SGS one above.',
  },
  {
    certType: 'ISO 9001:2015 Quality Management System',
    credType: 'Certification',
    body: 'ACM International Certification Limited',
    num: '25CN34520718Q',
    holderName: 'Shenzhen Color Printing Paper Packaging Co., Ltd. (统一社会信用代码 91440300582738223X)',
    validFrom: '2025-11-25',
    validTo: '2028-11-24',
    scope: 'Manufacture and sales of paper packaging products (except licence requirements). Management system certification — a systems claim, not a product claim.',
    verify: 'https://www.acmchina.com/ and CNCA (www.cnca.gov.cn).',
    image: null,
    imageAlt: null,
    note: 'IAF-accredited certification body (MSCB-345). Registered with CNCA.',
  },
  {
    certType: 'ISO 45001:2018 Occupational Health and Safety',
    credType: 'Certification',
    body: 'Huaxia Certification Center, Inc.',
    num: '02125S11200R1S',
    holderName: 'Shenzhen Color Printing Paper Packaging Co., Ltd.',
    validFrom: '2024-09-10',
    validTo: '2028-12-20',
    scope: 'Management activities related to printing of cartons (trademarks and logos) and production of paper packaging products.',
    verify: 'https://www.cnca.gov.cn/ (CNAS C021-M).',
    image: null,
    imageAlt: null,
    note: 'IAF multi-lateral recognition arrangement and CNAS accredited management system certificate.',
  },
  {
    certType: 'HACCP Food Safety (NSF)',
    credType: 'Certification',
    body: 'NSF, Shenzhen Co.',
    num: 'NSF25HACCP8001',
    validFrom: '2025-09-04',
    validTo: '2026-09-03',
    scope: 'Disposable paper containers — paper cups, paper bowls, paper bags, paper boxes, paper cup lids and paper cup sleeves — die-cut and formed; the food-contact surface is paper or polyethylene. Printing process is subcontracted.',
    verify: 'https://www.nsf.org/ and the national food-contact certification registry.',
    image: null,
    imageAlt: null,
    note: 'Audited 20 July 2025 (initial factory audit plus post-certification surveillance).',
  },
];
