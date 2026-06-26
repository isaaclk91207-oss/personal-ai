from openai import OpenAI, OpenAIError, RateLimitError
from dotenv import load_dotenv
import os

from database import init_database
from memory import build_memory_context, build_memory_summary, save_memory, upsert_memory, delete_memory
from intent_detector import detect_intent
from memory_extractor import extract_memories

load_dotenv()
init_database()

openrouter_key = os.getenv("OPENROUTER_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

if openrouter_key:
    client = OpenAI(
        api_key=openrouter_key,
        base_url="https://openrouter.ai/api/v1",
    )
    model_name = os.getenv("MODEL_NAME", "openai/gpt-4o-mini")
elif openai_key:
    client = OpenAI(
        api_key=openai_key
    )
    model_name = os.getenv("MODEL_NAME", "gpt-4o-mini")
else:
    raise RuntimeError(
        "Set OPENROUTER_API_KEY or OPENAI_API_KEY in your .env file."
    )

memory_context = build_memory_context()

messages = [
    {
        "role": "system",
        "content": f"""
You are a personal AI assistant.

User Memories:

{memory_context}
"""
    }
]

while True:
    user_input = input("You: ")

    if user_input.lower() == "exit":
        break

    save_memory("user", user_input)

    intent_data = detect_intent(user_input)
    intent = intent_data.get("intent")

    if intent == "memory_summary":
        print(build_memory_summary())
        continue

    if intent == "delete_memory":
        key = intent_data.get("key")
        if key:
            delete_memory(key)
            print(f"{key} memory deleted.")
        continue

    if intent == "save_memory":
        extracted = extract_memories(user_input)
        for key, value in extracted.items():
            if value:
                upsert_memory(key, value)
        memory_context = build_memory_context()
        messages[0] = {
            "role": "system",
            "content": f"""
You are a personal AI assistant.

User Memories:

{memory_context}
"""
        }

    messages.append({
        "role": "user",
        "content": user_input
    })

    try:
        print(messages)

        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
        )

        ai_message = response.choices[0].message.content
        messages.append({
            "role": "assistant",
            "content": ai_message
        })
        save_memory("assistant", ai_message)

        print(
            "AI:",
            ai_message
        )
    except RateLimitError as error:
        error_code = getattr(error, "code", None)
        if error_code == "insufficient_quota":
            print("OpenAI API quota is exhausted or billing is not active for this account/project.")
            print("Check your OpenAI billing, project budget, and API key project.")
        else:
            print(f"OpenAI rate limit error: {error}")
    except OpenAIError as error:
        print(f"OpenAI API error: {error}")
