import os

def mass_fix_html():
    root_dir = 'content-site'
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.html'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # 1. Fix mobile menu buttons emojis
                    content = content.replace('>WhatsApp Quote</a>', '>💬 WhatsApp Quote</a>')
                    content = content.replace('>Email Inquiry</a>', '>✉ Email Inquiry</a>')
                    
                    # 2. Fix floating box buttons (if missing emojis)
                    # For WhatsApp
                    if 'Chat on WhatsApp</a>' in content and '💬' not in content:
                         content = content.replace('Chat on WhatsApp</a>', '💬 Chat on WhatsApp</a>')
                    
                    # For Email
                    if 'Email Inquiry</a>' in content and '✉' not in content:
                        # This covers "?Email Inquiry" and plain "Email Inquiry"
                        import re
                        content = re.sub(r'(\?|✉|)?Email Inquiry</a>', '✉ Email Inquiry</a>', content)

                    # 3. Specifically fix the mobile menu toggle "?/button>" or "?"
                    content = content.replace('>?/button>', '>☰</button>')
                    # If it's just "?" inside the button
                    content = content.replace('class="mobile-menu-toggle" type="button">?</button>', 'class="mobile-menu-toggle" type="button">☰</button>')

                    if content != original_content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Fixed: {path}")
                except Exception as e:
                    print(f"Error processing {path}: {e}")

if __name__ == "__main__":
    mass_fix_html()
