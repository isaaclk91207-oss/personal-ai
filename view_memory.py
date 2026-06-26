import sqlite3

from database import DB_PATH, init_database


def main():
    init_database()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]

    if not tables:
        print("No tables found in memory.db")
        conn.close()
        return

    print("Tables:")
    for table in tables:
        print(f"- {table}")

    if "memories" not in tables:
        conn.close()
        return

    cursor.execute(
        """
        SELECT id, memory_key, memory_value, created_at
        FROM memories
        ORDER BY id
        """
    )
    rows = cursor.fetchall()

    print("\nMemories:")
    if not rows:
        print("No memories saved yet.")
    else:
        for row_id, key, value, created_at in rows:
            print(f"{row_id}. [{created_at}] {key}: {value}")

    conn.close()


if __name__ == "__main__":
    main()
