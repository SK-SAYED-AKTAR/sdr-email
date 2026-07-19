from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User

ALGORITHM = "HS256"
COOKIE_NAME = "session"
TOKEN_TTL = timedelta(days=7)


def create_access_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + TOKEN_TTL}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def _decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return payload["sub"]


async def get_current_user(request: Request, db: AsyncSession) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    user = await db.get(User, _decode_access_token(token))
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return user
