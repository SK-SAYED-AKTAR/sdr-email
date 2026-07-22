import uuid

from app.db.session import SessionLocal
from app.services import seller_knowledge_service
from app.services.ai.seller_intelligence_service import SellerIntelligence

# Empty, zero-confidence profile returned when the user hasn't generated
# Company Knowledge yet (Settings -> Company Knowledge), so the pipeline can
# always run. Every prompt is instructed to treat empty/"Unknown" seller
# knowledge with confidence 0 as "not yet configured" and hedge accordingly.
PLACEHOLDER_SELLER_KNOWLEDGE = SellerIntelligence(
    company_summary="Unknown",
    product_summary="Unknown",
    ideal_customer_profile=[],
    primary_industries=[],
    business_problems_solved=[],
    core_capabilities=[],
    differentiators=[],
    competitive_advantages=[],
    pricing_position="Unknown",
    buyer_personas=[],
    cost_savings=[],
    time_savings=[],
    automation_opportunities=[],
    customer_outcomes=[],
    proof_points=[],
    discovery_questions=[],
    common_objections=[],
    why_customers_switch=[],
    recommended_pitch="Unknown",
    confidence=0.0,
)


async def get_seller_knowledge(user_id: uuid.UUID) -> SellerIntelligence:
    """Single access point every pipeline stage uses for seller knowledge.
    Looks up the user's generated Company Knowledge profile (Settings ->
    Company Knowledge) and falls back to an empty placeholder if they haven't
    generated one yet."""
    async with SessionLocal() as db:
        profile = await seller_knowledge_service.get_or_create_profile(db, user_id)

    if profile.knowledge_json is None:
        return PLACEHOLDER_SELLER_KNOWLEDGE

    return SellerIntelligence(**profile.knowledge_json["data"])
