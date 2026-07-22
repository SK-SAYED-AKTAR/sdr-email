import uuid
from pathlib import Path

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads" / "seller-documents"


def save_file(subdir: str, filename: str, content: bytes) -> str:
    """
    Saves a file and returns its storage_path — a stable identifier callers
    persist and pass back to read_file/delete_file. Today this writes to local
    disk; swapping to S3 later means changing only this module's three
    functions (storage_path would become an object key), not any caller.
    """
    target_dir = UPLOAD_ROOT / subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid.uuid4()}_{filename}"
    (target_dir / safe_name).write_bytes(content)
    return f"{subdir}/{safe_name}"


def read_file(storage_path: str) -> bytes:
    return (UPLOAD_ROOT / storage_path).read_bytes()


def delete_file(storage_path: str) -> None:
    (UPLOAD_ROOT / storage_path).unlink(missing_ok=True)
