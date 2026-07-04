import os

def cleanup_and_fix_products():
    path = 'content-site/products.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the duplicated medical product entries and fix nesting
    # We will find the grid container and rebuild its tail
    grid_start_marker = '<div class="grid products-grid-fixed">'
    grid_end_marker = '</div>\n</section>'
    
    parts = content.split(grid_start_marker)
    if len(parts) < 2: return
    
    main_body = parts[1].split(grid_end_marker)[0]
    
    # Clean up the duplicated entry if it exists
    duplicate_pattern = '<article class="product-card">\n<a href="products/medical-aesthetic-packaging-boxes.html">'
    # We strip all instances first to re-add once at the end
    cleaned_body = re.sub(r'<article class="product-card">\s*<a href="products/medical-aesthetic-packaging-boxes.html">.*?/article>', '', main_body, flags=re.DOTALL)
    
    # Re-add the clean single entry for Medical Boxes
    new_entry = """<article class="product-card" data-search="medical aesthetic packaging boxes pharma clinical kits gs1 products/medical-aesthetic-packaging-boxes.html">
<a href="products/medical-aesthetic-packaging-boxes.html">
<picture><img alt="Custom Medical Aesthetic Packaging Boxes | GS1 Compliant Pharma Kits factory direct B2B custom packaging with matte finish" loading="lazy" src="assets/products/medical-aesthetic-packaging-boxes-01.webp" width="1200" height="960"/></picture>
<div class="card-body">
<span class="tag">GS1 & PHARMA GRADE</span>
<h3>Medical Aesthetic Packaging Boxes</h3>
<p>MOQ 500 PCS. Medical grade materials with custom traceability printing.</p>
</div>
</a>
</article>"""
    
    final_body = cleaned_body.strip() + "\n" + new_entry
    
    # Reconstruct the page
    new_content = parts[0] + grid_start_marker + "\n" + final_body + "\n" + grid_end_marker + parts[1].split(grid_end_marker)[1]
    
    # 2. Fix the corrupted </picture></picture> in the whole file
    new_content = new_content.replace('</picture></picture>', '</picture>')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed products.html grid and duplicates.")

import re
if __name__ == "__main__":
    cleanup_and_fix_products()
