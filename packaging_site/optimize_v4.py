import os
import re

def optimize_homepage(root_dir):
    file_path = os.path.join(root_dir, 'index.html')
    if not os.path.exists(file_path): return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Correct Canonical URL to WWW version
    content = content.replace('<link rel="canonical" href="https://packagingfactorydirect.com/">', '<link rel="canonical" href="https://www.packagingfactorydirect.com/">')
    
    # 2. Consolidate H1 (Ensure only one descriptive H1)
    # The first slide currently has an H1, let's keep it but make it more descriptive and ensure others are H2
    content = content.replace('<h1>Infinite Packaging<br>Customization</h1>', '<h1>Custom Packaging Manufacturer for Boxes, Bags & Pouches</h1>')
    content = content.replace('<h1>Elegant Rigid<br>Gift Collections</h1>', '<h2>Elegant Rigid Gift Collections</h2>')
    content = content.replace('<h1>Colorful Flexible<br>Stand-Up Pouches</h1>', '<h2>Colorful Flexible Stand-Up Pouches</h2>')
    content = content.replace('<h1>Designer Printed<br>Mailer Boxes</h1>', '<h2>Designer Printed Mailer Boxes</h2>')
    content = content.replace('<h1>Vibrant Bakery &<br>Cafe Packaging</h1>', '<h2>Vibrant Bakery & Cafe Packaging</h2>')

    # 3. Add Lead Magnet (PDF Catalog) Entry
    lead_magnet_html = """
    <div style="background:var(--ink); color:#fff; padding:40px; border-radius:30px; margin:60px 0; display:flex; align-items:center; gap:40px;">
      <div style="flex:1;">
        <h2 style="color:var(--gold); margin-bottom:15px;">2026 Packaging Tech Catalog</h2>
        <p>Get our latest 120-page guide on GS1 Serialization, Sustainable Materials, and Luxury Box structures. Download the digital catalog for your next project.</p>
      </div>
      <a class="btn gold" href="/contact.html" style="min-width:200px; text-align:center;">Download PDF (15MB)</a>
    </div>
    """
    
    if '2026 Packaging Tech Catalog' not in content:
        # Insert before the Why Choose Us section
        insertion_point = content.find('<section class="section soft">')
        if insertion_point != -1:
            content = content[:insertion_point] + lead_magnet_html + content[insertion_point:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Homepage SEO and Lead Magnet optimized.")

root_dir = 'C:/Users/Administrator/.accio/accounts/7072681770/agents/DID-D464A3-75D464A3U1779822-4477-D4AFAE/project/packaging_site'
optimize_homepage(root_dir)
