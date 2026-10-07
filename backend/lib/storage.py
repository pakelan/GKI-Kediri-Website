"""Local storage helpers (sync — wrap in asyncio.to_thread dari endpoint)."""

import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

# Folder penyimpanan lokal di komputer
LOCAL_DIR = Path(__file__).parent.parent / "local_storage"


def init_storage(force: bool = False) -> str:
    LOCAL_DIR.mkdir(parents=True, exist_ok=True)
    return str(LOCAL_DIR)


def put_object(path: str, data: bytes, content_type: str) -> dict:
    LOCAL_DIR.mkdir(parents=True, exist_ok=True)
    # Bersihkan path agar aman disimpan dalam folder lokal
    relative_path = path.replace("gki-kediri/", "").lstrip("/")
    safe_path = LOCAL_DIR / relative_path
    safe_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(safe_path, "wb") as f:
        f.write(data)
        
    size = len(data)
    logger.info("Saved file locally to %s", safe_path)
    return {"path": path, "size": size}


def get_object(path: str) -> tuple[bytes, str]:
    relative_path = path.replace("gki-kediri/", "").lstrip("/")
    safe_path = LOCAL_DIR / relative_path
    if not safe_path.exists():
        raise FileNotFoundError("File tidak ditemukan")
    
    with open(safe_path, "rb") as f:
        data = f.read()
        
    # Deteksi tipe konten sederhana berdasarkan ekstensi file
    content_type = "application/octet-stream"
    ext = safe_path.suffix.lower()
    if ext == ".png":
        content_type = "image/png"
    elif ext in (".jpg", ".jpeg"):
        content_type = "image/jpeg"
    elif ext == ".pdf":
        content_type = "application/pdf"
        
    return data, content_type