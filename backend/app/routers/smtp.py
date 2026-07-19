from fastapi import APIRouter, HTTPException

from app.schemas.auth import SmtpTestRequest, SmtpTestResponse
from app.services import smtp_service

router = APIRouter(prefix="/api/smtp", tags=["smtp"])


@router.post("/test", response_model=SmtpTestResponse)
def test_smtp(payload: SmtpTestRequest) -> SmtpTestResponse:
    try:
        smtp_service.send_test_email(
            payload.smtp_host,
            payload.smtp_port,
            payload.smtp_username,
            payload.smtp_password,
            payload.company_email,
        )
    except smtp_service.SmtpAuthError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return SmtpTestResponse(success=True, message="SMTP connection verified. Check your inbox.")
