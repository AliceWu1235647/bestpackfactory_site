path = 'products.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

cdn = {
    311: '<img alt="Custom Spout Pouches" loading="lazy" src="https://sc02.alicdn.com/kf/H78bad36b45c34ee0a62ffa69d234cb27C.png"/>\n',
    321: '<img alt="Custom Compostable Stand Up Pouches" loading="lazy" src="https://sc02.alicdn.com/kf/H5d3fc2f4c2464a61b46521c37cfd01bbB.png"/>\n',
    331: '<img alt="Custom Retort Pouches" loading="lazy" src="https://sc02.alicdn.com/kf/Hc4a7bc2525aa4ffcbbbfdfd11b0c560be.png"/>\n',
    341: '<img alt="Custom Roll Stock Film" loading="lazy" src="https://sc02.alicdn.com/kf/H9de6ba89a70e433586e49df6865fecc7z.png"/>\n',
    351: '<img alt="Custom Shrink Sleeve Labels" loading="lazy" src="https://sc02.alicdn.com/kf/H2d234bedbdec4fc5b8e5a5693fe9d853y.png"/>\n',
}

for line_num, new_line in cdn.items():
    lines[line_num - 1] = new_line
    print('Fixed line ' + str(line_num))

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('SUCCESS')
