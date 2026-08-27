"""
Thin wrapper around Groq client. Centralizes model, JSON mode, timeout, retry.
"""
import json
import time
from groq import Groq
from .config import settings

MODEL = "openai/gpt-oss-120b"  # locked choice, roadmap Section 3 (#7)
MAX_RETRIES = 2
TIMEOUT_SECONDS = 30

_client = Groq(api_key=settings.GROQ_API_KEY, timeout=TIMEOUT_SECONDS)


class GroqCallError(Exception):
    """Raised when Groq call fails after retries, or returns invalid JSON."""


def call_groq_json(messages: list[dict], temperature: float = 0.3) -> dict:
    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            response = _client.chat.completions.create(
                model=MODEL,
                messages=messages,
                temperature=temperature,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content
            return json.loads(raw)
        except json.JSONDecodeError as e:
            last_error = e
            time.sleep(1 * (attempt + 1))
        except Exception as e:
            last_error = e
            time.sleep(1 * (attempt + 1))

    raise GroqCallError(f"Groq call failed after {MAX_RETRIES + 1} attempts: {last_error}")
