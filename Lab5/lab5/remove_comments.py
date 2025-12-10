import re
import os

total_lines = 0
files_processed = []

base_path = '.'
extensions = ['.py', '.css', '.js', '.html']
exclude_dirs = ['__pycache__', 'migrations', 'venv', '.git', 'node_modules', 'static']

def remove_comments_py(content):
    lines = content.split('\n')
    result = []
    in_multiline = False
    multiline_char = ''
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('"""') or stripped.startswith("'''"):
            if in_multiline and stripped.endswith(multiline_char) and len(stripped) >= 3:
                in_multiline = False
                continue
            elif not in_multiline:
                in_multiline = True
                multiline_char = stripped[:3]
                continue
        if in_multiline:
            continue
        if '#' in line:
            line = line[:line.index('#')].rstrip()
        if line:
            result.append(line)
        else:
            result.append('')
    return '\n'.join(result)

def remove_comments_css(content):
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return content

def remove_comments_js(content):
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return content

def remove_comments_html(content):
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    return content

def process_file(filepath):
    global total_lines
    ext = os.path.splitext(filepath)[1]
    if ext not in extensions:
        return
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if ext == '.py':
            content = remove_comments_py(content)
        elif ext == '.css':
            content = remove_comments_css(content)
        elif ext == '.js':
            content = remove_comments_js(content)
        elif ext == '.html':
            content = remove_comments_html(content)
        lines = [l for l in content.split('\n') if l.strip()]
        total_lines += len(lines)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        files_processed.append(filepath)
    except Exception as e:
        pass

for root, dirs, files in os.walk(base_path):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        filepath = os.path.join(root, file)
        process_file(filepath)

print(f'Total lines of code: {total_lines}')

