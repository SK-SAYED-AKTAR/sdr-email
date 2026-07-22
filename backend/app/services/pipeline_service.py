import asyncio
import logging
import uuid

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.prospect import Prospect, ProspectStatus
from app.services.ai import (
    business_opportunity_service,
    copy_editor_service,
    email_service,
    research_service,
    sales_qa_service,
)
from app.services.ai.seller_intelligence_service import SellerIntelligence
from app.services.ai.seller_knowledge import get_seller_knowledge

logger = logging.getLogger(__name__)

MAX_CONCURRENT_ROWS = 5
MAX_DRAFT_ATTEMPTS = 2


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

            outreach_envelope = await _write_and_review_email(
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


async def regenerate_prospect_email(prospect_id: uuid.UUID) -> None:
    """Used by the Regenerate Email action in the review UI -- the single-row
    button, bulk selection, and the preview modal all resolve to this same
    call. Reuses the existing research and business opportunity analysis when
    available, since regenerating an email doesn't require re-researching the
    company, only rewriting it through Writer -> QA -> Editor. Falls back to
    the full pipeline if a prospect never made it past an earlier stage."""
    async with SessionLocal() as db:
        prospect = await db.get(Prospect, prospect_id)
        if prospect is None:
            return
        user_id = prospect.user_id
        has_upstream = bool(prospect.research) and bool(prospect.opportunity)

    if not has_upstream:
        seller_knowledge = await get_seller_knowledge(user_id)
        await process_prospect(prospect_id, seller_knowledge)
        return

    async with SessionLocal() as db:
        prospect = await db.get(Prospect, prospect_id)
        if prospect is None:
            return
        seller_knowledge = await get_seller_knowledge(prospect.user_id)

        try:
            prospect.status = ProspectStatus.GENERATING_EMAIL
            prospect.failure_reason = None
            await db.commit()

            outreach_envelope = await _write_and_review_email(
                prospect, seller_knowledge, prospect.research["data"], prospect.opportunity["data"]
            )
            prospect.outreach = outreach_envelope
            prospect.status = ProspectStatus.COMPLETED
            await db.commit()

        except Exception as exc:
            logger.exception("Regenerate failed for prospect %s", prospect_id)
            prospect.status = ProspectStatus.FAILED
            prospect.failure_reason = str(exc)[:1000]
            await db.commit()


async def _write_and_review_email(
    prospect: Prospect,
    seller_knowledge: SellerIntelligence,
    prospect_intelligence: dict,
    business_opportunity: dict,
) -> dict:
    """Email Writer -> Sales QA -> Copy Editor. QA never rewrites, only
    scores a draft against the business opportunity it was supposed to
    communicate; a low score triggers one redraft with its feedback. Either
    way, the draft always passes through the Copy Editor before being
    returned, so a prospect never ends up without an email over a QA score
    that never quite clears the bar."""
    qa_feedback: str | None = None
    draft_envelope: dict = {}

    for attempt in range(1, MAX_DRAFT_ATTEMPTS + 1):
        draft_envelope = await email_service.generate_outreach(
            prospect, seller_knowledge, prospect_intelligence, business_opportunity, qa_feedback=qa_feedback
        )
        qa_result = await sales_qa_service.review_draft(draft_envelope["data"], business_opportunity)
        logger.info(
            "Sales QA scored %d for prospect %s (attempt %d/%d)",
            qa_result.score, prospect.id, attempt, MAX_DRAFT_ATTEMPTS,
        )
        if qa_result.score >= sales_qa_service.QA_PASS_THRESHOLD:
            break
        qa_feedback = qa_result.feedback

    return await copy_editor_service.edit_email(draft_envelope["data"])
