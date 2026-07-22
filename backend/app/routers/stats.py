from datetime import date, timedelta

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.db.session import get_db
from app.models.csv_upload import CsvUpload
from app.models.prospect import Prospect, ProspectStatus
from app.models.seller_knowledge import SellerKnowledge, SellerKnowledgeStatus
from app.schemas.stats import DailyActivity, StatsOverview

router = APIRouter(prefix="/api/stats", tags=["stats"])

DAYS = 14
IN_PROGRESS_STATUSES = {
    ProspectStatus.PENDING,
    ProspectStatus.RESEARCHING,
    ProspectStatus.ANALYZING_OPPORTUNITY,
    ProspectStatus.GENERATING_EMAIL,
}


@router.get("/overview", response_model=StatsOverview)
async def get_stats_overview(request: Request, db: AsyncSession = Depends(get_db)) -> StatsOverview:
    user = await security.get_current_user(request, db)

    rows = (
        await db.execute(select(Prospect.status, Prospect.sent_at).where(Prospect.user_id == user.id))
    ).all()

    completed = sum(1 for status, _ in rows if status == ProspectStatus.COMPLETED)
    failed = sum(1 for status, _ in rows if status == ProspectStatus.FAILED)
    generating = sum(1 for status, _ in rows if status in IN_PROGRESS_STATUSES)
    sent = sum(1 for _, sent_at in rows if sent_at is not None)

    csv_upload_count = await db.scalar(
        select(func.count()).select_from(CsvUpload).where(CsvUpload.user_id == user.id)
    )

    seller_knowledge = await db.scalar(select(SellerKnowledge).where(SellerKnowledge.user_id == user.id))
    sk_status = seller_knowledge.status if seller_knowledge else SellerKnowledgeStatus.NOT_GENERATED
    has_knowledge = bool(seller_knowledge and seller_knowledge.knowledge_json)

    today = date.today()
    start = today - timedelta(days=DAYS - 1)

    added_by_day = {
        day.isoformat(): count
        for day, count in (
            await db.execute(
                select(func.date(Prospect.created_at), func.count())
                .where(Prospect.user_id == user.id, Prospect.created_at >= start)
                .group_by(func.date(Prospect.created_at))
            )
        ).all()
    }
    sent_by_day = {
        day.isoformat(): count
        for day, count in (
            await db.execute(
                select(func.date(Prospect.sent_at), func.count())
                .where(Prospect.user_id == user.id, Prospect.sent_at >= start)
                .group_by(func.date(Prospect.sent_at))
            )
        ).all()
    }

    daily_activity = [
        DailyActivity(
            date=(day_date := start + timedelta(days=i)).isoformat(),
            added=added_by_day.get(day_date.isoformat(), 0),
            sent=sent_by_day.get(day_date.isoformat(), 0),
        )
        for i in range(DAYS)
    ]

    return StatsOverview(
        total_prospects=len(rows),
        completed_count=completed,
        generating_count=generating,
        failed_count=failed,
        sent_count=sent,
        csv_upload_count=csv_upload_count or 0,
        seller_knowledge_status=sk_status,
        has_seller_knowledge=has_knowledge,
        daily_activity=daily_activity,
    )
