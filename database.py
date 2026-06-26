import sqlite3


DB_PATH = "memory.db"


def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memories(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_key TEXT,
        memory_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("PRAGMA table_info(memories)")
    columns = [row[1] for row in cursor.fetchall()]

    if "key" in columns and "memory_key" not in columns:
        cursor.execute('ALTER TABLE memories RENAME COLUMN "key" TO memory_key')

    if "value" in columns and "memory_value" not in columns:
        cursor.execute('ALTER TABLE memories RENAME COLUMN "value" TO memory_value')

    cursor.execute("PRAGMA table_info(memories)")
    columns = [row[1] for row in cursor.fetchall()]

    if "created_at" not in columns:
        cursor.execute("ALTER TABLE memories ADD COLUMN created_at TIMESTAMP")
        cursor.execute(
            """
            UPDATE memories
            SET created_at = CURRENT_TIMESTAMP
            WHERE created_at IS NULL
            """
        )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_database()
