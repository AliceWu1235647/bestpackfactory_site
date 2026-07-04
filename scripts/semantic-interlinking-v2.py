import os
import re

def build_keyword_map():
    product_dir = 'content-site/products'
    keyword_map = {}
    if not os.path.exists(product_dir): return {}
    for file in os.listdir(product_dir):
        if file.endswith('.html'):
            slug = file.replace('.html', '')
            keyword = slug.replace('-', ' ')
            url = f"/products/{file}"
            keyword_map[keyword.lower()] = url
    return keyword_map

def apply_interlinking():
    keyword_map = build_keyword_map()
    if not keyword_map: return
    sorted_keywords = sorted(keyword_map.keys(), key=len, reverse=True)
    
    target_dirs = ['content-site/blog', 'content-site/news']
    for target_dir in target_dirs:
        if not os.path.exists(target_dir): continue
        for file in os.listdir(target_dir):
            if not file.endswith('.html'): continue
            path = os.path.join(target_dir, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            original = content
            linked_count = 0
            
            # Simple strategy: find text nodes outside <a> tags
            # We split by <a> tags to avoid nested links
            parts = re.split(r'(<a.*?>.*?</a>)', content, flags=re.IGNORECASE | re.DOTALL)
            
            for i in range(len(parts)):
                if not parts[i].lower().startswith('<a'):
                    # Search and replace keywords in non-link text
                    for kw in sorted_keywords:
                        pattern = re.compile(rf'\b({re.escape(kw)})\b', re.IGNORECASE)
                        new_part, count = pattern.subn(rf'<a href="{keyword_map[kw]}">\1</a>', parts[i], count=1)
                        if count > 0:
                            parts[i] = new_part
                            linked_count += 1
                            break # Move to next part or limit per block

            content = "".join(parts)
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Applied {linked_count} semantic links to: {path}")

if __name__ == "__main__":
    apply_interlinking()
