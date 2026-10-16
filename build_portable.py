def build_portable():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('vendor/pdf-lib.min.js', 'r', encoding='utf-8') as f:
        pdf_lib_js = f.read()

    with open('vendor/jszip.min.js', 'r', encoding='utf-8') as f:
        jszip_js = f.read()

    with open('app.js', 'r', encoding='utf-8') as f:
        app_js = f.read()

    # Replace css link
    target_css_tag = '<link rel="stylesheet" href="styles.css">'
    html = html.replace(target_css_tag, f'<style>\n{css}\n</style>')

    # Replace script tags
    target_scripts = '<script src="vendor/pdf-lib.min.js"></script>\n  <script src="vendor/jszip.min.js"></script>\n\n  <!-- App Script -->\n  <script src="app.js"></script>'
    
    inlined_scripts = f'<script>\n{pdf_lib_js}\n</script>\n<script>\n{jszip_js}\n</script>\n<script>\n{app_js}\n</script>'
    
    if target_scripts in html:
        html = html.replace(target_scripts, inlined_scripts)
    else:
        # Fallback replacement if whitespace differs
        parts = html.split('<!-- Vendor Scripts')
        head_part = parts[0]
        end_part = parts[1].split('</body>')[1]
        html = head_part + inlined_scripts + '\n</body>' + end_part

    with open('conversor-portatil.html', 'w', encoding='utf-8') as f:
        f.write(html)

    print("conversor-portatil.html generated successfully!")

if __name__ == '__main__':
    build_portable()
