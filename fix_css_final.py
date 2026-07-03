import os
import re

path = 'public/css/style.css'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Fix the checkmark specifically where it appears in bullets
    if '.bullets li::before' in line:
        line = re.sub(r'content:\"[^\"]+\"', 'content:\"✔\"', line)
    # Fix the checkmark in hero sections
    if '.hero-bullets-list li::before' in line:
        line = re.sub(r'content:\"[^\"]+\"', 'content:\"✔\"', line)
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Fixed checkmarks in style.css")
