import sqlite3
import time
from datetime import datetime

DB_PATH = "memory.db"
MAX_RETRIES = 5


def get_connection():
    for attempt in range(MAX_RETRIES):
        try:
            conn = sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA busy_timeout=5000")
            conn.execute("PRAGMA synchronous=NORMAL")
            return conn
        except sqlite3.OperationalError as e:
            if "locked" in str(e) and attempt < MAX_RETRIES - 1:
                time.sleep(0.5)
                continue
            raise
    raise sqlite3.OperationalError("Could not connect to database after retries")


def execute_with_retry(conn, sql, params=None):
    for attempt in range(MAX_RETRIES):
        try:
            cursor = conn.cursor()
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)
            return cursor
        except sqlite3.OperationalError as e:
            if "locked" in str(e) and attempt < MAX_RETRIES - 1:
                time.sleep(0.3)
                continue
            raise


def commit_with_retry(conn):
    for attempt in range(MAX_RETRIES):
        try:
            conn.commit()
            return
        except sqlite3.OperationalError as e:
            if "locked" in str(e) and attempt < MAX_RETRIES - 1:
                time.sleep(0.3)
                continue
            raise


def init_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS memories(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memory_key TEXT,
        memory_value TEXT,
        category TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("PRAGMA table_info(memories)")
    columns = [row[1] for row in cursor.fetchall()]

    if "key" in columns and "memory_key" not in columns:
        cursor.execute('ALTER TABLE memories RENAME COLUMN "key" TO memory_key')
    if "value" in columns and "memory_value" not in columns:
        cursor.execute('ALTER TABLE memories RENAME COLUMN "value" TO memory_value')
    if "category" not in columns:
        cursor.execute("ALTER TABLE memories ADD COLUMN category TEXT DEFAULT 'general'")
    if "created_at" not in columns:
        cursor.execute("ALTER TABLE memories ADD COLUMN created_at TIMESTAMP")
        cursor.execute(
            "UPDATE memories SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"
        )

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversations(
        id TEXT PRIMARY KEY,
        title TEXT DEFAULT 'New conversation',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pinned INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages(
        id TEXT PRIMARY KEY,
        conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings(
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    defaults = {
        "model": "gpt-4",
        "temperature": "0.7",
        "system_prompt": "You are a helpful, knowledgeable AI assistant. You are conversational, concise, and thoughtful in your responses.",
        "memory_enabled": "true",
        "auto_save_memories": "true",
        "theme": "dark",
    }
    for key, value in defaults.items():
        cursor.execute(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (key, value)
        )

    conn.commit()
    conn.close()


def cleanup_old_memories():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM memories
        WHERE memory_key IN ('user', 'assistant')
        AND id NOT IN (
            SELECT id FROM memories
            WHERE memory_key IN ('user', 'assistant')
            ORDER BY id DESC
            LIMIT 50
        )
    """
    )
    conn.commit()
    conn.close()
