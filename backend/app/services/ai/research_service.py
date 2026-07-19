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
    unique_selling_points: list[str]
    likely_pain_points: list[str]
    growth_opportunities: list[str]
    technology_signals: list[str]
    recommended_pitch_angle: str
    confidence_score: float = Field(ge=0, le=1)
    source_urls: list[str]


async def research_prospect(prospect: Prospect) -> dict:
    """Researches one company via web search. Single responsibility: research
    only, no matching or copywriting. Returns a {data, meta} envelope ready to
    store on Prospect.research."""
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
