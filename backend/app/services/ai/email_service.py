import json

from pydantic import BaseModel

from app.models.prospect import Prospect
from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.envelope import make_envelope
from app.services.ai.prompts import load_prompt, prompt_version
from app.services.ai.seller_knowledge import SellerKnowledge

PROMPT_NAME = "email_agent"


class OutreachDraft(BaseModel):
    subject: str
    email_body: str
    reasoning: str
    cta: str
    tone: str


async def generate_outreach(
    prospect: Prospect,
    prospect_intelligence: dict,
    sales_strategy: dict,
    seller_knowledge: SellerKnowledge,
) -> dict:
    """Writes the final cold email from everything the earlier stages produced.
    Single responsibility: copywriting only. Returns a {data, meta} envelope
    ready to store on Prospect.outreach."""
    client = get_openai_client()

    input_payload = {
        "prospect_row": {
            "first_name": prospect.first_name,
            "last_name": prospect.last_name,
            "title": prospect.title,
            "company_name": prospect.company_name,
            "email": prospect.email,
        },
        "prospect_intelligence": prospect_intelligence,
        "sales_strategy": sales_strategy,
        "seller_knowledge": seller_knowledge.model_dump(),
    }

    response = await client.responses.parse(
        model=MODEL_NAME,
        instructions=load_prompt(PROMPT_NAME),
        input=json.dumps(input_payload),
        text_format=OutreachDraft,
    )

    result = response.output_parsed
    if result is None:
        raise ValueError("Email agent returned no structured output")

    return make_envelope(result.model_dump(), MODEL_NAME, prompt_version(PROMPT_NAME))
