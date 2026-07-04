import json
import os

path = 'r2-seed/products/index.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_product = {
    "slug": "medical-aesthetic-packaging-boxes",
    "title": "Custom Medical Aesthetic Packaging Boxes | GS1 Compliant Pharma Kits | BestPackFactory",
    "description": "High-end magnetic rigid boxes for medical aesthetic serums and HA rejuvenation kits. GS1 compliant, tamper-evident, and medical-grade materials. MOQ 500 PCS.",
    "url": "/products/medical-aesthetic-packaging-boxes.html",
    "json": "/products/medical-aesthetic-packaging-boxes.json"
}

# Check if already exists
exists = any(p['slug'] == new_product['slug'] for p in data['products'])
if not exists:
    data['products'].append(new_product)
    # Sort alphabetically
    data['products'].sort(key=lambda x: x['slug'])
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("Added to r2-seed index.")
else:
    print("Already in r2-seed index.")
