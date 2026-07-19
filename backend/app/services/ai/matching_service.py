import json

from pydantic import BaseModel, Field

from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.envelope import make_envelope
from app.services.ai.prompts import load_prompt, prompt_version
from app.services.ai.seller_knowledge import SellerKnowledge

PROMPT_NAME = "matching_agent"


class SalesStrategy(BaseModel):
    fit_reasoning: str
    recommended_angle: str
    most_relevant_pain_point: str
    best_feature_to_emphasize: str
    confidence_score: float = Field(ge=0, le=1)
    supporting_reasoning: str


async def match_prospect(prospect_intelligence: dict, seller_knowledge: SellerKnowledge) -> dict:
    """Connects seller knowledge with prospect intelligence into a sales
    strategy. Single responsibility: strategy only, never email copy. Returns
    a {data, meta} envelope ready to store on Prospect.matching."""
    client = get_openai_client()

    input_payload = {
        "seller_knowledge": seller_knowledge.model_dump(),
        "prospect_intelligence": prospect_intelligence,
    }

    response = await client.responses.parse(
        model=MODEL_NAME,
        instructions=load_prompt(PROMPT_NAME),
        input=json.dumps(input_payload),
        text_format=SalesStrategy,
    )

    result = response.output_parsed
    if result is None:
        raise ValueError("Matching agent returned no structured output")

    return make_envelope(result.model_dump(), MODEL_NAME, prompt_version(PROMPT_NAME))
