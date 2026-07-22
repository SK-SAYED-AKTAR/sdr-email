from pydantic import BaseModel

from app.models.seller_knowledge import SellerKnowledgeStatus


class DailyActivity(BaseModel):
    date: str
    added: int
    sent: int


class StatsOverview(BaseModel):
    total_prospects: int
    completed_count: int
    generating_count: int
    failed_count: int
    sent_count: int
    csv_upload_count: int
    seller_knowledge_status: SellerKnowledgeStatus
    has_seller_knowledge: bool
    daily_activity: list[DailyActivity]
