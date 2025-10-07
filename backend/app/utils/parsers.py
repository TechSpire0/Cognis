import os
import csv
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict

import types, sys
if "pyaudioop" not in sys.modules:
    sys.modules["pyaudioop"] = types.ModuleType("pyaudioop")
if "audioop" not in sys.modules:
    sys.modules["audioop"] = types.ModuleType("audioop")

# For image/audio/document parsing
from PIL import Image
from pydub import AudioSegment
import PyPDF2
import docx

import wave
import contextlib
from mutagen import File as MutagenFile

# ---------- CSV PARSER ----------
def parse_csv(file_path: str):
    artifacts = []
    with open(file_path, newline='', encoding="utf-8", errors="ignore") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if not row:
                continue  # skip empty rows

            # Safely normalize keys and values
            keys = {}
            for k, v in row.items():
                if k is None:
                    continue  # skip blank headers
                clean_key = str(k).strip().lower()
                clean_val = str(v).strip() if v else ""
                keys[clean_key] = clean_val

            # Skip rows that ended up empty after cleaning
            if not keys:
                continue

            artifacts.append({
                "type": "csv_record",
                "text": " ".join(f"{k}: {v}" for k, v in keys.items() if v),
                "raw": keys,
            })

    return artifacts



# ---------- XML PARSER ----------
def parse_xml(file_path: str) -> List[Dict]:
    artifacts = []
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
    except ET.ParseError:
        return artifacts

    # Generic contact/message extraction
    for elem in root.findall(".//contact"):
        name = elem.attrib.get("name") or elem.findtext("name")
        number = elem.attrib.get("number") or elem.findtext("number")
        if name or number:
            artifacts.append({
                "type": "contact",
                "text": f"{name or ''} - {number or ''}".strip(" -"),
            })

    for sms in root.findall(".//sms"):
        sender = sms.attrib.get("address") or sms.findtext("address")
        body = sms.attrib.get("body") or sms.findtext("body")
        if body:
            artifacts.append({
                "type": "message",
                "text": f"SMS from {sender}: {body}",
            })

    for msg in root.findall(".//message"):
        sender = msg.attrib.get("sender") or msg.findtext("sender")
        body = msg.attrib.get("body") or msg.findtext("body")
        if body:
            artifacts.append({
                "type": "whatsapp",
                "text": f"WhatsApp from {sender}: {body}",
            })

    for call in root.findall(".//call"):
        number = call.attrib.get("number") or call.findtext("number")
        duration = call.attrib.get("duration") or call.findtext("duration")
        if number:
            artifacts.append({
                "type": "call",
                "text": f"Call to {number}, duration {duration or '?'}s",
            })

    return artifacts


# ---------- IMAGE PARSER ----------
def parse_image(file_path: str) -> List[Dict]:
    artifacts = []
    try:
        img = Image.open(file_path)
        width, height = img.size
        artifacts.append({
            "type": "image",
            "text": f"Image file {os.path.basename(file_path)} ({width}x{height}px)",
        })
    except Exception:
        artifacts.append({
            "type": "image",
            "text": f"Unreadable image: {os.path.basename(file_path)}",
        })
    return artifacts


# ---------- AUDIO PARSER ----------
def parse_audio(file_path: str):
    """
    Parses audio metadata safely without using deprecated audioop.
    Supports .wav and .mp3 using mutagen and wave modules.
    """
    artifacts = []
    ext = os.path.splitext(file_path.lower())[1]

    try:
        # --- WAV metadata ---
        if ext == ".wav":
            with contextlib.closing(wave.open(file_path, "rb")) as wf:
                duration = wf.getnframes() / float(wf.getframerate())
                channels = wf.getnchannels()
                sample_rate = wf.getframerate()

            artifacts.append({
                "type": "audio",
                "text": f"WAV file '{os.path.basename(file_path)}' - {duration:.2f}s, "
                        f"{channels} channel(s), {sample_rate}Hz."
            })

        # --- MP3 / others (mutagen handles metadata) ---
        else:
            audio = MutagenFile(file_path)
            if audio is not None:
                info = audio.info
                duration = getattr(info, "length", None)
                bitrate = getattr(info, "bitrate", None)

                artifacts.append({
                    "type": "audio",
                    "text": f"Audio file '{os.path.basename(file_path)}' - "
                            f"Duration: {duration:.2f}s, Bitrate: {bitrate or 'unknown'}."
                })
            else:
                artifacts.append({
                    "type": "audio",
                    "text": f"Audio file '{os.path.basename(file_path)}' - metadata unavailable."
                })

    except Exception as e:
        artifacts.append({
            "type": "audio",
            "text": f"Error parsing audio file '{os.path.basename(file_path)}': {str(e)}"
        })

    return artifacts


# ---------- DOCUMENT PARSER ----------
def parse_document(file_path: str) -> List[Dict]:
    artifacts = []
    basename = os.path.basename(file_path)
    try:
        if file_path.lower().endswith(".pdf"):
            reader = PyPDF2.PdfReader(file_path)
            text = ""
            for page in reader.pages[:2]:  # limit to first 2 pages
                text += page.extract_text() or ""
            artifacts.append({
                "type": "document",
                "text": f"PDF {basename}: {text[:500]}",
            })
        elif file_path.lower().endswith(".doc"):
            artifacts.append({
                "type": "document",
                "text": f"DOC file {basename} (binary format not parsed)",
            })
        elif file_path.lower().endswith(".docx"):
            doc = docx.Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs])
            artifacts.append({
                "type": "document",
                "text": f"DOCX {basename}: {text[:500]}",
            })
    except Exception:
        artifacts.append({
            "type": "document",
            "text": f"Unreadable document: {basename}",
        })
    return artifacts


# ---------- TEXT PARSER ----------
def parse_text(file_path: str) -> List[Dict]:
    artifacts = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        artifacts.append({
            "type": "text",
            "text": f"Text file {os.path.basename(file_path)}: {content[:500]}",
        })
    except Exception:
        artifacts.append({
            "type": "text",
            "text": f"Unreadable text file: {os.path.basename(file_path)}",
        })
    return artifacts


# ---------- VIDEO PARSER ----------
def parse_video(file_path: str) -> List[Dict]:
    # We don’t process actual video content — just metadata.
    basename = os.path.basename(file_path)
    return [{
        "type": "video",
        "text": f"Video file {basename} (metadata not parsed)",
    }]
