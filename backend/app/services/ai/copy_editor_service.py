import json

from pydantic import BaseModel

from app.services.ai.client import MODEL_NAME, get_openai_client
from app.services.ai.envelope import make_envelope
from app.services.ai.prompts import load_prompt, prompt_version

PROMPT_NAME = "copy_editor_agent"


class EditedEmail(BaseModel):
    subject: str
    preview_text: str
    email_body: str
    cta: str


async def edit_email(draft: dict) -> dict:
    """Line-edits an already-written email for clarity, brevity, and
    readability. Deliberately knows nothing about the prospect, the product,
    or the reasoning behind the email — only how to make it read better.
    Returns a {data, meta} envelope ready to store on Prospect.outreach."""
    client = get_openai_client()

    response = await client.responses.parse(
        model=MODEL_NAME,
        instructions=load_prompt(PROMPT_NAME),
        input=json.dumps(draft),
        text_format=EditedEmail,
    )

    result = response.output_parsed
    if result is None:
        raise ValueError("Copy editor agent returned no structured output")

    return make_envelope(result.model_dump(), MODEL_NAME, prompt_version(PROMPT_NAME))
