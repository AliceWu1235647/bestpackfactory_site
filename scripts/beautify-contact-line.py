import os
import re

def perform_beautification():
    # Target string to find
    old_str = "Lisa Wu · lisa@colorprintingpackage.com · WhatsApp +86 158 8653 0985"
    # New string with large spaces (HTML entities for consistent rendering)
    new_str = "Lisa Wu &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lisa@colorprintingpackage.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; WhatsApp +86 158 8653 0985"

    # Search in key directories
    target_dirs = ['lib', 'content-site', 'r2-seed', 'app']
    
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
                        
                        if old_str in content:
                            # Use regex to replace to handle any slight variations in spacing
                            new_content = content.replace(old_str, new_str)
                            
                            with open(path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            modified_count += 1
                            print(f"Modified: {path}")
                    except Exception as e:
                        print(f"Error processing {path}: {e}")

    print(f"Total files updated: {modified_count}")

if __name__ == "__main__":
    perform_beautification()
