import os
import shutil

def sync_all_public():
    roots = ['./', 'pfd-site/']
    src_html = 'content-site/products/medical-aesthetic-packaging-boxes.html'
    src_img = 'content-site/assets/products/medical-aesthetic-packaging-boxes-01.webp'
    
    for r in roots:
        html_dest_dir = os.path.join(r, 'public/products')
        img_dest_dir = os.path.join(r, 'public/assets/products')
        
        os.makedirs(html_dest_dir, exist_ok=True)
        os.makedirs(img_dest_dir, exist_ok=True)
        
        shutil.copy(src_html, os.path.join(html_dest_dir, 'medical-aesthetic-packaging-boxes.html'))
        shutil.copy(src_img, os.path.join(img_dest_dir, 'medical-aesthetic-packaging-boxes-01.webp'))
        print(f"Synced to {r}public")

if __name__ == "__main__":
    sync_all_public()
