import re
import html
import subprocess
import os
import time

def markdown_to_html(md_text):
    lines = md_text.splitlines()
    html_lines = []
    in_code_block = False
    code_lang = ""
    code_content = []
    in_table = False
    table_rows = []
    in_list = False
    list_type = None

    def close_table():
        nonlocal in_table, table_rows
        if not in_table:
            return ""
        in_table = False
        res = ["<div class='table-wrapper'><table>"]
        for i, row in enumerate(table_rows):
            if i == 0:
                res.append("<thead><tr>")
                for cell in row:
                    res.append(f"<th>{cell}</th>")
                res.append("</tr></thead><tbody>")
            else:
                res.append("<tr>")
                for cell in row:
                    res.append(f"<td>{cell}</td>")
                res.append("</tr>")
        res.append("</tbody></table></div>")
        table_rows = []
        return "".join(res)

    def close_list():
        nonlocal in_list, list_type
        if not in_list:
            return ""
        in_list = False
        tag = "ul" if list_type == "ul" else "ol"
        list_type = None
        return f"</{tag}>"

    def format_inline(text):
        # Code snippets
        text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
        # Bold
        text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
        # Italic
        text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
        return text

    for line in lines:
        stripped = line.strip()

        # Handle code blocks
        if stripped.startswith("```"):
            if in_code_block:
                in_code_block = False
                joined_code = html.escape("\n".join(code_content))
                html_lines.append(f"<pre><code class='language-{code_lang}'>{joined_code}</code></pre>")
                code_content = []
                code_lang = ""
            else:
                if in_table:
                    html_lines.append(close_table())
                if in_list:
                    html_lines.append(close_list())
                in_code_block = True
                code_lang = stripped[3:].strip()
                code_content = []
            continue

        if in_code_block:
            code_content.append(line)
            continue

        # Handle tables
        if stripped.startswith("|") and stripped.endswith("|"):
            if in_list:
                html_lines.append(close_list())
            # Check if separator row
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            if all(re.match(r'^:?-+:?$', c) for c in cells):
                # separator row, skip
                continue
            formatted_cells = [format_inline(c) for c in cells]
            if not in_table:
                in_table = True
                table_rows = [formatted_cells]
            else:
                table_rows.append(formatted_cells)
            continue
        elif in_table:
            html_lines.append(close_table())

        # Handle blockquotes
        if stripped.startswith(">"):
            if in_list:
                html_lines.append(close_list())
            quote_text = format_inline(stripped.lstrip("> ").strip())
            html_lines.append(f"<blockquote>{quote_text}</blockquote>")
            continue

        # Handle horizontal rules
        if stripped in ["---", "***", "___"]:
            if in_list:
                html_lines.append(close_list())
            html_lines.append("<hr />")
            continue

        # Handle headings
        if stripped.startswith("#"):
            if in_list:
                html_lines.append(close_list())
            match = re.match(r'^(#{1,6})\s+(.*)$', stripped)
            if match:
                level = len(match.group(1))
                h_text = format_inline(match.group(2))
                html_lines.append(f"<h{level}>{h_text}</h{level}>")
                continue

        # Handle bullet lists
        if stripped.startswith("- ") or stripped.startswith("* "):
            if not in_list or list_type != "ul":
                if in_list:
                    html_lines.append(close_list())
                in_list = True
                list_type = "ul"
                html_lines.append("<ul>")
            item_text = format_inline(stripped[2:].strip())
            html_lines.append(f"<li>{item_text}</li>")
            continue

        # Handle numbered lists
        match_ol = re.match(r'^(\d+)\.\s+(.*)$', stripped)
        if match_ol:
            if not in_list or list_type != "ol":
                if in_list:
                    html_lines.append(close_list())
                in_list = True
                list_type = "ol"
                html_lines.append("<ol>")
            item_text = format_inline(match_ol.group(2).strip())
            html_lines.append(f"<li>{item_text}</li>")
            continue

        # Empty lines
        if not stripped:
            if in_list:
                html_lines.append(close_list())
            continue

        # Regular paragraphs
        if in_list:
            html_lines.append(close_list())
        html_lines.append(f"<p>{format_inline(stripped)}</p>")

    if in_table:
        html_lines.append(close_table())
    if in_list:
        html_lines.append(close_list())

    return "\n".join(html_lines)


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(root_dir, "VIVA_PREPARATION_GUIDE.md")
    html_path = os.path.join(root_dir, "VIVA_PREPARATION_GUIDE.html")
    pdf_path = os.path.join(root_dir, "VIVA_PREPARATION_GUIDE.pdf")

    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    body_html = markdown_to_html(md_text)

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CampusConnect - Viva Preparation Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  @page {{
    size: A4;
    margin: 1.8cm 1.5cm;
    @bottom-center {{
      content: counter(page);
    }}
  }}

  * {{
    box-sizing: border-box;
  }}

  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.6;
    font-size: 10.5pt;
    margin: 0;
    padding: 0;
  }}

  h1, h2, h3, h4, h5, h6 {{
    color: #0f172a;
    font-weight: 700;
    line-height: 1.25;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    page-break-after: avoid;
  }}

  h1 {{
    font-size: 20pt;
    font-weight: 800;
    color: #312e81;
    border-bottom: 2.5px solid #4f46e5;
    padding-bottom: 8px;
    margin-top: 0;
  }}

  h2 {{
    font-size: 14pt;
    color: #4338ca;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 5px;
    margin-top: 1.8em;
  }}

  h3 {{
    font-size: 11.5pt;
    color: #1e1b4b;
    margin-top: 1.2em;
  }}

  p {{
    margin: 0.6em 0;
  }}

  strong {{
    color: #0f172a;
    font-weight: 600;
  }}

  hr {{
    border: none;
    height: 1px;
    background-color: #cbd5e1;
    margin: 1.8em 0;
  }}

  blockquote {{
    margin: 1em 0;
    padding: 0.7em 1.2em;
    background-color: #f8fafc;
    border-left: 4px solid #6366f1;
    border-radius: 4px;
    color: #334155;
    font-size: 9.5pt;
  }}

  code {{
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 9pt;
    background-color: #f1f5f9;
    color: #4338ca;
    padding: 1.5px 4.5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }}

  pre {{
    background-color: #0f172a;
    color: #f8fafc;
    padding: 12px 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
    font-size: 8.5pt;
    line-height: 1.45;
    margin: 1em 0;
    page-break-inside: avoid;
  }}

  pre code {{
    background-color: transparent;
    color: inherit;
    padding: 0;
    border: none;
  }}

  .table-wrapper {{
    width: 100%;
    overflow-x: auto;
    margin: 1em 0;
    page-break-inside: avoid;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    background-color: #ffffff;
  }}

  th, td {{
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    text-align: left;
    vertical-align: top;
  }}

  th {{
    background-color: #f1f5f9;
    font-weight: 600;
    color: #1e293b;
  }}

  tr:nth-child(even) td {{
    background-color: #f8fafc;
  }}

  ul, ol {{
    margin: 0.5em 0;
    padding-left: 20px;
  }}

  li {{
    margin-bottom: 0.3em;
  }}

  .page-break {{
    page-break-before: always;
  }}
</style>
</head>
<body>
{body_html}
</body>
</html>"""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    print(f"HTML written to {html_path}")

    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    edge_exe = next((p for p in edge_paths if os.path.exists(p)), None)

    if edge_exe:
        print(f"Running Edge headless to create PDF...")
        cmd = [
            edge_exe,
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={pdf_path}",
            html_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        time.sleep(2)
        if os.path.exists(pdf_path):
            print(f"SUCCESS: Generated PDF at {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
        else:
            print("Edge executed but PDF not found:", res.stderr)
    else:
        print("Microsoft Edge not found at expected paths.")

if __name__ == "__main__":
    main()
