from datetime import datetime, timezone


def make_envelope(data: dict, model_name: str, prompt_version: str) -> dict:
    """Wraps a stage's structured output with traceability metadata before it's
    stored on a Prospect row."""
    return {
        "data": data,
        "meta": {
            "model_name": model_name,
            "prompt_version": prompt_version,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        },
    }
