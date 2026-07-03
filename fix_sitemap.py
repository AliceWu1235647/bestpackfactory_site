path = 'sitemap.xml'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

new_url = '  <url><loc>https://bestpackfactory.com/products/custom-pp-ring-binder-folders.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>'

if 'custom-pp-ring-binder-folders' not in c:
    c = c.replace('</urlset>', new_url + '\n</urlset>')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('SUCCESS: sitemap.xml updated')
else:
    print('Already in sitemap')
