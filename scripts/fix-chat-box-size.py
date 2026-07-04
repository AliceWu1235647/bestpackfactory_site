import os

path = 'content-site/css/style.css'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix the oversized chat box by pinning it to the right corner only
oversized_fix = """
/* FINAL FIX FOR CHAT BOX SIZE AND POSITION */
.bpf-whatsapp-chat {
  position: fixed !important;
  right: 20px !important;
  left: auto !important;
  bottom: 20px !important;
  width: 360px !important;
  max-width: 90vw !important;
  z-index: 99999 !important;
  transform: none !important;
}
@media (max-width: 768px) {
  .bpf-whatsapp-chat {
    right: 10px !important;
    bottom: 10px !important;
    width: calc(100% - 20px) !important;
  }
}
"""

# Append to the end to ensure it overrides everything
content += oversized_fix

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Sync to public
with open('public/css/style.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied final CSS fix for oversized chat box.")
