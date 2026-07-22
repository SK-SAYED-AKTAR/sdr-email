import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.seller_knowledge import SellerKnowledgeStatus


class SellerDocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    file_type: str
    file_size: int
    created_at: datetime


class UpdateSellerProfileRequest(BaseModel):
    company_name: str | None = None
    company_website: str | None = None
    product_website: str | None = None
    additional_notes: str | None = None


class SellerKnowledgeOut(BaseModel):
    id: uuid.UUID
    company_name: str | None
    company_website: str | None
    product_website: str | None
    additional_notes: str | None
    status: SellerKnowledgeStatus
    confidence: float | None
    model_name: str | None
    prompt_version: str | None
    generated_at: datetime | None
    failure_reason: str | None
    sources_processed: int | None
    knowledge: dict | None
    documents: list[SellerDocumentOut]
