import os
import shutil

def physical_bypass_deploy():
    # 1. Create public/products directory
    os.makedirs('public/products', exist_ok=True)
    os.makedirs('public/assets/products', exist_ok=True)
    
    # 2. Copy the files to PUBLIC folder (Highest priority in Vercel)
    src_html = 'content-site/products/medical-aesthetic-packaging-boxes.html'
    dst_html = 'public/products/medical-aesthetic-packaging-boxes.html'
    
    src_img = 'content-site/assets/products/medical-aesthetic-packaging-boxes-01.webp'
    dst_img = 'public/assets/products/medical-aesthetic-packaging-boxes-01.webp'
    
    if os.path.exists(src_html):
        shutil.copy(src_html, dst_html)
        print(f"Bypassed: {dst_html}")
        
    if os.path.exists(src_img):
        shutil.copy(src_img, dst_img)
        print(f"Bypassed: {dst_img}")

    # 3. Create .npmrc to fix Vercel install errors
    with open('.npmrc', 'w') as f:
        f.write('legacy-peer-deps=true\n')
    print("Fixed .npmrc")

if __name__ == "__main__":
    physical_bypass_deploy()
