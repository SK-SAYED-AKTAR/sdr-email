import json

from pydantic import BaseModel, Field

from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.prompts import load_prompt

PROMPT_NAME = "sales_qa_agent"

QA_PASS_THRESHOLD = 85


class SalesQAResult(BaseModel):
    has_one_clear_pain_point: bool
    explains_why_product_helps: bool
    has_single_cta: bool
    value_proposition_is_obvious: bool
    would_reply: bool
    score: int = Field(ge=0, le=100)
    feedback: str


async def review_draft(draft: dict, business_opportunity: dict) -> SalesQAResult:
    """Scores a drafted email like a sales manager reviewing a rep's work
    before it goes out. Never rewrites, only judges. Not persisted — the
    pipeline uses this to decide whether to regenerate before anything is
    saved to the prospect."""
    client = get_openai_client()

    input_payload = {"draft": draft, "business_opportunity": business_opportunity}

    response = await client.responses.parse(
        model=MODEL_NAME,
        instructions=load_prompt(PROMPT_NAME),
        input=json.dumps(input_payload),
        text_format=SalesQAResult,
    )

    result = response.output_parsed
    if result is None:
        raise ValueError("Sales QA agent returned no structured output")

    return result
