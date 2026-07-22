import io

from docx import Document
from pypdf import PdfReader

SUPPORTED_FILE_TYPES = {"pdf", "docx", "txt", "md"}

# ponytail: flat per-document character cap keeps AI input bounded without a
# chunking/embeddings pipeline. Move to that if documents regularly exceed it.
MAX_CHARS = 20_000


def file_type_from_filename(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def extract_text(file_type: str, content: bytes) -> str:
    if file_type == "pdf":
        text = _extract_pdf(content)
    elif file_type == "docx":
        text = _extract_docx(content)
    elif file_type in ("txt", "md"):
        text = content.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    return text[:MAX_CHARS]


def _extract_pdf(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _extract_docx(content: bytes) -> str:
    document = Document(io.BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs)
