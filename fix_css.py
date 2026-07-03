import os

def fix_css():
    path = 'public/css/style.css'
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        return
    
    try:
        # Read as binary to handle any encoding issues
        with open(path, 'rb') as f:
            raw_content = f.read()
        
        # Try decoding as utf-8, ignoring errors to clean up corrupted sequences
        content = raw_content.decode('utf-8', 'ignore')
        
        import re
        content = re.sub(r'content:\"[^\"]+;background', r'content:\"✔\";background', content)
        
        # Write back as clean UTF-8
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("Successfully fixed style.css")
    except Exception as e:
        print(f"Error fixing CSS: {e}")

if __name__ == "__main__":
    fix_css()
