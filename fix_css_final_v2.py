import os

path = 'public/css/style.css'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Restore the Email button style properly
content = content.replace('border:1px solid #dfe5e1;', 'border:1.5px solid #00843D;')
content = content.replace('color:#111;', 'color:#00843D;')

# Fix the mobile clipping issue by removing overflow:hidden from the FINAL block
# and ensuring the buttons are fully visible.
# We also ensure the bottom spacing is correct.
content = content.replace('overflow: hidden !important;', '/* overflow: visible !important; */')

# Ensure the mobile buttons have correct margin/padding
# We add an override to ensure they are NOT hidden
mobile_override = """
@media(max-width:640px){
  .bpf-whatsapp-chat__body { display: block !important; padding: 12px !important; }
  .bpf-whatsapp-chat__btn { display: flex !important; visibility: visible !important; opacity: 1 !important; }
}
"""
if mobile_override not in content:
    content += mobile_override

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied final CSS fixes for mobile visibility and button styling.")
