import math
import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.db.session import get_db
from app.models.prospect import Prospect, ProspectStatus
from app.schemas.prospects import ProspectListItemOut, ProspectListOut, ProspectOutreachUpdate

router = APIRouter(prefix="/api/prospects", tags=["prospects"])

SORT_COLUMNS = {
    "created_at": Prospect.created_at,
    "client": Prospect.first_name,
    "company": Prospect.company_name,
    "status": Prospect.status,
}

# UI-facing status buckets. Kept separate from ProspectStatus so the review
# table can offer a simple All/Completed/Generating/Failed filter without the
# frontend needing to know about every intermediate pipeline stage.
STATUS_FILTERS: dict[str, list[ProspectStatus]] = {
    "completed": [ProspectStatus.COMPLETED],
    "failed": [ProspectStatus.FAILED],
    "generating": [
        ProspectStatus.PENDING,
        ProspectStatus.RESEARCHING,
        ProspectStatus.ANALYZING_OPPORTUNITY,
        ProspectStatus.GENERATING_EMAIL,
    ],
}


def _build_preview(text: str) -> str:
    preview = " ".join(text.split())
    if len(preview) > 120:
        preview = preview[:117].rstrip() + "..."
    return preview


def _to_item(prospect: Prospect) -> ProspectListItemOut:
    outreach = (prospect.outreach or {}).get("data") or {}
    meta = (prospect.outreach or {}).get("meta") or {}

    raw_preview = outreach.get("preview_text") or outreach.get("email_body")
    preview = _build_preview(raw_preview) if raw_preview else None

    return ProspectListItemOut(
        id=prospect.id,
        first_name=prospect.first_name,
        last_name=prospect.last_name,
        title=prospect.title,
        email=prospect.email,
        company_name=prospect.company_name,
        company_website=prospect.company_website,
        linkedin_url=prospect.linkedin_url,
        facebook_url=prospect.facebook_url,
        twitter_url=prospect.twitter_url,
        status=prospect.status,
        failure_reason=prospect.failure_reason,
        created_at=prospect.created_at,
        subject=outreach.get("subject"),
        email_preview=preview,
        email_body=outreach.get("email_body"),
        generated_at=meta.get("generated_at"),
    )


@router.get("", response_model=ProspectListOut)
async def list_prospects(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=255),
    status: Literal["all", "completed", "generating", "failed"] = Query("all"),
    sort: Literal["created_at", "client", "company", "status"] = Query("created_at"),
    order: Literal["asc", "desc"] = Query("desc"),
    db: AsyncSession = Depends(get_db),
) -> ProspectListOut:
    user = await security.get_current_user(request, db)

    filters = [Prospect.user_id == user.id]
    if status != "all":
        filters.append(Prospect.status.in_(STATUS_FILTERS[status]))
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(
            or_(
                Prospect.first_name.ilike(pattern),
                Prospect.last_name.ilike(pattern),
                Prospect.company_name.ilike(pattern),
                Prospect.company_website.ilike(pattern),
                Prospect.outreach["data"]["subject"].astext.ilike(pattern),
            )
        )

    total = (await db.execute(select(func.count()).select_from(Prospect).where(*filters))).scalar_one()

    sort_column = SORT_COLUMNS[sort]
    order_by = sort_column.desc() if order == "desc" else sort_column.asc()

    stmt = (
        select(Prospect)
        .where(*filters)
        .order_by(order_by, Prospect.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    prospects = (await db.execute(stmt)).scalars().all()

    return ProspectListOut(
        items=[_to_item(p) for p in prospects],
        total=total,
        page=page,
        limit=limit,
        total_pages=math.ceil(total / limit) if total else 0,
    )


@router.patch("/{prospect_id}", response_model=ProspectListItemOut)
async def update_prospect_outreach(
    prospect_id: uuid.UUID,
    payload: ProspectOutreachUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ProspectListItemOut:
    user = await security.get_current_user(request, db)

    prospect = await db.get(Prospect, prospect_id)
    if prospect is None or prospect.user_id != user.id:
        raise HTTPException(status_code=404, detail="Email not found.")
    if not prospect.outreach:
        raise HTTPException(status_code=400, detail="This email hasn't been generated yet.")

    subject = payload.subject.strip()
    email_body = payload.email_body.strip()
    if not subject or not email_body:
        raise HTTPException(status_code=400, detail="Subject and email body can't be empty.")

    data = {**prospect.outreach["data"], "subject": subject, "email_body": email_body}
    data["preview_text"] = _build_preview(email_body)
    meta = {**prospect.outreach.get("meta", {}), "edited_at": datetime.now(timezone.utc).isoformat()}
    prospect.outreach = {"data": data, "meta": meta}

    await db.commit()
    await db.refresh(prospect)
    return _to_item(prospect)
