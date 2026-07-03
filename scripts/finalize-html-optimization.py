import os
import re

def finalize_html():
    content_root = 'content-site'
    
    for root, dirs, files in os.walk(content_root):
        for file in files:
            if not file.endswith('.html'):
                continue
            
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                html = f.read()
            
            original = html
            
            # 1. H1 Semantic Fix (Keeping original CSS class for zero layout shift)
            if file == 'products.html':
                # Specifically targeting the main listing title
                html = html.replace('<h2>B2B Custom Packaging Products</h2>', '<h1>B2B Custom Packaging Products</h1>')
            
            # Product details
            if 'products/' in root.replace('\\', '/'):
                # Upgrade first heading to H1, keep all attributes/classes
                html = re.sub(r'<h2(.*?)>(.*?)</h2>', r'<h1\1>\2</h1>', html, count=1)

            # 2. Speed Optimization: Image Attributes (CLS Prevention)
            # Default product card: width 1200, height 960 (1.25:1 ratio)
            img_pattern = re.compile(r'<img (?!.*?width=)(.*?)src="([^"]+)"')
            def add_dims(match):
                attrs = match.group(1)
                src = match.group(2)
                # Logo standard
                if 'logo' in src:
                    return f'<img {attrs}src="{src}" width="270" height="60"'
                # Standard product card
                if 'assets/products/' in src:
                    return f'<img {attrs}src="{src}" width="1200" height="960"'
                # Default generic
                return f'<img {attrs}src="{src}" width="1200" height="600"'
            
            html = img_pattern.sub(add_dims, html)

            # 3. Technical SEO: Clean Title
            html = re.sub(r'<title>(.*?) \| BestPackFactory \| BestPackFactory</title>', r'<title>\1 | BestPackFactory</title>', html)
            # Entity cleanup
            html = html.replace('&amp;amp;', '&').replace('&amp;', '&')

            # 4. Canonical normalization in static HTML (Secondary defense)
            html = html.replace('https://bestpackfactory.com', 'https://www.bestpackfactory.com')

            if html != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"Finalized: {path}")

if __name__ == "__main__":
    finalize_html()
