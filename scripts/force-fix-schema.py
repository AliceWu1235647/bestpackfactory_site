import os
import re
import json

def force_fix_all_product_schemas():
    content_root = 'content-site/products'
    www_base = "https://www.bestpackfactory.com"
    
    modified_count = 0

    for file in os.listdir(content_root):
        if not file.endswith('.html'): continue
        path = os.path.join(content_root, file)
        slug = file.replace('.html', '')
        product_name = slug.replace('-', ' ').title()

        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                html = f.read()
            
            original = html
            
            # 1. Physical URL replacement to www
            html = html.replace('https://bestpackfactory.com', www_base)

            # 2. Build the correct B2B Product Schema
            product_schema = {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": product_name,
                "brand": {"@type": "Brand", "name": "BestPackFactory"},
                "manufacturer": {"@type": "Organization", "name": "BestPackFactory"},
                "description": f"Custom {product_name} from BestPackFactory. B2B high-quality packaging solution with MOQ 500 PCS.",
                "image": f"{www_base}/assets/products/{slug}-01.jpg",
                "url": f"{www_base}/products/{file}",
                "offers": {
                    "@type": "Offer",
                    "price": "0.00",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock",
                    "url": f"{www_base}/products/{file}"
                }
            }
            schema_script = f'<script type="application/ld+json">{json.dumps(product_schema)}</script>'

            # 3. Inject into <head> (replacing any existing broken ones)
            if '<script type="application/ld+json">' in html:
                # Add before the existing one or replace
                html = html.replace('<head>', f'<head>\n{schema_script}')
            else:
                html = html.replace('</title>', f'</title>\n{schema_script}')

            if html != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(html)
                modified_count += 1
                print(f"Schema Fixed: {path}")

        except Exception as e:
            print(f"Error: {path} - {e}")

    print(f"Total product pages schema-hardened: {modified_count}")

if __name__ == "__main__":
    force_fix_all_product_schemas()
