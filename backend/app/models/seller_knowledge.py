import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class SellerKnowledgeStatus(str, enum.Enum):
    NOT_GENERATED = "NOT_GENERATED"
    GENERATING = "GENERATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class SellerKnowledge(Base):
    """
    One row per user: their company/product profile plus the last AI-generated
    understanding of it. `knowledge_json` stores a {"data": ..., "meta": ...}
    envelope (same shape used for Prospect.research/matching/outreach), where
    `meta` carries {model_name, prompt_version, generated_at}. `model_name`
    and `prompt_version` are duplicated as top-level columns for cheap
    querying/display without unpacking JSON.
    """

    __tablename__ = "seller_knowledge"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )

    company_name: Mapped[str | None] = mapped_column(String(255))
    company_website: Mapped[str | None] = mapped_column(String(1024))
    product_website: Mapped[str | None] = mapped_column(String(1024))
    additional_notes: Mapped[str | None] = mapped_column(Text)

    knowledge_json: Mapped[dict | None] = mapped_column(JSONB)
    knowledge_sources: Mapped[dict | None] = mapped_column(JSONB)
    knowledge_summary: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Float)
    model_name: Mapped[str | None] = mapped_column(String(255))
    prompt_version: Mapped[str | None] = mapped_column(String(50))

    status: Mapped[SellerKnowledgeStatus] = mapped_column(
        Enum(SellerKnowledgeStatus, name="seller_knowledge_status"),
        default=SellerKnowledgeStatus.NOT_GENERATED,
        nullable=False,
    )
    failure_reason: Mapped[str | None] = mapped_column(Text)
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
