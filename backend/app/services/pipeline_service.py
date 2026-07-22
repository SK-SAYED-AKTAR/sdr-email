import asyncio
import logging
import uuid

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.prospect import Prospect, ProspectStatus
from app.services.ai import business_opportunity_service, email_service, research_service
from app.services.ai.seller_intelligence_service import SellerIntelligence
from app.services.ai.seller_knowledge import get_seller_knowledge

logger = logging.getLogger(__name__)

MAX_CONCURRENT_ROWS = 5


async def process_csv_upload(csv_upload_id: uuid.UUID, user_id: uuid.UUID) -> None:
    """Background job entry point. Runs the full pipeline for every prospect in
    this upload. Every row is fully isolated: one row's failure never stops or
    affects the others."""
    async with SessionLocal() as db:
        result = await db.execute(select(Prospect.id).where(Prospect.csv_upload_id == csv_upload_id))
        prospect_ids = [row[0] for row in result.all()]

    seller_knowledge = await get_seller_knowledge(user_id)
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_ROWS)

    async def process_with_limit(prospect_id: uuid.UUID) -> None:
        async with semaphore:
            await process_prospect(prospect_id, seller_knowledge)

    await asyncio.gather(*(process_with_limit(pid) for pid in prospect_ids))


async def process_prospect(prospect_id: uuid.UUID, seller_knowledge: SellerIntelligence) -> None:
    """Research -> Business Opportunity Analysis -> Email for one prospect,
    saving after each stage so partial progress survives a later failure in
    the same row."""
    async with SessionLocal() as db:
        prospect = await db.get(Prospect, prospect_id)
        if prospect is None:
            return

        try:
            if not prospect.company_name.strip():
                raise ValueError("Row is missing a company name.")

            prospect.status = ProspectStatus.RESEARCHING
            await db.commit()

            research_envelope = await research_service.research_prospect(prospect)
            prospect.research = research_envelope
            prospect.status = ProspectStatus.ANALYZING_OPPORTUNITY
            await db.commit()

            opportunity_envelope = await business_opportunity_service.analyze_opportunity(
                prospect, research_envelope["data"], seller_knowledge
            )
            prospect.opportunity = opportunity_envelope
            prospect.status = ProspectStatus.GENERATING_EMAIL
            await db.commit()

            outreach_envelope = await email_service.generate_outreach(
                prospect, seller_knowledge, research_envelope["data"], opportunity_envelope["data"]
            )
            prospect.outreach = outreach_envelope
            prospect.status = ProspectStatus.COMPLETED
            await db.commit()

        except Exception as exc:
            logger.exception("Pipeline failed for prospect %s", prospect_id)
            prospect.status = ProspectStatus.FAILED
            prospect.failure_reason = str(exc)[:1000]
            await db.commit()
