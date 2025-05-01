# === main.py ===

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
import sqlite3
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import PromptTemplate
from fastapi.middleware.cors import CORSMiddleware

# === Load environment variables ===
load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    raise ValueError("Missing OPENAI_API_KEY")

# === Setup FastAPI ===
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Request model ===
class OrderRequest(BaseModel):
    query: str

# === Load Chroma DB ===
embeddings = OpenAIEmbeddings(api_key=openai_key)
vectordb = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

# === Initialize LLM ===
llm = ChatOpenAI(model="gpt-4o", api_key=openai_key, temperature=0)

# === Define Prompts ===
EXTRACT_PROMPT = PromptTemplate(
    input_variables=["context", "query"],
    template="""
You are an AI grocery assistant.
Given the CONTEXT of available grocery products:
{context}

And a CUSTOMER QUERY:
{query}

Extract and return the order as a valid JSON list:
[
  {{"productname": "product name", "quantity": "quantity"}},
  ...
]

Rules:
- Pick product names EXACTLY as they appear in CONTEXT.
- Handle quantities intelligently:
  * If a customer asks for a quantity that doesn't match available package sizes, suggest combinations of available packages.
  * For example, if they ask for 7kg of onions and you have "Onion 5 kg" and "Onion 2 kg", suggest both products.
  * If they ask for "1 onion" or "2 onions" (without specifying kg), choose the smallest available package.
  * If they ask for an in-between quantity (e.g., "2.5 kg of onion"), round to the nearest available package size or suggest a combination.
- If quantity not mentioned, default to 1.
- Translate any language to English.
- Fix spelling mistakes.
- Output only pure JSON. No extra text.
"""
)

CORRECT_PROMPT = PromptTemplate(
    input_variables=["query"],
    template="""
You are a smart corrector.
Fix all spelling mistakes and translate the grocery order into clean English.
Only output corrected plain text, no extra explanation.

Messy input:
{query}
"""
)

# === Setup LLM chains ===
correct_chain = CORRECT_PROMPT | llm

# === Helper functions ===
def split_items(text):
    for sep in [",", " and ", " aur ", "&", "\n"]:
        text = text.replace(sep, "|")
    return [item.strip() for item in text.split("|") if item.strip()]

# === API endpoint ===
@app.post("/process-order/")
async def process_order(req: OrderRequest):
    try:
        query = req.query
        print(f"\n=== Processing order: '{query}' ===")

        # Step 1: Correct spelling, translate to English
        corrected_query = correct_chain.invoke({"query": query}).content.strip()
        print(f"Corrected query: '{corrected_query}'")

        # Step 2: Split query into individual grocery items
        items = split_items(corrected_query)
        print(f"Split items: {items}")

        final_results = []

        # Step 3: Search and extract for each item
        for item in items:
            print(f"\nProcessing item: '{item}'")
            similar_docs = vectordb.similarity_search(item, k=5)
            if similar_docs:
                context = "\n".join(doc.page_content for doc in similar_docs)
                print(f"Found {len(similar_docs)} similar documents")
                inputs = {"context": context, "query": item}
                formatted_prompt = EXTRACT_PROMPT.format_prompt(**inputs)
                response_raw = llm.invoke(formatted_prompt).content.strip()
                response_raw = response_raw.replace("```json", "").replace("```", "").strip()
                try:
                    response_json = json.loads(response_raw)
                    print(f"LLM extracted: {json.dumps(response_json, indent=2)}")
                    if isinstance(response_json, list):
                        # Look up the exact product in the database for each extracted item
                        for product_item in response_json:
                            try:
                                # Connect to the database to get exact product details
                                conn = sqlite3.connect("products.db")
                                cursor = conn.cursor()
                                
                                # Extract the base product name without quantity
                                # For example, "Onion 2 kg" -> "Onion"
                                product_words = product_item['productname'].lower().split()
                                base_product_name = product_words[0]  # Usually the first word is the product name
                                
                                print(f"Looking for product with base name: '{base_product_name}'")
                                
                                # Use more flexible matching to find the product
                                cursor.execute(
                                    "SELECT productname, price, image_url, quantity, category, subcategory FROM products WHERE lower(productname) LIKE ?", 
                                    (f"%{base_product_name}%",)
                                )
                                product_rows = cursor.fetchall()
                                
                                if product_rows:
                                    print(f"Found {len(product_rows)} potential matches:")
                                    for i, row in enumerate(product_rows):
                                        print(f"  {i+1}. {row[0]}")
                                    
                                    # Try to find the best match based on the full product name
                                    best_match_idx = 0
                                    best_match_score = 0
                                    
                                    for i, row in enumerate(product_rows):
                                        db_product_name = row[0].lower()
                                        llm_product_name = product_item['productname'].lower()
                                        
                                        # Calculate similarity score (simple word overlap)
                                        db_words = set(db_product_name.split())
                                        llm_words = set(llm_product_name.split())
                                        common_words = db_words.intersection(llm_words)
                                        score = len(common_words) / max(len(db_words), len(llm_words))
                                        
                                        print(f"    Score for '{db_product_name}': {score:.2f}")
                                        
                                        if score > best_match_score:
                                            best_match_score = score
                                            best_match_idx = i
                                    
                                    # Use the best matching product
                                    keys = ["productname", "price", "image_url", "quantity", "category", "subcategory"]
                                    product_data = dict(zip(keys, product_rows[best_match_idx]))
                                    
                                    print(f"Best match: '{product_data['productname']}' with score {best_match_score:.2f}")
                                    
                                    # Add the product data to the result
                                    final_results.append({
                                        "productname": product_data["productname"],
                                        "quantity": product_item["quantity"],
                                        "price": product_data["price"],
                                        "image_url": product_data["image_url"],
                                        "category": product_data["category"],
                                        "subcategory": product_data["subcategory"]
                                    })
                                    print(f"Added product to results: {product_data['productname']}")
                                else:
                                    # If no match, just use the LLM result
                                    final_results.append(product_item)
                                    print(f"No match found for: {product_item['productname']}")
                                
                                conn.close()
                            except Exception as db_error:
                                print(f"Database error: {db_error}")
                                # Fall back to just using the LLM result
                                final_results.append(product_item)
                except json.JSONDecodeError:
                    print(f"Failed to parse JSON: {response_raw}")
                    continue  # skip invalid parse
            else:
                print(f"No similar documents found for '{item}'")

        if not final_results:
            print("No matching products found.")
            raise HTTPException(status_code=404, detail="No matching products found.")

        print(f"\nFinal results: {json.dumps(final_results, indent=2)}")
        return {"result": final_results}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
async def get_products():
    try:
        conn = sqlite3.connect("products.db")
        cursor = conn.cursor()
        cursor.execute("SELECT productname, price, image_url, quantity, category, subcategory FROM products")
        rows = cursor.fetchall()
        conn.close()

        keys = ["productname", "price", "image_url", "quantity", "category", "subcategory"]
        products = [dict(zip(keys, row)) for row in rows]

        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))