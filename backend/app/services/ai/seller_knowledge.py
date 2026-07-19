import uuid

from pydantic import BaseModel


class SellerKnowledge(BaseModel):
    """
    What the Matching and Email services know about the seller (our customer)
    and their product. Consumed as data, never embedded directly into prompts,
    so the source can change without touching those services.

    Today this always comes back as a placeholder — there is no onboarding UI
    yet to build it from a company website, product docs, a PDF brochure, a
    pitch deck, or freeform notes. When that exists, `get_seller_knowledge`
    below is the only place that needs to change: it should look up a
    persisted profile (e.g. a `seller_knowledge_base` table keyed by user_id)
    and fall back to this placeholder if the user hasn't completed onboarding.
    """

    company_name: str
    product_name: str
    product_description: str
    value_proposition: str
    target_customer: str
    notes: str
    is_placeholder: bool = False


PLACEHOLDER_SELLER_KNOWLEDGE = SellerKnowledge(
    company_name="Unknown",
    product_name="Unknown",
    product_description="Not yet configured. The seller has not completed onboarding.",
    value_proposition="Unknown",
    target_customer="Unknown",
    notes="Seller knowledge base is not yet implemented. Treat all seller-side claims as unavailable.",
    is_placeholder=True,
)


async def get_seller_knowledge(user_id: uuid.UUID) -> SellerKnowledge:
    return PLACEHOLDER_SELLER_KNOWLEDGE
