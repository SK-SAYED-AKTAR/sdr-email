from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, UserOut
from app.services import crypto, smtp_service

router = APIRouter(prefix="/api", tags=["auth"])

HARDCODED_OTP = "122333"


def _set_session_cookie(response: Response, user_id: str) -> None:
    response.set_cookie(
        security.COOKIE_NAME,
        security.create_access_token(user_id),
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=int(security.TOKEN_TTL.total_seconds()),
        path="/",
    )


@router.post("/signup", response_model=UserOut)
async def signup(payload: SignupRequest, response: Response, db: AsyncSession = Depends(get_db)) -> User:
    if payload.otp != HARDCODED_OTP:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    try:
        smtp_service.verify_login(
            payload.smtp_host, payload.smtp_port, payload.smtp_username, payload.smtp_password
        )
    except smtp_service.SmtpAuthError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    user = User(
        email=payload.email,
        smtp_host=payload.smtp_host,
        smtp_port=payload.smtp_port,
        smtp_username=payload.smtp_username,
        encrypted_smtp_password=crypto.encrypt(payload.smtp_password),
        smtp_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    _set_session_cookie(response, str(user.id))
    return user


@router.post("/login", response_model=UserOut)
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)) -> User:
    if payload.otp != HARDCODED_OTP:
        raise HTTPException(status_code=401, detail="Invalid email or OTP.")

    user = await db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or OTP.")

    _set_session_cookie(response, str(user.id))
    return user


@router.get("/me", response_model=UserOut)
async def me(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    return await security.get_current_user(request, db)


@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(security.COOKIE_NAME, path="/")
    return {"success": True}
