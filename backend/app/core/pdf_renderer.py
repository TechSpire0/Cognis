from io import BytesIO
from datetime import datetime
from weasyprint import HTML, CSS
from jinja2 import Template
import os

def render_forensic_pdf(ufdr, artifacts, ai_summary, logo_path=None):
    # Prepare HTML using Jinja2-like templating
    html_template = Template("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Helvetica, sans-serif; font-size: 12px; color: #222; margin: 2cm; }
            header { position: fixed; top: 0; left: 0; right: 0; height: 2cm; }
            footer { position: fixed; bottom: 0; left: 0; right: 0; height: 1cm;
                     text-align: center; font-size: 10px; color: #777; }
            .title { text-align: center; font-size: 20px; font-weight: bold; margin-top: 20px; }
            .meta-table { margin-top: 15px; width: 100%; border-collapse: collapse; }
            .meta-table td { padding: 3px 8px; }
            .summary, .artifacts { margin-top: 25px; }
            .artifacts table { width: 100%; border-collapse: collapse; }
            .artifacts th { background: #003366; color: white; padding: 6px; font-size: 12px; }
            .artifacts td { border: 1px solid #ccc; padding: 5px; vertical-align: top; font-size: 11px; }
            .logo { width: 120px; float: left; }
            .watermark {
                position: fixed; top: 35%; left: 20%;
                opacity: 0.08; font-size: 100px; transform: rotate(-30deg);
                color: #003366; font-weight: bold;
            }
        </style>
    </head>
    <body>
        <header>
            {% if logo_path %}
            <img src="file://{{ logo_path }}" class="logo">
            {% endif %}
            <div style="float:right; font-size:14px; font-weight:bold; color:#003366;">COGNIS</div>
        </header>

        <div class="watermark">COGNIS</div>

        <div class="title">Forensic Report</div>

        <table class="meta-table">
            <tr><td><b>Filename:</b></td><td>{{ ufdr.filename }}</td></tr>
            <tr><td><b>Case ID:</b></td><td>{{ ufdr.case_id }}</td></tr>
            <tr><td><b>Uploaded:</b></td><td>{{ ufdr.uploaded_at }}</td></tr>
            {% if ufdr.meta.get('uploaded_by') %}
            <tr><td><b>Uploaded by:</b></td><td>{{ ufdr.meta.get('uploaded_by') }}</td></tr>
            {% endif %}
            {% if ufdr.meta.get('size') %}
            <tr><td><b>Size:</b></td><td>{{ ufdr.meta.get('size') }}</td></tr>
            {% endif %}
        </table>

        <div class="summary">
            <h3>AI Summary</h3>
            <p>{{ ai_summary | e }}</p>
        </div>

        <div class="artifacts">
            <h3>Evidence Artifacts</h3>
            <table>
                <thead>
                    <tr>
                        <th>#</th><th>Type</th><th>Timestamp</th><th>Sender</th><th>Snippet</th>
                    </tr>
                </thead>
                <tbody>
                {% for i, art in enumerate(artifacts[:300]) %}
                    <tr>
                        <td>{{ i+1 }}</td>
                        <td>{{ art.type }}</td>
                        <td>{{ art.created_at or "" }}</td>
                        <td>{{ art.raw.get("sender", "") if art.raw else "" }}</td>
                        <td>{{ (art.extracted_text or str(art.raw))[:400] | e }}</td>
                    </tr>
                {% endfor %}
                </tbody>
            </table>
        </div>

        <footer>
            Generated on {{ now }} UTC — Page counter: counter(page)
        </footer>
    </body>
    </html>
    """)

    html = html_template.render(
        ufdr=ufdr,
        artifacts=artifacts,
        ai_summary=ai_summary,
        logo_path=os.path.abspath(logo_path) if logo_path else None,
        now=datetime.utcnow().isoformat()
    )

    pdf_bytes = HTML(string=html).write_pdf()
    return pdf_bytes
