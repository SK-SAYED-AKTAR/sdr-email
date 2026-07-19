import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.db.session import get_db
from app.models.csv_upload import CsvUpload
from app.models.prospect import Prospect, ProspectStatus
from app.schemas.prospects import CsvUploadOut, ProspectProgressOut, UploadProgressOut
from app.services import pipeline_service
from app.services.csv_service import CsvValidationError, parse_csv

router = APIRouter(prefix="/api/csv", tags=["csv"])

SAMPLE_CSV_PATH = Path(__file__).resolve().parents[2] / "static" / "sample_prospects.csv"


@router.get("/sample")
async def download_sample_csv(request: Request, db: AsyncSession = Depends(get_db)) -> FileResponse:
    await security.get_current_user(request, db)
    return FileResponse(
        SAMPLE_CSV_PATH, media_type="text/csv", filename="sample_prospects.csv"
    )


@router.post("/upload", response_model=CsvUploadOut)
async def upload_csv(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> CsvUpload:
    user = await security.get_current_user(request, db)

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    raw_bytes = await file.read()

    try:
        rows = parse_csv(raw_bytes)
    except CsvValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    csv_upload = CsvUpload(user_id=user.id, filename=file.filename, row_count=len(rows))
    db.add(csv_upload)
    await db.flush()

    for row in rows:
        db.add(Prospect(csv_upload_id=csv_upload.id, user_id=user.id, status=ProspectStatus.PENDING, **row))

    await db.commit()
    await db.refresh(csv_upload)

    background_tasks.add_task(pipeline_service.process_csv_upload, csv_upload.id, user.id)

    return csv_upload


@router.get("/uploads/{upload_id}/progress", response_model=UploadProgressOut)
async def get_upload_progress(
    upload_id: uuid.UUID, request: Request, db: AsyncSession = Depends(get_db)
) -> UploadProgressOut:
    user = await security.get_current_user(request, db)

    csv_upload = await db.get(CsvUpload, upload_id)
    if csv_upload is None or csv_upload.user_id != user.id:
        raise HTTPException(status_code=404, detail="Upload not found.")

    result = await db.execute(
        select(Prospect).where(Prospect.csv_upload_id == upload_id).order_by(Prospect.created_at)
    )
    prospects = result.scalars().all()

    counts: dict[str, int] = {status.value: 0 for status in ProspectStatus}
    for prospect in prospects:
        counts[prospect.status.value] += 1

    return UploadProgressOut(
        id=csv_upload.id,
        filename=csv_upload.filename,
        total=len(prospects),
        counts=counts,
        prospects=[ProspectProgressOut.model_validate(p) for p in prospects],
    )
