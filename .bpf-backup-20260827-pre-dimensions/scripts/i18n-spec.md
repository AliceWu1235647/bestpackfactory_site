# BestPackFactory i18n Translation Spec (for sub-agents)

## Mission
Create a localized version of bestpackfactory.com in ONE target language. Output must be **native-speaker quality, locally adapted industry terminology** — NOT machine-translation flavor. Title and description must be **written fresh for the target market**, not literal translations of the English.

## Source
English source pages in: `C:/Users/Administrator/Documents/www.bestpackfactory.com/bestpackfactory-site/content-site/`
- `index.html` (homepage)
- `products.html` (products listing)
- `contact.html` (contact)
- `products/{slug}.html` (20 high-value product pages, list below)

## Output
Write each translated page to:
`C:/Users/Administrator/Documents/www.bestpackfactory.com/bestpackfactory-site/content-site/{lang}/{same-filename}.html`

Create the directory if missing. Output exactly the same number of files as inputs (23).

### Files to translate (23)
1. index.html
2. products.html
3. contact.html
4. products/custom-boxes.html
5. products/custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html
6. products/luxury-magnetic-boxes.html
7. products/paper-bags.html
8. products/custom-flat-bottom-pouches.html
9. products/coffee-bags.html
10. products/pet-food-bags.html
11. products/custom-cosmetic-packaging-boxes.html
12. products/pizza-packaging-boxes.html
13. products/pharma-packaging.html
14. products/custom-printed-tape.html
15. products/tin-boxes.html
16. products/labels-stickers.html
17. products/custom-tea-packaging-bags.html
18. products/kraft-paper-coffee-bags.html
19. products/custom-compostable-stand-up-pouches.html
20. products/pharmaceutical-folding-cartons.html
21. products/wine-magnetic-gift-boxes.html
22. products/custom-printed-tissue-paper.html
23. products/custom-retort-pouches-ready-meal-packaging.html

## Hard technical rules (do NOT break the page)
- Keep the same `<html lang="{code}">` (de/fr/es/ja/ar).
- Keep ALL CSS classes and structural markup identical — only translate text content.
- Keep all `<a href>` links, images, and internal URLs exactly as in English source (relative links stay relative; /products/... stays /products/...).
- **Canonical**: point to the ENGLISH version: `<link rel="canonical" href="https://www.bestpackfactory.com/{english-relative-path}"/>` (e.g. for de/custom-boxes.html the canonical is https://www.bestpackfactory.com/products/custom-boxes.html).
- Add hreflang alternates in <head>: en + de/fr/es/ja/ar (whichever 5 languages exist) + x-default → English. Use absolute URLs with /{lang}/ prefix.
- Keep meta robots `index, follow`.
- Keep ALL existing JSON-LD blocks, translate the human-readable text fields (name, description, headline, FAQ questions/answers) into the target language.
- MOQ 500 PCS, WhatsApp +86 158 8653 0985, lisa@colorprintingpackage.com, Shenzhen address — keep these facts EXACTLY (numbers/contacts never translated).
- Product specs tables: translate labels AND values into natural local terms (e.g. "corrugated" → "Wellpappe" / "carton ondulé" / "corrugado" / 段ボール / 瓦楞纸 etc).
- For /ar/: add `dir="rtl"` on `<html>` and keep the layout classes; text flows right-to-left naturally.

## Language-specific facts to keep consistent
- Brand: BestPackFactory (never translate)
- Product names in h1/title: localize naturally (e.g. "Custom Boxes" → "Cartons personnalisés" for fr)
- Title length ≤ 60 chars, meta description 150–160 chars, unique per page, includes local MOQ/factory-direct/custom + product keyword.
- Tone: professional B2B factory sales, direct and specific, same as English.

## Output format
Write each file with UTF-8 encoding (no BOM). After writing all 23, report: list of files written + confirmation that canonical/hreflang/lang attributes are present in each.
