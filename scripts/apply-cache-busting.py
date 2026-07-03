import os

def apply_cache_busting():
    # 1. 物理 HTML 文件处理
    root_dirs = ['content-site', 'app']
    for base in root_dirs:
        for root, dirs, files in os.walk(base):
            for file in files:
                if file.endswith(('.html', '.js')):
                    path = os.path.join(root, file)
                    try:
                        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        
                        # 将 href="css/style.css" 或 "/css/style.css" 替换为带版本的
                        new_content = content.replace('css/style.css', 'css/style.css?v=RESTORE_233221_FINAL')
                        new_content = new_content.replace('?v=20.0_ULTRA_SYNC', '?v=RESTORE_233221_FINAL')
                        
                        if new_content != content:
                            with open(path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"Busted cache in: {path}")
                    except:
                        pass

    # 2. 检查 lib/static-pages.js 的渲染逻辑是否会覆盖
    # (之前的 lib/static-pages.js 已经比较完善，我们主要确保渲染时不会丢失参数)

if __name__ == "__main__":
    apply_cache_busting()
