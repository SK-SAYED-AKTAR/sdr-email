import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ProspectStatus(str, enum.Enum):
    PENDING = "PENDING"
    RESEARCHING = "RESEARCHING"
    MATCHING = "MATCHING"
    GENERATING_EMAIL = "GENERATING_EMAIL"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Prospect(Base):
    """
    One row from an uploaded CSV, carried through the pipeline:
    research -> matching -> email generation.

    `research`, `matching`, and `outreach` each store a {"data": ..., "meta": ...}
    envelope, where `meta` carries {model_name, prompt_version, generated_at} for
    traceability. They are saved incrementally as each stage completes, so a
    mid-pipeline failure still preserves whatever was already produced.
    """

    __tablename__ = "prospects"
    __table_args__ = (Index("ix_prospects_csv_upload_id_status", "csv_upload_id", "status"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    csv_upload_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("csv_uploads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    linkedin_url: Mapped[str | None] = mapped_column(String(1024))
    company_website: Mapped[str | None] = mapped_column(String(1024))
    facebook_url: Mapped[str | None] = mapped_column(String(1024))
    twitter_url: Mapped[str | None] = mapped_column(String(1024))

    research: Mapped[dict | None] = mapped_column(JSONB)
    matching: Mapped[dict | None] = mapped_column(JSONB)
    outreach: Mapped[dict | None] = mapped_column(JSONB)

    status: Mapped[ProspectStatus] = mapped_column(
        Enum(ProspectStatus, name="prospect_status"), default=ProspectStatus.PENDING, nullable=False, index=True
    )
    failure_reason: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
