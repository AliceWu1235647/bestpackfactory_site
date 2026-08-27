import os, re, glob

base = r'C:\Users\Administrator\Documents\www.bestpackfactory.com\bestpackfactory-site\content-site\fr'
files = sorted(glob.glob(base + r'\**\*.html', recursive=True))
print('TOTAL FILES:', len(files))
problems = []
for f in files:
    rel = os.path.relpath(f, base)
    raw = open(f, 'rb').read()
    bom = raw[:3] == b'\xef\xbb\xbf'
    s = raw.decode('utf-8')
    lang_ok = 'html lang="fr"' in s
    m = re.search(r'<link[^>]*rel="canonical"[^>]*>', s)
    canon_ok = False
    if m:
        canon_url = re.search(r'href="([^"]+)"', m.group(0)).group(1)
        canon_ok = canon_url.startswith('https://www.bestpackfactory.com/') and all(x not in canon_url for x in ['/fr/', '/de/', '/es/', '/ja/', '/ar/'])
    hreflangs = re.findall(r'hreflang="([^"]+)"', s)
    hf_ok = sorted(set(hreflangs)) == ['ar', 'de', 'en', 'es', 'fr', 'ja', 'x-default']
    t = re.search(r'<title>(.*?)</title>', s, re.S)
    title_len = len(t.group(1)) if t else -1
    d = re.search(r'<meta[^>]*name="description"[^>]*>', s)
    desc_len = -1
    if d:
        desc_len = len(re.search(r'content="([^"]*)"', d.group(0)).group(1))
    ends = s.rstrip().endswith('</html>')
    status = 'OK' if (lang_ok and canon_ok and hf_ok and not bom and title_len <= 60 and 150 <= desc_len <= 160 and ends) else 'CHECK'
    print(f'{status} | {rel} | lang={lang_ok} canon={canon_ok} hf={len(hreflangs)} bom={bom} title={title_len} desc={desc_len} end={ends}')
    if status == 'CHECK':
        problems.append((rel, lang_ok, canon_ok, hf_ok, bom, title_len, desc_len, ends))
print('PROBLEM FILES:', len(problems))
