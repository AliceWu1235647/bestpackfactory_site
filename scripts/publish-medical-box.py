import os
import re

def publish_new_product():
    # Product Metadata
    slug = "medical-aesthetic-packaging-boxes"
    title = "Custom Medical Aesthetic Packaging Boxes | GS1 Compliant Pharma Kits"
    desc = "High-end magnetic rigid boxes for medical aesthetic serums and HA rejuvenation kits. GS1 compliant, tamper-evident, and medical-grade materials. MOQ 500 PCS."
    image_url = "assets/products/medical-aesthetic-packaging-boxes-01.webp"
    
    # 1. Create Product Detail Page
    detail_path = f"content-site/products/{slug}.html"
    detail_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width,initial-scale=1" name="viewport"/>
<title>{title} | BestPackFactory</title>
<meta content="{desc}" name="description"/>
<link href="https://www.bestpackfactory.com/products/{slug}.html" rel="canonical"/>
<link href="../css/style.css?v=RESTORE_233221_FINAL" rel="stylesheet"/>
</head>
<body>
<header class="header">
<div class="header-inner">
<a class="logo" href="../index.html"><img alt="BestPackFactory" src="../assets/logo/bestpackfactory-logo.svg?v=1.2" width="270" height="60"/></a>
<nav class="nav"><a href="../index.html">Home</a><a href="../products.html">Products</a><a href="../about.html">About</a><a href="../contact.html">Contact</a></nav>
</div>
</header>
<main>
<section class="section">
<div class="product-detail">
<div class="gallery single-gallery"><img alt="{title} factory direct B2B custom packaging" src="../{image_url}" width="1200" height="960"/></div>
<div>
<div class="eyebrow">PHARMA-GRADE · MOQ 500 PCS</div>
<h1>{title}</h1>
<p>Professional packaging solutions designed for Medical Aesthetic brands. Our rigid kit boxes ensure product integrity and regulatory compliance for high-value serums, injectables, and boosters.</p>
<table class="specs">
<tr><td>Compliance</td><td>GS1 DataMatrix & Traceability Ready</td></tr>
<tr><td>Box Type</td><td>Magnetic Rigid Box / Folding Carton</td></tr>
<tr><td>Material</td><td>FSC-certified Board / Anti-counterfeit Paper</td></tr>
<tr><td>Security</td><td>Tamper-Evident Seals & Serialized Coding</td></tr>
<tr><td>Customization</td><td>Custom EVA/Foam Inserts, Spot UV, Foil</td></tr>
</table>
<div style="margin-top:24px;">
<a class="btn" href="../contact.html">Request Factory Quote</a>
<a class="btn light" href="https://wa.me/8615886530985">WhatsApp Expert</a>
</div>
</div>
</div>
</section>
</main>
<div class="bpf-whatsapp-chat">
<div class="bpf-whatsapp-chat__head">Medical Packaging RFQ</div>
<div class="bpf-whatsapp-chat__body"><strong>MOQ 500 PCS · Fast Quote</strong><p>WhatsApp for GS1 compliant solutions.</p><a class="bpf-whatsapp-chat__btn bpf-whatsapp-chat__btn--wa" href="https://wa.me/8615886530985">💬 Chat on WhatsApp</a></div>
</div>
<script defer="" src="../js/main.js"></script>
</body></html>"""
    
    with open(detail_path, 'w', encoding='utf-8') as f:
        f.write(detail_html)

    # 2. Add to Products Listing Page (Keeping 4-column grid)
    list_path = "content-site/products.html"
    with open(list_path, 'r', encoding='utf-8') as f:
        list_content = f.read()
    
    new_card = f"""<article class="product-card">
<a href="products/{slug}.html">
<picture><img alt="{title} factory direct B2B custom packaging with matte finish" loading="lazy" src="{image_url}" width="1200" height="960"/></picture>
<div class="card-body">
<span class="tag">GS1 & PHARMA GRADE</span>
<h3>{title}</h3>
<p>MOQ 500 PCS. Medical grade materials with custom traceability printing.</p>
</div>
</a>
</article>"""
    
    # Insert before the last </div> that closes the grid
    updated_list = list_content.replace('</div>\n</section>', f'{new_card}\n</div>\n</section>')
    
    with open(list_path, 'w', encoding='utf-8') as f:
        f.write(updated_list)

if __name__ == "__main__":
    publish_new_product()
