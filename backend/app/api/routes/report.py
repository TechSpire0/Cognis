from io import BytesIO
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact
from app.models.user import User
from app.core.deps import get_db, get_current_user
from app.core.llm import ask_llm_cached
import textwrap, re
from fpdf import FPDF

router = APIRouter(prefix="/api/v1/report", tags=["report"])


def build_snippet(artifact: Artifact, max_len: int = 150) -> str:
    if artifact.extracted_text:
        text = artifact.extracted_text.strip()
        return text[:max_len] + "..." if len(text) > max_len else text
    elif artifact.raw and isinstance(artifact.raw, dict):
        for key in ("text", "body", "message"):
            if key in artifact.raw:
                t = str(artifact.raw[key])
                return t[:max_len] + "..." if len(t) > max_len else t
    return ""


def safe_multicell(pdf: FPDF, text: str, height: int = 8, max_width: int = 100):
    """Safely print text into PDF without crashing."""
    if not text:
        return
    try:
        # Clean weird characters
        text = re.sub(r"[\x00-\x1F]+", " ", text)
        text = text.replace("\r", " ").replace("\t", " ")

        # Break very long words
        words = text.split(" ")
        fixed = []
        for w in words:
            if len(w) > 100:
                fixed.append(w[:100] + "…")
            else:
                fixed.append(w)
        wrapped = textwrap.wrap(" ".join(fixed), width=max_width)

        for line in wrapped:
            pdf.multi_cell(0, height, line)
    except Exception:
        # If still fails, skip line safely
        try:
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(0, height, "[Skipped unreadable line]")
        except:
            pdf.add_page()
            pdf.multi_cell(0, height, "[Recovered from PDF error]")



def generate_pdf(ufdr: UFDRFile, artifacts: List[Artifact], ai_summary: str) -> bytes:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Cognis Forensic Report", ln=True, align="C")

    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, f"Generated on: {datetime.utcnow().isoformat()} UTC", ln=True)
    pdf.cell(0, 8, f"Case ID: {ufdr.case_id or 'N/A'}", ln=True)
    pdf.cell(0, 8, f"Filename: {ufdr.filename}", ln=True)
    pdf.cell(0, 8, f"Uploaded: {ufdr.uploaded_at}", ln=True)
    if isinstance(ufdr.meta, dict):
        if uploader := ufdr.meta.get("uploaded_by"):
            pdf.cell(0, 8, f"Uploaded By: {uploader}", ln=True)
        if size := ufdr.meta.get("size"):
            pdf.cell(0, 8, f"Size: {size}", ln=True)

    pdf.ln(8)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Artifact Summary", ln=True)

    # Count artifacts by type
    pdf.set_font("Helvetica", "", 11)
    counts = {}
    for a in artifacts:
        counts[a.type or "Unknown"] = counts.get(a.type or "Unknown", 0) + 1
    if counts:
        for t, c in counts.items():
            pdf.cell(0, 8, f"- {t}: {c}", ln=True)
    else:
        pdf.cell(0, 8, "No artifacts found.", ln=True)

    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "AI Summary", ln=True)
    pdf.set_font("Helvetica", "", 11)
    wrapped_summary = []
    for line in ai_summary.split("\n"):
        line = line.replace("\r", " ").replace("\t", " ")
        wrapped_summary.extend(textwrap.wrap(line, width=100) or [""])

    for line in wrapped_summary:
        safe_multicell(pdf, line)

    pdf.ln(6)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Evidence Table (Sample)", ln=True)
    pdf.set_font("Helvetica", "", 10)

    if artifacts:
        for idx, art in enumerate(sorted(artifacts, key=lambda x: x.created_at or "", reverse=True)[:150]):
            snippet = build_snippet(art).replace("\n", " ").replace("\r", " ")
            snippet = snippet[:500]  # truncate to keep it safe
            line = f"[{idx+1}] {art.type} | {art.created_at} | {snippet}"
            safe_multicell(pdf, line, height=7)
            pdf.ln(1)
    else:
        pdf.cell(0, 8, "No evidence available.", ln=True)

    # Watermark
    pdf.set_text_color(200, 200, 200)
    pdf.set_font("Helvetica", "B", 40)
    pdf.set_xy(30, 130)
    pdf.cell(0, 30, "COGNIS", align="C")

    pdf_bytes = bytes(pdf.output(dest="S"))
    return pdf_bytes


@router.get("/{ufdr_id}")
async def generate_forensic_report(
    ufdr_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch UFDR
    stmt = select(UFDRFile).where(UFDRFile.id == ufdr_id)
    res = await db.execute(stmt)
    ufdr = res.scalar_one_or_none()
    if not ufdr:
        raise HTTPException(status_code=404, detail="UFDR not found")

    # Fetch artifacts
    a_stmt = select(Artifact).where(Artifact.ufdr_file_id == ufdr.id)
    a_res = await db.execute(a_stmt)
    artifacts = a_res.scalars().all()

    # Generate AI summary (cached)
    artifact_counts = {a.type or "unknown": 0 for a in artifacts}
    for a in artifacts:
        artifact_counts[a.type or "unknown"] += 1

    prompt = (
        f"Summarize forensic evidence from UFDR file '{ufdr.filename}'.\n"
        f"Artifact counts: {artifact_counts}\n"
        f"Highlight communication patterns, transactions, and anomalies."
    )

    ai_summary = await ask_llm_cached(str(ufdr.id), "forensic_summary", prompt)

    # Generate PDF asynchronously
    pdf_bytes = await run_in_threadpool(generate_pdf, ufdr, artifacts, ai_summary)
    headers = {"Content-Disposition": f"attachment; filename=cognis_report_{ufdr.id}.pdf"}
    return StreamingResponse(BytesIO(pdf_bytes), media_type="application/pdf", headers=headers)
