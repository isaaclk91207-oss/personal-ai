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


def extract_memories(user_message):
    client, model_name = create_client()

    response = client.chat.completions.create(
        model=model_name,

        response_format={"type": "json_object"},

        messages=[
            {
                "role": "system",
                "content": """
You are a memory extraction engine.

Extract only useful long-term user information.

Allowed keys:
- name
- job
- goal
- skills
- projects
- learning_focus
- favorite_language
- current_role
- career_goal

Return JSON only.
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
