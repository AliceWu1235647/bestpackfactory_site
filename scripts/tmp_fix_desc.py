import io

base = r'C:\Users\Administrator\Documents\www.bestpackfactory.com\bestpackfactory-site\content-site\fr\products'

fixes = {
    'custom-cosmetic-packaging-boxes.html': [
        ('Boîtes cosmétiques personnalisées dès 500 pièces : taille, matériau, impression et finition sur mesure. Échantillonnage, contrôle qualité et expédition mondiale.',
         'Boîtes cosmétiques personnalisées dès 500 pièces : taille, matériau, impression et finition à façon. Échantillonnage, contrôle qualité, expédition mondiale.'),
    ],
    'custom-flat-bottom-pouches.html': [
        ('Sachets à fond plat personnalisés dès 500 pièces : taille, matériau, impression et finition sur mesure. Échantillonnage, contrôle qualité et expédition B2B mondiale.',
         'Sachets à fond plat personnalisés dès 500 pièces : taille, matériau, impression et finition à façon. Échantillonnage, contrôle qualité, expédition mondiale.'),
    ],
    'custom-luxury-gift-boxes-manufacturer-premium-rigid-gift-packaging.html': [
        ('Boîtes cadeaux de luxe personnalisées dès 500 pièces : taille, matériau, impression et finition à façon. Échantillonnage, contrôle qualité et expédition mondiale.',
         'Boîtes cadeaux de luxe personnalisées dès 500 pièces : taille, matériau, impression et finition à façon. Échantillonnage, contrôle qualité, expédition mondiale.'),
    ],
    'custom-printed-tape.html': [
        ('Ruban adhésif imprimé personnalisé dès 500 pièces : taille, matériau, impression et finition sur mesure. Échantillonnage, contrôle qualité et expédition mondiale.',
         'Ruban adhésif imprimé sur mesure dès 500 pièces : taille, matériau, impression et finition à façon. Échantillonnage, contrôle qualité, expédition mondiale.'),
    ],
    'custom-retort-pouches-ready-meal-packaging.html': [
        ('Sachets autoclaves pour plats cuisinés dès 500 pièces : taille, matériau, impression et finition à façon. Échantillonnage, contrôle qualité, expédition mondiale.',
         'Sachets autoclaves pour plats cuisinés dès 500 pièces : taille, matériau, impression, finition à façon. Échantillonnage, contrôle qualité, expédition mondiale.'),
    ],
}

for fname, pairs in fixes.items():
    p = base + '\\' + fname
    s = io.open(p, encoding='utf-8').read()
    for old, new in pairs:
        cnt = s.count(old)
        if cnt == 0:
            print('NO MATCH in', fname, ':', old[:60])
        s = s.replace(old, new)
        print(fname, 'replaced', cnt)
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('DONE')
