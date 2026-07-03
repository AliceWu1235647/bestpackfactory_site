import os
import glob

# Performance tags to inject after <head> opening
perf_head = '''<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<link rel="dns-prefetch" href="//fonts.googleapis.com"/>
<link rel="dns-prefetch" href="//sc02.alicdn.com"/>
<link rel="preconnect" href="https://sc02.alicdn.com" crossorigin/>'''

# Process index.html specifically with preload for first slide
def optimize_index():
    path = 'index.html'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()

    # Add fetchpriority correctly and preload first slide WebP
    if 'fetchpriority="high"' not in c:
        c = c.replace(
            '<link href="css/style.css',
            '<link rel="preload" as="image" href="assets/hero/slide-01-one-stop-640.webp" fetchpriority="high"/>\n<link href="css/style.css'
        )

    # Ensure all non-critical JS uses defer
    c = c.replace('<script src="js/main.js">', '<script defer src="js/main.js">')
    c = c.replace('<script src="js/main.js"/>', '<script defer src="js/main.js"/>')

    # Add dns-prefetch if not already there
    if 'dns-prefetch' not in c:
        c = c.replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/>\n' + perf_head)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Optimized: ' + path)

# Process products.html
def optimize_products():
    path = 'products.html'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        c = f.read()

    if 'dns-prefetch' not in c:
        c = c.replace('<meta charset="utf-8"/>', '<meta charset="utf-8"/>\n' + perf_head)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Optimized: ' + path)

optimize_index()
optimize_products()
print('All done.')
