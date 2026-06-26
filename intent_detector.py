from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()


def create_client():
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if openrouter_key:
        return (
            OpenAI(
                api_key=openrouter_key,
                base_url="https://openrouter.ai/api/v1",
            ),
            os.getenv("MODEL_NAME", "openai/gpt-4o-mini"),
        )

    if openai_key:
        return (
            OpenAI(api_key=openai_key),
            os.getenv("MODEL_NAME", "gpt-4o-mini"),
        )

    raise RuntimeError(
        "Set OPENROUTER_API_KEY or OPENAI_API_KEY in your .env file."
    )


def detect_intent(user_message):
    client, model_name = create_client()

    response = client.chat.completions.create(
        model=model_name,

        response_format={"type": "json_object"},

        messages=[
            {
                "role": "system",
                "content": """
You are an intent classifier.

Classify the user's message into one of these intents:
- memory_summary: user asks to recall or summarize saved memories
- delete_memory: user asks to delete a specific memory (include the "key" field with the memory key to delete)
- save_memory: user shares personal information that should be saved as a memory
- normal: regular conversation (no special action needed)

Return JSON with at least an "intent" field.
If intent is "delete_memory", also include a "key" field with the memory key.
"""
            },
            {
                "role": "user",
                "content": user_message
            }
        ]
    )

    content = response.choices[0].message.content

    return json.loads(content)
