import os

path = 'content-site/css/style.css'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# 1. 强制设置 Email 按钮样式
# 找到 .bpf-whatsapp-chat__btn--mail 块并替换其内部属性
import re
btn_mail_pattern = re.compile(r'\.bpf-whatsapp-chat__btn--mail\{([\s\S]*?)\}', re.MULTILINE)
new_style = """ {
  background:#fff;
  color:#00843D;
  border:1.5px solid #00843D;
}"""
content = btn_mail_pattern.sub('.bpf-whatsapp-chat__btn--mail' + new_style, content)

# 2. 强力禁止横向滚动 (解决聊天框偏位)
overflow_fix = """
html, body { 
  overflow-x: hidden !important; 
  width: 100% !important; 
  position: relative !important; 
  margin: 0 !important; 
  padding: 0 !important;
}
.mobile-nav-panel {
  max-width: 100vw !important;
}
"""
if overflow_fix not in content:
    content += overflow_fix

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 同步到 public
with open('public/css/style.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied final CSS fixes for Email button color and horizontal overflow.")
