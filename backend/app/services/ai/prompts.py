from functools import lru_cache
from pathlib import Path

PROMPTS_DIR = Path(__file__).resolve().parents[3] / "prompts"

# Bump the version string here whenever a prompt file's meaning changes, so
# stored records stay traceable to the prompt that produced them.
PROMPT_VERSIONS = {
    "research_agent": "v1",
    "matching_agent": "v1",
    "email_agent": "v1",
}


@lru_cache
def load_prompt(name: str) -> str:
    return (PROMPTS_DIR / f"{name}.md").read_text()


def prompt_version(name: str) -> str:
    return PROMPT_VERSIONS[name]
