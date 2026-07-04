import os
import re

def perform_robust_beautification():
    # Target variations of the contact line
    patterns = [
        r"Lisa Wu\s*·\s*lisa@colorprintingpackage\.com\s*·\s*WhatsApp \+86 158 8653 0985",
        r"Lisa Wu\s*(&nbsp;)+\s*lisa@colorprintingpackage\.com\s*(&nbsp;)+\s*WhatsApp \+86 158 8653 0985"
    ]
    
    # Beautiful Flexbox version
    new_html = '<div class="contact-line-beautified"><span>Lisa Wu</span><span>lisa@colorprintingpackage.com</span><span>WhatsApp +86 158 8653 0985</span></div>'
    
    # For JS files, we use a simpler string with large spaces but normalized
    new_js = 'Lisa Wu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lisa@colorprintingpackage.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; WhatsApp +86 158 8653 0985'

    target_dirs = ['lib', 'content-site', 'r2-seed']
    modified_count = 0

    for base_dir in target_dirs:
        if not os.path.exists(base_dir): continue
        for root, dirs, files in os.walk(base_dir):
            for file in files:
                if file.endswith(('.js', '.html', '.json')):
                    path = os.path.join(root, file)
                    try:
                        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        
                        original = content
                        for p in patterns:
                            replacement = new_js if file.endswith('.js') else new_html
                            content = re.sub(p, replacement, content, flags=re.IGNORECASE)
                        
                        if content != original:
                            with open(path, 'w', encoding='utf-8') as f:
                                f.write(content)
                            modified_count += 1
                            print(f"Robustly Modified: {path}")
                    except Exception as e:
                        print(f"Error: {path} - {e}")

    print(f"Total files robustly updated: {modified_count}")

if __name__ == "__main__":
    perform_robust_beautification()
