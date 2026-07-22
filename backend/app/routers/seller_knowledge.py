import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.db.session import get_db
from app.models.seller_document import SellerDocument
from app.models.seller_knowledge import SellerKnowledge
from app.schemas.seller_knowledge import SellerDocumentOut, SellerKnowledgeOut, UpdateSellerProfileRequest
from app.services import seller_knowledge_service
from app.services.seller_knowledge_service import SellerKnowledgeError

router = APIRouter(prefix="/api/seller-knowledge", tags=["seller-knowledge"])


def _to_out(profile: SellerKnowledge, documents: list[SellerDocument]) -> SellerKnowledgeOut:
    sources_processed = None
    if profile.knowledge_sources:
        sources_processed = len(profile.knowledge_sources.get("documents", [])) + sum(
            bool(profile.knowledge_sources.get(flag))
            for flag in ("company_website_used", "product_website_used", "notes_used")
        )

    return SellerKnowledgeOut(
        id=profile.id,
        company_name=profile.company_name,
        company_website=profile.company_website,
        product_website=profile.product_website,
        additional_notes=profile.additional_notes,
        status=profile.status,
        confidence=profile.confidence,
        model_name=profile.model_name,
        prompt_version=profile.prompt_version,
        generated_at=profile.generated_at,
        failure_reason=profile.failure_reason,
        sources_processed=sources_processed,
        knowledge=profile.knowledge_json,
        documents=[SellerDocumentOut.model_validate(d) for d in documents],
    )


@router.get("", response_model=SellerKnowledgeOut)
async def get_seller_knowledge(request: Request, db: AsyncSession = Depends(get_db)) -> SellerKnowledgeOut:
    user = await security.get_current_user(request, db)
    profile = await seller_knowledge_service.get_or_create_profile(db, user.id)
    documents = await seller_knowledge_service.list_documents(db, user.id)
    return _to_out(profile, documents)


@router.patch("", response_model=SellerKnowledgeOut)
async def update_seller_knowledge(
    payload: UpdateSellerProfileRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> SellerKnowledgeOut:
    user = await security.get_current_user(request, db)
    profile = await seller_knowledge_service.update_profile(db, user.id, **payload.model_dump(exclude_unset=True))
    documents = await seller_knowledge_service.list_documents(db, user.id)
    return _to_out(profile, documents)


@router.post("/documents", response_model=SellerDocumentOut)
async def upload_document(
    request: Request, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
) -> SellerDocument:
    user = await security.get_current_user(request, db)

    if not file.filename:
        raise HTTPException(status_code=400, detail="File is missing a name.")

    content = await file.read()
    try:
        return await seller_knowledge_service.add_document(db, user.id, file.filename, content)
    except SellerKnowledgeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/documents/{document_id}")
async def delete_document(document_id: uuid.UUID, request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    user = await security.get_current_user(request, db)
    try:
        await seller_knowledge_service.remove_document(db, user.id, document_id)
    except SellerKnowledgeError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"success": True}


@router.post("/generate", response_model=SellerKnowledgeOut)
async def generate_seller_knowledge(
    request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)
) -> SellerKnowledgeOut:
    user = await security.get_current_user(request, db)

    try:
        profile = await seller_knowledge_service.start_generation(db, user.id)
    except SellerKnowledgeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    background_tasks.add_task(seller_knowledge_service.run_generation, user.id)

    documents = await seller_knowledge_service.list_documents(db, user.id)
    return _to_out(profile, documents)
