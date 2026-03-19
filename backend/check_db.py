import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parent / "mydarrin.db"

conn = sqlite3.connect(DATABASE_PATH)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cur.fetchall()

print("Tables in database:")
print(tables)

for table_name in ["domains", "categories", "subcategories", "services"]:
    print(f"\n{table_name} table content:")
    cur.execute(f"SELECT * FROM {table_name}")
    print(cur.fetchall())

conn.close()