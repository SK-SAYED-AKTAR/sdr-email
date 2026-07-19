import logging
import smtplib
import ssl
from email.message import EmailMessage

logger = logging.getLogger(__name__)

SUCCESS_SUBJECT = "\U0001f389 SMTP Connection Successful"
SUCCESS_BODY = (
    "Congratulations!\n\n"
    "Your SMTP connection has been verified successfully.\n"
    "Your email account is now ready to send emails through our platform.\n\n"
    "You can now return to the application and complete your signup.\n\n"
    "Thank you."
)


class SmtpAuthError(Exception):
    """Raised whenever SMTP connection, auth, or sending fails. Message is safe to show to users."""


def _connect(host: str, port: int, username: str, password: str) -> smtplib.SMTP:
    context = ssl.create_default_context()
    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=10, context=context)
    else:
        server = smtplib.SMTP(host, port, timeout=10)
        server.ehlo()
        if server.has_extn("starttls"):
            server.starttls(context=context)
            server.ehlo()
    server.login(username, password)
    return server


def verify_login(host: str, port: int, username: str, password: str) -> None:
    """Connects and authenticates only. Used to re-verify credentials server-side before creating an account."""
    try:
        server = _connect(host, port, username, password)
        server.quit()
    except Exception:
        logger.exception("SMTP verification failed for host=%s port=%s", host, port)
        raise SmtpAuthError("Could not connect or authenticate with the provided SMTP details.")


def send_test_email(host: str, port: int, username: str, password: str, to_email: str) -> None:
    """Connects, authenticates, and sends the success email in a single session."""
    message = EmailMessage()
    message["Subject"] = SUCCESS_SUBJECT
    message["From"] = to_email
    message["To"] = to_email
    message.set_content(SUCCESS_BODY)

    try:
        server = _connect(host, port, username, password)
        server.send_message(message)
        server.quit()
    except Exception:
        logger.exception("SMTP send failed for host=%s port=%s", host, port)
        raise SmtpAuthError("Could not connect or authenticate with the provided SMTP details.")
