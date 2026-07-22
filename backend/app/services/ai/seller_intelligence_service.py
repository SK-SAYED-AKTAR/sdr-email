import json

from pydantic import BaseModel, Field

from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.envelope import make_envelope
from app.services.ai.prompts import load_prompt, prompt_version

PROMPT_NAME = "seller_intelligence"


class SellerIntelligence(BaseModel):
    company_summary: str
    product_summary: str
    ideal_customer_profile: list[str]
    primary_industries: list[str]
    business_problems_solved: list[str]
    core_capabilities: list[str]
    differentiators: list[str]
    competitive_advantages: list[str]
    pricing_position: str
    buyer_personas: list[str]
    cost_savings: list[str]
    time_savings: list[str]
    automation_opportunities: list[str]
    customer_outcomes: list[str]
    proof_points: list[str]
    discovery_questions: list[str]
    common_objections: list[str]
    why_customers_switch: list[str]
    recommended_pitch: str
    confidence: float = Field(ge=0, le=1)


async def generate_seller_intelligence(
    company_website: str | None,
    product_website: str | None,
    additional_notes: str | None,
    documents: list[tuple[str, str]],
) -> dict:
    """Understands the seller (our customer) from whatever sources are
    available, as structured sales knowledge (ICP, problems solved, ROI
    drivers, objections, proof points) rather than a marketing summary. Single
    responsibility: understanding the seller only — never matching, never
    email copy. Returns a {data, meta} envelope ready to store on
    SellerKnowledge.knowledge_json. No DB access; the caller persists this."""
    client = get_openai_client()

    input_payload = {
        "company_website": company_website or "Not provided",
        "product_website": product_website or "Not provided",
        "additional_notes": additional_notes or "Not provided",
        "documents": [{"filename": name, "content": text} for name, text in documents],
    }

    response = await client.responses.parse(
        model=MODEL_NAME,
        instructions=load_prompt(PROMPT_NAME),
        input=json.dumps(input_payload),
        tools=[{"type": "web_search"}],
        text_format=SellerIntelligence,
    )

    result = response.output_parsed
    if result is None:
        raise ValueError("Seller intelligence agent returned no structured output")

    return make_envelope(result.model_dump(), MODEL_NAME, prompt_version(PROMPT_NAME))
