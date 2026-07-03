import os
import glob
import re

# Pages to PROTECT - never touch these
PROTECTED_FILES = ['index.html', 'products.html', 'about.html', 'contact.html', 'blog.html']
PROTECTED_DIRS = ['products', 'assets', 'css', 'js']

faq_template = """
<section class="faq-section" style="padding: 40px 20px; background: #fff; margin-top: 40px; border-top: 1px solid #eee;">
    <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 24px; color: #007A3F; margin-bottom: 20px;">Frequently Asked Questions — {keyword}</h2>
        <div style="margin-bottom: 20px;">
            <strong style="display: block; font-size: 18px; margin-bottom: 8px;">What is the MOQ for {keyword}?</strong>
            <p style="color: #666; line-height: 1.6;">Our standard minimum order quantity (MOQ) for custom projects is 500 PCS. We support small brands with factory-direct pricing even at low volumes.</p>
        </div>
        <div style="margin-bottom: 20px;">
            <strong style="display: block; font-size: 18px; margin-bottom: 8px;">Do you provide free dielines for {keyword}?</strong>
            <p style="color: #666; line-height: 1.6;">Yes! Once you provide your required dimensions, our engineering team will send you a free dieline template within 24 hours to help with your artwork design.</p>
        </div>
        <div style="margin-bottom: 20px;">
            <strong style="display: block; font-size: 18px; margin-bottom: 8px;">How long is the production time for custom projects?</strong>
            <p style="color: #666; line-height: 1.6;">Sample production typically takes 7-10 days. Bulk production is usually completed within 20-30 days after the final sample approval.</p>
        </div>
    </div>
</section>
"""

html_files = glob.glob("**/*.html", recursive=True)

processed_count = 0
for file_path in html_files:
    file_name = os.path.basename(file_path)
    
    # Check protection
    is_protected = False
    if file_name in PROTECTED_FILES: is_protected = True
    for p_dir in PROTECTED_DIRS:
        if file_path.startswith(p_dir + os.sep) or file_path.startswith(p_dir + '/'):
            is_protected = True
            break
    
    if is_protected:
        print(f"Skipping protected file: {file_path}")
        continue

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        if 'faq-section' in content:
            print(f"Already optimized: {file_path}")
            continue

        # Extract keyword from title
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
        keyword = title_match.group(1) if title_match else "Custom Packaging"
        
        # Build the FAQ block
        injected_faq = faq_template.format(keyword=keyword)
        
        # Inject before </body>
        if '</body>' in content:
            new_content = content.replace('</body>', injected_faq + '\n</body>')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            processed_count += 1
            print(f"SEO Optimized (FAQ Injected): {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print(f"\nTotal SEO pages denoised: {processed_count}")
