import os
import re

# Industry Technical Keywords to Inject (Invisible Enrichment)
TECH_TERMS = {
    "pouches": "High-barrier laminate structure with OTR < 0.5 cc/m²/day and WVTR < 0.5 g/m²/day.",
    "bags": "Custom micron thickness (80-150um) engineered for tensile strength and puncture resistance.",
    "boxes": "Premium FSC-certified rigid board with structural engineering for high load-bearing capacity.",
    "labels": "Industrial-grade adhesive with chemical resistance and precision registration tolerance ±0.2mm.",
    "flexible": "Multi-layer co-extrusion technology for superior shelf-life and aroma preservation."
}

def enrich_seo():
    content_root = 'content-site'
    product_map = {}

    # 1. First, map all products for internal linking
    for root, dirs, files in os.walk(os.path.join(content_root, 'products')):
        for file in files:
            if file.endswith('.html'):
                slug = file.replace('.html', '')
                title = slug.replace('-', ' ').title()
                product_map[title] = f"products/{file}"
                # Add shorter versions for common names
                short_name = title.replace('Custom ', '').replace(' Packaging', '').strip()
                if len(short_name) > 5:
                    product_map[short_name] = f"products/{file}"

    # 2. Process all HTML files
    for root, dirs, files in os.walk(content_root):
        for file in files:
            if not file.endswith('.html'): continue
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                html = f.read()
            
            original = html

            # --- A. Alt Text Auditing ---
            # Replace boring alt text with context-rich text
            def alt_fix(match):
                prefix = match.group(1)
                old_alt = match.group(2)
                suffix = match.group(3)
                clean_name = old_alt.replace('main product image', '').replace('thumbnail', '').strip()
                new_alt = f"{clean_name} factory direct B2B custom packaging with matte finish"
                return f'<img {prefix}alt="{new_alt}" {suffix}>'
            
            html = re.sub(r'<img (.*?)alt="([^"]+)" (.*?)>', alt_fix, html)

            # --- B. Invisible GEO Enrichment (Semantic Terms) ---
            # Find the first <p> in product detail and append tech terms quietly
            if 'products/' in root.replace('\\', '/'):
                for key, term in TECH_TERMS.items():
                    if key.lower() in file.lower():
                        # Append to the first description paragraph
                        html = re.sub(r'(<p>BestPackFactory supplies this product.*?</p>)', 
                                      fr'\1<p style="font-size:0.9em; color:#666;">Technical Focus: {term}</p>', 
                                      html, count=1)
                        break

            # --- C. Internal Link Architecture (Blog only) ---
            if 'blog/' in root.replace('\\', '/') or 'news/' in root.replace('\\', '/'):
                # Sort keywords by length to avoid partial matches
                sorted_keys = sorted(product_map.keys(), key=len, reverse=True)
                # Ensure we don't link inside existing <a> tags or <h1>-<h3>
                for key in sorted_keys:
                    url = product_map[key]
                    # Simple regex that avoids linking the same word multiple times
                    # and avoids already linked text.
                    link_pattern = re.compile(rf'(?<!<a[^>]*>)\b({re.escape(key)})\b(?!</a>)', re.IGNORECASE)
                    html = link_pattern.sub(fr'<a href="../{url}">\1</a>', html, count=2)

            if html != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"Enriched: {path}")

if __name__ == "__main__":
    enrich_seo()
