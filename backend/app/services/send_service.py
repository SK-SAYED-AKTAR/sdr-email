import asyncio
from datetime import datetime, timezone

from app.models.prospect import Prospect
from app.models.user import User
from app.services import crypto, smtp_service


class SendError(Exception):
    """Raised when an outreach email fails to send. Message is safe to show users."""


async def send_prospect_email(prospect: Prospect, user: User) -> None:
    """Sends the prospect's current outreach email through the user's own
    verified SMTP account, and stamps sent_at on success. Does not commit --
    the caller owns the transaction."""
    if not prospect.outreach:
        raise SendError("This email hasn't been generated yet.")

    outreach = prospect.outreach["data"]
    password = crypto.decrypt(user.encrypted_smtp_password)

    try:
        await asyncio.to_thread(
            smtp_service.send_outreach_email,
            user.smtp_host,
            user.smtp_port,
            user.smtp_username,
            password,
            user.smtp_username,
            prospect.email,
            outreach["subject"],
            outreach["email_body"],
        )
    except smtp_service.SmtpAuthError as exc:
        raise SendError(str(exc)) from exc

    prospect.sent_at = datetime.now(timezone.utc)
