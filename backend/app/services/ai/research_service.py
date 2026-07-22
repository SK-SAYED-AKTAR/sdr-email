from pydantic import BaseModel, Field

from app.models.prospect import Prospect
from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.envelope import make_envelope
from app.services.ai.prompts import load_prompt, prompt_version

PROMPT_NAME = "research_agent"


class ProspectIntelligence(BaseModel):
    company_summary: str
    industry: str
    products_services: str
    target_customers: str
    business_model: str
    customer_journey: str
    growth_stage: str
    technology_adoption: str
    sales_maturity: str
    support_maturity: str
    customer_experience_maturity: str
    unique_selling_points: list[str]
    likely_operational_challenges: list[str]
    support_bottlenecks: list[str]
    growth_opportunities: list[str]
    hiring_signals: list[str]
    expansion_signals: list[str]
    technology_signals: list[str]
    ai_adoption_signals: list[str]
    confidence_score: float = Field(ge=0, le=1)
    source_urls: list[str]


async def research_prospect(prospect: Prospect) -> dict:
    """Researches one company via web search, including inferred operational
    signals (growth stage, maturity, bottlenecks). Single responsibility:
    research only, no business reasoning or copywriting. Returns a {data, meta}
    envelope ready to store on Prospect.research."""
    client = get_openai_client()

    contact = f"{prospect.first_name} {prospect.last_name}"
    if prospect.title:
        contact += f", {prospect.title}"

    input_text = "\n".join(
        [
            f"Company name: {prospect.company_name}",
            f"Company website: {prospect.company_website or 'Not provided'}",
            f"Contact: {contact}",
        ]
    )

    response = await client.responses.parse(
        model=MODEL_NAME,
        instructions=load_prompt(PROMPT_NAME),
        input=input_text,
        tools=[{"type": "web_search"}],
        text_format=ProspectIntelligence,
    )

    result = response.output_parsed
    if result is None:
        raise ValueError("Research agent returned no structured output")

    return make_envelope(result.model_dump(), MODEL_NAME, prompt_version(PROMPT_NAME))
