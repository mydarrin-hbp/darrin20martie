import sqlite3

conn = sqlite3.connect("mydarrin.db")
cur = conn.cursor()

cur.execute("UPDATE users SET role = ? WHERE email = ?", ("ADMIN", "test.auth@example.com"))
conn.commit()

print("UPDATED")

rows = cur.execute(
    "SELECT id, email, role, verification_status FROM users WHERE email = ?",
    ("test.auth@example.com",),
).fetchall()

print(rows)

conn.close()
