import os
import re

def optimize_lcp():
    content_root = 'content-site'
    
    for root, dirs, files in os.walk(content_root):
        for file in files:
            if not file.endswith('.html'):
                continue
            
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                html = f.read()
            
            original = html
            
            # 1. Product Detail Main Image Optimization (LCP)
            # Find the main product image in single-gallery
            main_img_re = re.compile(r'<div class="gallery single-gallery">.*?<img (.*?)src="([^"]+)"(.*?)>', re.DOTALL)
            
            def upgrade_to_picture(match):
                attrs = match.group(1).strip()
                src = match.group(2)
                suffix = match.group(3).strip()
                
                # Logic: if src is .jpg, check for .webp version
                webp_src = src.replace('.jpg', '.webp').replace('.png', '.webp')
                
                return f"""<div class="gallery single-gallery">
<picture>
  <source srcset="{webp_src}" type="image/webp">
  <img {attrs} src="{src}" {suffix} loading="eager" fetchpriority="high">
</picture>"""

            html = main_img_re.sub(upgrade_to_picture, html)
            
            # 2. Homepage Hero First Image Optimization
            if file == 'index.html':
                # Ensure the first visible slide image has high priority
                html = html.replace('class="hero-layered-image" fetchpriority="high"', 'class="hero-layered-image" loading="eager" fetchpriority="high"')

            if html != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"LCP Optimized: {path}")

if __name__ == "__main__":
    optimize_lcp()
