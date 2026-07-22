import json

from pydantic import BaseModel, Field

from app.models.prospect import Prospect
from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.envelope import make_envelope
from app.services.ai.prompts import load_prompt, prompt_version
from app.services.ai.seller_intelligence_service import SellerIntelligence

PROMPT_NAME = "business_opportunity_agent"


class BusinessOpportunityAnalysis(BaseModel):
    business_goal: str
    primary_problem: str
    supporting_evidence: str
    business_impact: str
    recommended_capability: str
    expected_outcome: str
    recommended_conversation_angle: str
    recommended_cta: str
    confidence: float = Field(ge=0, le=1)


async def analyze_opportunity(
    prospect: Prospect, prospect_intelligence: dict, seller_knowledge: SellerIntelligence
) -> dict:
    """Decides why this prospect should buy this product. This is the
    reasoning foundation every outreach channel builds on — it never writes
    copy. Single responsibility: business reasoning only. Returns a {data,
    meta} envelope ready to store on Prospect.opportunity."""
    client = get_openai_client()

    input_payload = {
        "prospect_row": {
            "first_name": prospect.first_name,
            "last_name": prospect.last_name,
            "title": prospect.title,
            "company_name": prospect.company_name,
        },
        "prospect_intelligence": prospect_intelligence,
        "seller_knowledge": seller_knowledge.model_dump(),
    }

    response = await client.responses.parse(
        model=MODEL_NAME,
        instructions=load_prompt(PROMPT_NAME),
        input=json.dumps(input_payload),
        text_format=BusinessOpportunityAnalysis,
    )

    result = response.output_parsed
    if result is None:
        raise ValueError("Business opportunity agent returned no structured output")

    return make_envelope(result.model_dump(), MODEL_NAME, prompt_version(PROMPT_NAME))
