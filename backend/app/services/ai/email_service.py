import json

from pydantic import BaseModel

from app.models.prospect import Prospect
from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.envelope import make_envelope
from app.services.ai.prompts import load_prompt, prompt_version
from app.services.ai.seller_intelligence_service import SellerIntelligence

PROMPT_NAME = "email_agent"


class OutreachDraft(BaseModel):
    subject: str
    preview_text: str
    email_body: str
    cta: str


async def generate_outreach(
    prospect: Prospect,
    seller_knowledge: SellerIntelligence,
    prospect_intelligence: dict,
    business_opportunity: dict,
) -> dict:
    """Writes the final cold email. Never decides what to sell — the business
    problem, capability, and angle already come from the Business Opportunity
    Analysis stage. Single responsibility: communication quality only. Returns
    a {data, meta} envelope ready to store on Prospect.outreach."""
    client = get_openai_client()

    input_payload = {
        "prospect_row": {
            "first_name": prospect.first_name,
            "last_name": prospect.last_name,
            "title": prospect.title,
            "company_name": prospect.company_name,
        },
        "seller_knowledge": seller_knowledge.model_dump(),
        "prospect_intelligence": prospect_intelligence,
        "business_opportunity": business_opportunity,
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
