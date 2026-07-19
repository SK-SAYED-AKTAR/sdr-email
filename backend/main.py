from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.bootstrap import ensure_database_exists
from app.routers import auth, csv, smtp


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database_exists()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(smtp.router)
app.include_router(auth.router)
app.include_router(csv.router)
