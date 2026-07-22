import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import SessionLocal
from app.models.seller_document import SellerDocument
from app.models.seller_knowledge import SellerKnowledge, SellerKnowledgeStatus
from app.services import document_extraction, storage_service
from app.services.ai.seller_intelligence_service import generate_seller_intelligence

logger = logging.getLogger(__name__)

MAX_DOCUMENT_SIZE = 15 * 1024 * 1024  # 15MB


class SellerKnowledgeError(Exception):
    """User-facing error. Message is always safe to show directly."""


# This module is the only thing that reads or writes SellerKnowledge /
# SellerDocument rows. app.services.ai.seller_knowledge.get_seller_knowledge
# is a thin adapter over get_or_create_profile() + the envelope in
# .knowledge_json — no other service should ever import these models directly.


async def get_or_create_profile(db: AsyncSession, user_id: uuid.UUID) -> SellerKnowledge:
    profile = await db.scalar(select(SellerKnowledge).where(SellerKnowledge.user_id == user_id))
    if profile is None:
        profile = SellerKnowledge(user_id=user_id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def update_profile(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    company_name: str | None = None,
    company_website: str | None = None,
    product_website: str | None = None,
    additional_notes: str | None = None,
) -> SellerKnowledge:
    profile = await get_or_create_profile(db, user_id)
    if company_name is not None:
        profile.company_name = company_name
    if company_website is not None:
        profile.company_website = company_website
    if product_website is not None:
        profile.product_website = product_website
    if additional_notes is not None:
        profile.additional_notes = additional_notes
    await db.commit()
    await db.refresh(profile)
    return profile


async def list_documents(db: AsyncSession, user_id: uuid.UUID) -> list[SellerDocument]:
    profile = await get_or_create_profile(db, user_id)
    result = await db.execute(
        select(SellerDocument)
        .where(SellerDocument.seller_knowledge_id == profile.id)
        .order_by(SellerDocument.created_at)
    )
    return list(result.scalars().all())


async def add_document(db: AsyncSession, user_id: uuid.UUID, filename: str, content: bytes) -> SellerDocument:
    file_type = document_extraction.file_type_from_filename(filename)
    if file_type not in document_extraction.SUPPORTED_FILE_TYPES:
        raise SellerKnowledgeError("Supported file types are PDF, DOCX, TXT, and Markdown.")
    if not content:
        raise SellerKnowledgeError("File is empty.")
    if len(content) > MAX_DOCUMENT_SIZE:
        raise SellerKnowledgeError("File is too large. Maximum size is 15MB.")

    profile = await get_or_create_profile(db, user_id)
    storage_path = storage_service.save_file(str(profile.id), filename, content)

    document = SellerDocument(
        seller_knowledge_id=profile.id,
        filename=filename,
        file_type=file_type,
        file_size=len(content),
        storage_path=storage_path,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document


async def remove_document(db: AsyncSession, user_id: uuid.UUID, document_id: uuid.UUID) -> None:
    profile = await get_or_create_profile(db, user_id)
    document = await db.get(SellerDocument, document_id)
    if document is None or document.seller_knowledge_id != profile.id:
        raise SellerKnowledgeError("Document not found.")

    storage_service.delete_file(document.storage_path)
    await db.delete(document)
    await db.commit()


async def start_generation(db: AsyncSession, user_id: uuid.UUID) -> SellerKnowledge:
    """Validates there's something to generate from and flips status to
    GENERATING immediately, so the caller's response already reflects it.
    The actual run is scheduled separately via run_generation as a background
    task."""
    profile = await get_or_create_profile(db, user_id)
    documents = await list_documents(db, user_id)

    has_source = bool(
        profile.company_website or profile.product_website or profile.additional_notes or documents
    )
    if not has_source:
        raise SellerKnowledgeError(
            "Add a company website, product website, document, or notes before generating."
        )

    profile.status = SellerKnowledgeStatus.GENERATING
    profile.failure_reason = None
    await db.commit()
    await db.refresh(profile)
    return profile


async def run_generation(user_id: uuid.UUID) -> None:
    """Background job entry point: extracts text from every uploaded document,
    runs the Seller Intelligence Agent, and persists the result. Owns its own
    DB session since it runs outside any request's lifecycle."""
    async with SessionLocal() as db:
        profile = await get_or_create_profile(db, user_id)

        try:
            documents = await list_documents(db, user_id)

            document_texts: list[tuple[str, str]] = []
            for doc in documents:
                content = storage_service.read_file(doc.storage_path)
                document_texts.append((doc.filename, document_extraction.extract_text(doc.file_type, content)))

            envelope = await generate_seller_intelligence(
                profile.company_website, profile.product_website, profile.additional_notes, document_texts
            )

            profile.knowledge_json = envelope
            profile.knowledge_summary = envelope["data"]["company_summary"]
            profile.confidence = envelope["data"]["confidence"]
            profile.model_name = envelope["meta"]["model_name"]
            profile.prompt_version = envelope["meta"]["prompt_version"]
            profile.generated_at = datetime.now(timezone.utc)
            profile.knowledge_sources = {
                "documents": [{"id": str(d.id), "filename": d.filename} for d in documents],
                "company_website_used": bool(profile.company_website),
                "product_website_used": bool(profile.product_website),
                "notes_used": bool(profile.additional_notes),
            }
            profile.status = SellerKnowledgeStatus.COMPLETED
            await db.commit()

        except Exception as exc:
            logger.exception("Seller knowledge generation failed for user %s", user_id)
            profile.status = SellerKnowledgeStatus.FAILED
            profile.failure_reason = str(exc)[:1000]
            await db.commit()
