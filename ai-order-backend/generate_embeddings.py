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
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            productname = row.get('ProductName', '').strip()
            quantity = row.get('Quantity', '').strip()

            if productname:
                clean_entry = f"{productname}"
                if quantity:
                    clean_entry += f" {quantity}"

                products.append(clean_entry)

    return products

# 2. Generate embeddings and save into Chroma
def generate_and_save_embeddings():
    # Load products
    print("🔵 Loading products from CSV...")
    products = load_products_from_csv(CSV_FILE)

    if not products:
        raise ValueError("CSV file is empty or improperly formatted!")

    # Initialize OpenAI embeddings
    embeddings = OpenAIEmbeddings(api_key=openai_key)

    # Create Chroma DB
    print("🟢 Creating vector database...")
    vectordb = Chroma.from_texts(products, embedding=embeddings, persist_directory=CHROMA_DIR)

    # Persist (save) the Chroma database
    vectordb.persist()
    print(f"✅ Embeddings generated and saved to '{CHROMA_DIR}/' folder.")

# 3. Run
if __name__ == "__main__":
    generate_and_save_embeddings()
