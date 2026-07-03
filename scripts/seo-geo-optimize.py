import os
import re

def optimize_html():
    content_root = 'content-site'
    
    # regex for products.html visual title
    # <h2>B2B Custom Packaging Products</h2>
    products_h1_re = re.compile(r'<h2>B2B Custom Packaging Products</h2>', re.IGNORECASE)
    
    # regex for product detail pages (assuming ISR pages look like this)
    # <h2>Custom PP Ring Binder Folders</h2>
    detail_h1_re = re.compile(r'<div class="section-head">.*?<h2>(.*?)</h2>', re.DOTALL | re.IGNORECASE)

    for root, dirs, files in os.walk(content_root):
        for file in files:
            if not file.endswith('.html'):
                continue
            
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                html = f.read()
            
            original = html
            
            # 1. H1 Semantic Fix
            if file == 'products.html':
                html = html.replace('<h2>B2B Custom Packaging Products</h2>', '<h1>B2B Custom Packaging Products</h1>')
            
            # For detail pages under products/
            if 'products/' in root.replace('\\', '/'):
                # Try to find the first H2 in section-head or content area and make it H1
                # Usually product pages have a clear main title
                html = re.sub(r'<h2>(.*?)</h2>', r'<h1>\1</h1>', html, count=1)

            # 2. Speed Optimization: Add width/height to images to prevent CLS
            # We assume standard sizes based on layout
            # Product card images: 1200x960 (ratio 1.25:1)
            # This is a safe baseline for the cards
            html = re.sub(r'<img (.*?)src="assets/products/(.*?)\.(webp|jpg|png)"', 
                          r'<img \1src="assets/products/\2.\3" width="1200" height="960"', html)
            
            # Logo fix
            html = html.replace('bestpackfactory-logo.svg"', 'bestpackfactory-logo.svg" width="270" height="60"')
            
            # 3. TECHNICAL SEO: Title Template Cleanup
            # Remove duplicated brand name
            html = re.sub(r'<title>(.*?) \| BestPackFactory \| BestPackFactory</title>', r'<title>\1 | BestPackFactory</title>', html)
            # Fix HTML entities
            html = html.replace('&amp;amp;', '&').replace('&amp;', '&')

            if html != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"Optimized: {path}")

if __name__ == "__main__":
    optimize_html()
