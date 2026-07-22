import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

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
