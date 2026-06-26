import os
import json
import uuid
import sqlite3
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI, OpenAIError, RateLimitError
from pydantic import BaseModel, Field

from database import init_database
from memory import (
    build_memory_context,
    save_memory,
    upsert_memory,
    delete_memory as delete_memory_db,
    delete_memory_by_key,
    clear_all_memories,
    get_memories,
    get_structured_memories,
)
from intent_detector import detect_intent
from memory_extractor import extract_memories

load_dotenv()
init_database()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "memory.db")

# OpenAI client setup
openrouter_key = os.getenv("OPENROUTER_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

if openrouter_key:
    client = OpenAI(api_key=openrouter_key, base_url="https://openrouter.ai/api/v1")
    default_model = os.getenv("MODEL_NAME", "openai/gpt-4o-mini")
elif openai_key:
    client = OpenAI(api_key=openai_key)
    default_model = os.getenv("MODEL_NAME", "gpt-4o-mini")
else:
    client = None
    default_model = "gpt-4o-mini"

app = FastAPI(title="Personal AI Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic models ───

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    memory_updated: bool = False
    memory_type: Optional[str] = None

class MemoryUpdate(BaseModel):
    type: Optional[str] = None
    value: Optional[str] = None
    category: Optional[str] = None

class ConversationCreate(BaseModel):
    title: Optional[str] = "New conversation"

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None

class SettingsUpdate(BaseModel):
    model_config = {"populate_by_name": True}
    model: Optional[str] = None
    temperature: Optional[float] = None
    system_prompt: Optional[str] = Field(None, alias="systemPrompt")
    memory_enabled: Optional[bool] = Field(None, alias="memoryEnabled")
    auto_save_memories: Optional[bool] = Field(None, alias="autoSaveMemories")
    theme: Optional[str] = None

# ─── Helpers ───

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn

def update_conversation_time(conv_id):
    conn = get_db()
    conn.execute(
        "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (conv_id,),
    )
    conn.commit()
    conn.close()

# ─── Chat ───

@app.post("/api/chat")
def chat(req: ChatRequest):
    if not client:
        raise HTTPException(status_code=503, detail="No AI API key configured")

    conv_id = req.conversation_id or str(uuid.uuid4())

    # Phase 1: Save user message and build context, then close DB
    msg_id = str(uuid.uuid4())
    conn = get_db()
    try:
        if not req.conversation_id:
            conn.execute(
                "INSERT OR IGNORE INTO conversations (id, title) VALUES (?, ?)",
                (conv_id, req.message[:50]),
            )
        conn.execute(
            "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)",
            (msg_id, conv_id, req.message),
        )
        cursor = conn.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY timestamp",
            (conv_id,),
        )
        history = cursor.fetchall()
        conn.commit()
    finally:
        conn.close()

    save_memory("user", req.message)
    memory_context = build_memory_context()

    # Phase 2: Build messages and call LLM (no DB connection held)
    system_prompt = f"""You are a personal AI assistant.

User Memories:
{memory_context}
"""
    messages = [{"role": "system", "content": system_prompt}]
    for h in history:
        messages.append({"role": h["role"], "content": h["content"]})

    memory_updated = False
    memory_type = None
    try:
        intent_data = detect_intent(req.message)
        intent = intent_data.get("intent")
        if intent == "save_memory":
            extracted = extract_memories(req.message)
            for key, value in extracted.items():
                if value:
                    categories = {
                        "name": "personal", "job": "fact", "goal": "context",
                        "skills": "fact", "projects": "context",
                        "learning_focus": "preference", "favorite_language": "preference",
                        "current_role": "fact", "career_goal": "context",
                    }
                    upsert_memory(key, value, categories.get(key, "general"))
                    memory_updated = True
                    memory_type = key
    except Exception:
        pass

    try:
        response = client.chat.completions.create(
            model=default_model,
            messages=messages,
        )
        reply = response.choices[0].message.content
    except (RateLimitError, OpenAIError) as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Phase 3: Save AI response (new connection)
    ai_msg_id = str(uuid.uuid4())
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, 'assistant', ?)",
            (ai_msg_id, conv_id, reply),
        )
        conn.execute(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (conv_id,),
        )
        conn.commit()
    finally:
        conn.close()

    save_memory("assistant", reply)

    return ChatResponse(
        reply=reply,
        conversation_id=conv_id,
        memory_updated=memory_updated,
        memory_type=memory_type,
    )

# ─── Conversations ───

@app.get("/api/conversations")
def list_conversations(search: Optional[str] = None):
    conn = get_db()
    if search:
        cursor = conn.execute(
            """SELECT DISTINCT c.id, c.title, c.created_at, c.updated_at, c.pinned
               FROM conversations c
               LEFT JOIN messages m ON m.conversation_id = c.id
               WHERE c.title LIKE ? OR m.content LIKE ?
               ORDER BY c.pinned DESC, c.updated_at DESC""",
            (f"%{search}%", f"%{search}%"),
        )
    else:
        cursor = conn.execute(
            "SELECT id, title, created_at, updated_at, pinned FROM conversations ORDER BY pinned DESC, updated_at DESC"
        )
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "title": row["title"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
            "pinned": bool(row["pinned"]),
        }
        for row in rows
    ]

@app.get("/api/conversations/{conv_id}")
def get_conversation(conv_id: str):
    conn = get_db()
    cursor = conn.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
    conv = cursor.fetchone()
    if not conv:
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    cursor = conn.execute(
        "SELECT id, role, content, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp",
        (conv_id,),
    )
    messages = cursor.fetchall()
    conn.close()
    return {
        "id": conv["id"],
        "title": conv["title"],
        "createdAt": conv["created_at"],
        "updatedAt": conv["updated_at"],
        "pinned": bool(conv["pinned"]),
        "messages": [
            {
                "id": row["id"],
                "role": row["role"],
                "content": row["content"],
                "timestamp": row["timestamp"],
            }
            for row in messages
        ],
    }

@app.post("/api/conversations")
def create_conversation(body: ConversationCreate):
    conv_id = str(uuid.uuid4())
    conn = get_db()
    conn.execute(
        "INSERT INTO conversations (id, title) VALUES (?, ?)",
        (conv_id, body.title),
    )
    conn.commit()
    conn.close()
    return {"id": conv_id, "title": body.title}

@app.put("/api/conversations/{conv_id}")
def update_conversation(conv_id: str, body: ConversationUpdate):
    conn = get_db()
    cursor = conn.execute("SELECT id FROM conversations WHERE id = ?", (conv_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    if body.title is not None:
        conn.execute("UPDATE conversations SET title = ? WHERE id = ?", (body.title, conv_id))
    if body.pinned is not None:
        conn.execute(
            "UPDATE conversations SET pinned = ? WHERE id = ?",
            (1 if body.pinned else 0, conv_id),
        )
    conn.execute(
        "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (conv_id,),
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.delete("/api/conversations/{conv_id}")
def delete_conversation(conv_id: str):
    conn = get_db()
    conn.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))
    conn.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.delete("/api/conversations")
def clear_all_conversations():
    conn = get_db()
    conn.execute("DELETE FROM messages")
    conn.execute("DELETE FROM conversations")
    conn.commit()
    conn.close()
    return {"ok": True}

# ─── Memories ───

@app.get("/api/memories")
def list_memories(search: Optional[str] = None, category: Optional[str] = None):
    memories = get_memories()
    if search:
        q = search.lower()
        memories = [
            m for m in memories if q in m["type"].lower() or q in m["value"].lower()
        ]
    if category and category != "all":
        memories = [m for m in memories if m["category"] == category]
    return memories

@app.put("/api/memories/{memory_id}")
def update_memory(memory_id: int, body: MemoryUpdate):
    conn = get_db()
    cursor = conn.execute("SELECT id FROM memories WHERE id = ?", (memory_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Memory not found")

    if body.type is not None:
        conn.execute(
            "UPDATE memories SET memory_key = ? WHERE id = ?",
            (body.type.lower(), memory_id),
        )
    if body.value is not None:
        conn.execute(
            "UPDATE memories SET memory_value = ? WHERE id = ?",
            (body.value, memory_id),
        )
    if body.category is not None:
        conn.execute(
            "UPDATE memories SET category = ? WHERE id = ?",
            (body.category, memory_id),
        )
    conn.execute(
        "UPDATE memories SET created_at = CURRENT_TIMESTAMP WHERE id = ?",
        (memory_id,),
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.delete("/api/memories/{memory_id}")
def delete_memory_endpoint(memory_id: int):
    delete_memory_db(memory_id)
    return {"ok": True}

@app.delete("/api/memories")
def clear_memories():
    clear_all_memories()
    return {"ok": True}

# ─── Settings ───

@app.get("/api/settings")
def get_settings():
    conn = get_db()
    cursor = conn.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    conn.close()
    settings = {row["key"]: row["value"] for row in rows}
    return {
        "model": settings.get("model", "gpt-4"),
        "temperature": float(settings.get("temperature", 0.7)),
        "systemPrompt": settings.get("system_prompt", ""),
        "memoryEnabled": settings.get("memory_enabled", "true") == "true",
        "autoSaveMemories": settings.get("auto_save_memories", "true") == "true",
        "theme": settings.get("theme", "dark"),
    }

@app.put("/api/settings")
def update_settings(body: SettingsUpdate):
    conn = get_db()
    if body.model is not None:
        conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('model', ?)", (body.model,))
    if body.temperature is not None:
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('temperature', ?)",
            (str(body.temperature),),
        )
    if body.system_prompt is not None:
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('system_prompt', ?)",
            (body.system_prompt,),
        )
    if body.memory_enabled is not None:
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('memory_enabled', ?)",
            ("true" if body.memory_enabled else "false",),
        )
    if body.auto_save_memories is not None:
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('auto_save_memories', ?)",
            ("true" if body.auto_save_memories else "false",),
        )
    if body.theme is not None:
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)",
            (body.theme,),
        )
    conn.commit()
    conn.close()
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
