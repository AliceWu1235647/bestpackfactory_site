import os
import re

def build_keyword_map():
    product_dir = 'content-site/products'
    keyword_map = {}
    for file in os.listdir(product_dir):
        if file.endswith('.html'):
            slug = file.replace('.html', '')
            # Generate common keyword variants from slug
            keyword = slug.replace('-', ' ')
            url = f"/products/{file}"
            keyword_map[keyword] = url
            # Add plural and short versions
            if keyword.endswith('y'): keyword_map[keyword[:-1] + 'ies'] = url
            else: keyword_map[keyword + 's'] = url
    return keyword_map

def apply_interlinking():
    keyword_map = build_keyword_map()
    # Sort keys by length (longest first) to match full phrases before partial ones
    sorted_keywords = sorted(keyword_map.keys(), key=len, reverse=True)
    
    target_dirs = ['content-site/blog', 'content-site/news']
    for target_dir in target_dirs:
        for file in os.listdir(target_dir):
            if not file.endswith('.html'): continue
            path = os.path.join(target_dir, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            original = content
            linked_keywords = set()
            
            for kw in sorted_keywords:
                if kw.lower() in content.lower() and kw not in linked_keywords:
                    # Regex explanation:
                    # (?<!<a[^>]*>) - Not preceded by an open <a> tag
                    # \b - Word boundary
                    # (?!</a>) - Not followed by a close </a> tag
                    pattern = re.compile(rf'(?<!<a[^>]*>)\b({re.escape(kw)})\b(?!</a>)', re.IGNORECASE)
                    new_content, count = pattern.subn(rf'<a href="{keyword_map[kw]}">\1</a>', content, count=1)
                    if count > 0:
                        content = new_content
                        linked_keywords.add(kw)
            
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Applied semantic links to: {path}")

if __name__ == "__main__":
    apply_interlinking()
