import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.prospect import ProspectStatus


class CsvUploadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    row_count: int
    created_at: datetime


class ProspectProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    first_name: str
    last_name: str
    company_name: str
    status: ProspectStatus
    failure_reason: str | None


class UploadProgressOut(BaseModel):
    id: uuid.UUID
    filename: str
    total: int
    counts: dict[str, int]
    prospects: list[ProspectProgressOut]


class ProspectListItemOut(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    title: str
    email: str
    company_name: str
    company_website: str | None
    linkedin_url: str | None
    facebook_url: str | None
    twitter_url: str | None
    status: ProspectStatus
    failure_reason: str | None
    created_at: datetime
    subject: str | None
    email_preview: str | None
    email_body: str | None
    generated_at: str | None


class ProspectListOut(BaseModel):
    items: list[ProspectListItemOut]
    total: int
    page: int
    limit: int
    total_pages: int


class ProspectOutreachUpdate(BaseModel):
    subject: str = Field(min_length=1, max_length=500)
    email_body: str = Field(min_length=1)
