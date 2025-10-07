# app/utils/file_utils.py

import os
import shutil
import zipfile
import tempfile
from typing import List, Tuple


def is_within_directory(directory: str, target: str) -> bool:
    abs_directory = os.path.abspath(directory)
    abs_target = os.path.abspath(target)
    return os.path.commonpath([abs_directory]) == os.path.commonpath([abs_directory, abs_target])


def safe_extract_zip(zip_path: str, extract_to: str) -> List[str]:
    """Safely extract ZIP files, blocking path traversal."""
    extracted_files = []
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.infolist():
            if member.is_dir():
                continue
            member_name = member.filename
            if os.path.isabs(member_name):
                continue
            normalized = os.path.normpath(member_name)
            if normalized.startswith(".."):
                continue
            target_path = os.path.join(extract_to, normalized)
            if not is_within_directory(extract_to, target_path):
                continue
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            with zf.open(member) as source, open(target_path, "wb") as target:
                shutil.copyfileobj(source, target)
            extracted_files.append(target_path)
    return extracted_files


def make_tempdir(prefix: str = "ufdr_") -> Tuple[str, tempfile.TemporaryDirectory]:
    """Create a temporary directory and return its path and object."""
    tmp = tempfile.TemporaryDirectory(prefix=prefix)
    return tmp.name, tmp
