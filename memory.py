import sqlite3

from database import DB_PATH


def save_memory(key, value):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO memories (memory_key, memory_value)
        VALUES (?, ?)
        """,
        (key, value),
    )

    conn.commit()
    conn.close()


def get_memory(key):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT memory_value
        FROM memories
        WHERE memory_key = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (key,),
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return None

    return row[0]


def get_memories():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT memory_key, memory_value
        FROM memories
        ORDER BY id
        """
    )

    data = cursor.fetchall()
    conn.close()

    return data


def upsert_memory(key, value):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM memories
        WHERE memory_key = ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (key,),
    )

    row = cursor.fetchone()

    if row is None:
        cursor.execute(
            """
            INSERT INTO memories (memory_key, memory_value)
            VALUES (?, ?)
            """,
            (key, value),
        )
    else:
        cursor.execute(
            """
            UPDATE memories
            SET memory_value = ?,
                created_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (value, row[0]),
        )

    conn.commit()
    conn.close()


def build_memory_context():
    memories = get_memories()
    lines = []

    for key, value in memories:
        if key in ("user", "assistant"):
            continue
        lines.append(f"{key}: {value}")

    return "\n".join(lines)


def build_memory_summary():
    memories = get_memories()
    lines = []

    for key, value in memories:
        if key in ("user", "assistant"):
            continue
        lines.append(f"{key}: {value}")

    return "\n".join(lines)


def delete_memory(key):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM memories
        WHERE memory_key = ?
        """,
        (key,),
    )

    conn.commit()
    conn.close()
