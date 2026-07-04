import os
import re

def emergency_revert_and_data_publish():
    # 1. Clean up products.html from any previous failed manual injections
    path = 'content-site/products.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove any manual card with medical-aesthetic slug
    cleaned = re.sub(r'<article class="product-card">.*?medical-aesthetic-packaging-boxes.*?</article>', '', content, flags=re.DOTALL)
    
    # Ensure grid container is valid
    if '</div>\n</section>' not in cleaned:
        # Emergency reconstruction of closing tags if they were damaged
        cleaned = cleaned.rstrip() + '</div>\n</section>\n<footer class="footer">...' # simplified logic
    
    # Save the clean HTML
    with open(path, 'w', encoding='utf-8') as f:
        f.write(cleaned)
    
    # 2. Re-create the JSON key that Next.js uses for the dynamic grid
    json_path = 'content-site/products/medical-aesthetic-packaging-boxes.json'
    data = {
      "title": "Custom Medical Aesthetic Packaging Boxes | GS1 Compliant Pharma Kits",
      "name": "Custom Medical Aesthetic Packaging Boxes",
      "slug": "medical-aesthetic-packaging-boxes",
      "category": "Pharma & Medical Packaging",
      "desc": "High-end magnetic rigid boxes for medical aesthetic serums, boosters, and HA rejuvenation kits.",
      "image": "assets/products/medical-aesthetic-packaging-boxes-01.webp",
      "url": "products/medical-aesthetic-packaging-boxes.html"
    }
    import json
    with open(json_path, 'w', encoding='utf-8') as f:
        f.write(json.dumps(data, indent=2))

if __name__ == "__main__":
    emergency_revert_and_data_publish()
