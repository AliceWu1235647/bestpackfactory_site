path = 'index.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

# Fix broken preload tag: as_ -> as, .jpg -> .webp
old = 'as_="image" fetchpriority="high" href="assets/hero/slide-01-one-stop.jpg" rel="preload"'
new = 'as="image" fetchpriority="high" href="assets/hero/slide-01-one-stop.webp" rel="preload"'

if old in c:
    c = c.replace(old, new)
    print('SUCCESS: Fixed preload tag')
else:
    print('Tag not found, searching...')
    # Try to find the actual tag
    idx = c.find('fetchpriority')
    if idx > 0:
        print('Found at:', repr(c[idx-50:idx+100]))

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
