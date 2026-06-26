import sqlite3
from database import DB_PATH, get_connection


def save_memory(key, value, category="general"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO memories (memory_key, memory_value, category) VALUES (?, ?, ?)",
        (key, value, category),
    )
    conn.commit()
    conn.close()


def get_memory(key):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT memory_value FROM memories WHERE memory_key = ? ORDER BY id DESC LIMIT 1",
        (key,),
    )
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None


def get_memories():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, memory_key, memory_value, category, created_at FROM memories ORDER BY id"
    )
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": row["id"],
            "type": row["memory_key"].capitalize() if row["memory_key"] else "General",
            "value": row["memory_value"],
            "category": row["category"] or "general",
            "createdAt": row["created_at"],
        }
        for row in rows
    ]


def get_structured_memories():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT memory_key, memory_value FROM memories WHERE memory_key NOT IN ('user', 'assistant') ORDER BY id"
    )
    rows = cursor.fetchall()
    conn.close()
    return {row["memory_key"]: row["memory_value"] for row in rows}


def upsert_memory(key, value, category="general"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM memories WHERE memory_key = ? ORDER BY id DESC LIMIT 1",
        (key,),
    )
    row = cursor.fetchone()

    if row is None:
        cursor.execute(
            "INSERT INTO memories (memory_key, memory_value, category) VALUES (?, ?, ?)",
            (key, value, category),
        )
    else:
        cursor.execute(
            "UPDATE memories SET memory_value = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?",
            (value, row["id"]),
        )

    conn.commit()
    conn.close()


def delete_memory(memory_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
    conn.commit()
    conn.close()


def delete_memory_by_key(key):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memories WHERE memory_key = ?", (key,))
    conn.commit()
    conn.close()


def clear_all_memories():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memories")
    conn.commit()
    conn.close()


def build_memory_context():
    memories = get_structured_memories()
    lines = [f"{key}: {value}" for key, value in memories.items()]
    return "\n".join(lines)


def build_memory_summary():
    return build_memory_context()
