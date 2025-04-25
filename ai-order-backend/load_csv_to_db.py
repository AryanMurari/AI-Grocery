import sqlite3
import csv

# Connect to SQLite database
conn = sqlite3.connect("products.db")
cursor = conn.cursor()

# Drop the existing table if it exists
cursor.execute("DROP TABLE IF EXISTS products")

# Create table with updated structure
cursor.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productname TEXT,
        price REAL,
        image_url TEXT,
        quantity TEXT,
        category TEXT,
        subcategory TEXT
    )
""")

# Load CSV and insert data
with open("products.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    products = [
        (
            row["ProductName"],
            float(row["Price"]),
            row["Image_Url"],
            row["Quantity"],
            row["Category"],
            row["SubCategory"]
        )
        for row in reader
    ]

# Insert data into the new table
cursor.executemany("""
    INSERT INTO products (productname, price, image_url, quantity, category, subcategory)
    VALUES (?, ?, ?, ?, ?, ?)
""", products)

# Commit and close
conn.commit()
conn.close()

print("✅ Done: products.db updated from products.csv")
