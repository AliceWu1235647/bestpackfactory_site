path = 'products.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

new_card = '''<article class="product-card" data-search="custom pp ring binder folders 2-ring 3-ring 4-ring custom cover printing spine label insert pockets moq 500 pcs b2b stationery products/custom-pp-ring-binder-folders.html "><a href="products/custom-pp-ring-binder-folders.html"><picture><source sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 25vw" srcset="assets/products/custom-pp-ring-binder-folders-01-640.webp 640w, assets/products/custom-pp-ring-binder-folders-01.webp 1200w" type="image/webp"/><img alt="Custom PP Ring Binder Folders 2-ring 3-ring 4-ring manufacturer MOQ 500 PCS" decoding="async" loading="lazy" src="https://sc02.alicdn.com/kf/Hbd9d80e06b684eecacf08ece9d95bab2P.png"/></picture><div class="card-body"><span class="tag">NEW SEO PRODUCT</span><h3>Custom PP Ring Binder Folders</h3><p>MOQ 500 PCS. Factory direct quote with custom size, ring options, cover printing and finish.</p></div></a></article>'''

marker = '</div></section>'
if marker in c:
    c = c.replace(marker, new_card + '\n' + marker, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('SUCCESS: Ring Binder card added to products.html')
else:
    print('ERROR: Marker not found')
