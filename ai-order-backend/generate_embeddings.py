import os
import csv
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# Load .env for OpenAI key
load_dotenv()

# Setup OpenAI API key
openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file!")

# File paths
CSV_FILE = "products.csv"
CHROMA_DIR = "chroma_db"  # consistent folder name

# 1. Read product data from CSV
def load_products_from_csv(filepath):
    products = []
    metadatas = []
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            productname = row.get('ProductName', '').strip()
            packsize = row.get('Quantity', '').strip()
            price = row.get('Price', '').strip()
            category = row.get('Category', '').strip()
            subcategory = row.get('SubCategory', '').strip()

            if productname:
                # Store only the product name in the text field
                products.append(productname)
                
                # Store additional information in metadata
                metadata = {
                    "packSize": packsize,
                    "price": price,
                    "category": category,
                    "subcategory": subcategory
                }
                metadatas.append(metadata)

    return products, metadatas

# 2. Generate embeddings and save into Chroma
def generate_and_save_embeddings():
    # Load products
    print("🔵 Loading products from CSV...")
    products, metadatas = load_products_from_csv(CSV_FILE)

    if not products:
        raise ValueError("CSV file is empty or improperly formatted!")

    # Initialize OpenAI embeddings
    embeddings = OpenAIEmbeddings(api_key=openai_key)

    # Create Chroma DB with metadata
    print("🟢 Creating vector database with separated product names and pack sizes...")
    vectordb = Chroma.from_texts(
        texts=products,
        embedding=embeddings,
        metadatas=metadatas,
        persist_directory=CHROMA_DIR
    )

    # Persist (save) the Chroma database
    vectordb.persist()
    print(f"✅ Embeddings generated and saved to '{CHROMA_DIR}/' folder.")
    print(f"👍 Product names and pack sizes are now separated in the database.")

# 3. Run
if __name__ == "__main__":
    generate_and_save_embeddings()
