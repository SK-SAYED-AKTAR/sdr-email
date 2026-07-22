from functools import lru_cache

from openai import AsyncOpenAI

from app.core.config import settings

# The model powering every agent in the pipeline. Centralized here so an
# upgrade only touches one line.
MODEL_NAME = "gpt-5-mini"


@lru_cache
def get_openai_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY, organization=settings.OPENAI_ORG)
