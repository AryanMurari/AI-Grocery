# === main.py ===

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import os
import json
import sqlite3
import base64
from io import BytesIO
from PIL import Image
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

# Initialize OpenAI client for direct API calls
import openai
import tempfile
import shutil
openai_client = openai.OpenAI(api_key=openai_key)

# === Define Prompts ===
EXTRACT_PROMPT = PromptTemplate(
    input_variables=["context", "query"],
    template="""
You are an AI grocery assistant.
Given the CONTEXT of available grocery products with their metadata:
{context}

And a CUSTOMER QUERY:
{query}

Extract and return the order as a valid JSON list:
[
  {{
    "productname": "product name",
    "quantity": numeric_quantity_only,
    "metadata": {{
      "packSize": "pack size from metadata",
      "price": "price from metadata",
      "category": "category from metadata",
      "subcategory": "subcategory from metadata"
    }}
  }},
  ...
]

Rules:
- Pick product names EXACTLY as they appear in CONTEXT.
- Use the metadata information (packSize, price, category, subcategory) exactly as provided in the context.
- For quantity, ONLY return the numeric value (e.g., "1" not "1 kg"). Units are already specified in packSize.
- Be precise with product matching:
  * IMPORTANT: You MUST return a product for each item in the query. Never return an empty array.
  * If a user asks for a generic product (e.g., "milk"), ONLY return the most basic version of that product.
  * For "milk" without specifying a quantity, look for regular dairy milk products like "GoodLife UHT Treated Toned Milk".
  * Check the product name and metadata to ensure you're returning the correct product:
    - For "milk", prioritize products with "Milk" in the subcategory and avoid products like "Coconut Milk".
    - For "milk", look for regular dairy milk products like "Toned Milk" or "Full Cream Milk".
    - Do NOT return specialty milks like "Coconut Milk", "Almond Milk", or "Soy Milk" when the user just asks for "milk".
  * If a user asks for a generic product like  for example "toothpaste", only return ONE basic option, not all available variants.
  * Only return specific variants if the user explicitly asks for them (e.g., "coconut milk" or "colgate toothpaste").
- Handle quantities intelligently:
  * If a customer asks for a quantity that doesn't match available package sizes, suggest combinations of available packages.
  * For example, if they ask for 7kg of onions and you have "Onion" with packSize "5 kg" and "Onion" with packSize "2 kg", 
    return TWO items: one with packSize "5 kg" and quantity "1", and another with packSize "2 kg" and quantity "1".
  * IMPORTANT: The quantity field should represent how many packages the customer needs, NOT the weight or volume.
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
@app.post("/upload-audio/")
async def upload_audio(audio: UploadFile = File(...)):
    try:
        print(f"Received audio upload: {audio.filename}")
        
        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            # Copy the uploaded file to the temporary file
            shutil.copyfileobj(audio.file, temp_audio)
            temp_audio_path = temp_audio.name
        
        print(f"Saved audio to temporary file: {temp_audio_path}")
        
        try:
            # Open the temporary file and transcribe using Whisper API
            print("Calling OpenAI Whisper API...")
            with open(temp_audio_path, "rb") as audio_file:
                # Using 'en' as default language, but the API will still detect other languages
                # ISO-639-1 codes for supported languages: 
                # en (English), ta (Tamil), te (Telugu), hi (Hindi), gu (Gujarati)
                response = openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    # Removed 'auto' as it's not valid - Whisper will still auto-detect languages
                )
            
            print("Whisper API call successful")
            
            # Extract the transcribed text
            transcribed_text = response.text
            print(f"Transcribed text: {transcribed_text}")
            
            return {"transcribedText": transcribed_text}
        except Exception as api_error:
            print(f"OpenAI Whisper API error: {str(api_error)}")
            raise HTTPException(status_code=500, detail=f"OpenAI Whisper API error: {str(api_error)}")
        finally:
            # Clean up the temporary file
            import os
            os.unlink(temp_audio_path)
    except Exception as e:
        print(f"Audio processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")

@app.post("/upload-image/")
async def upload_image(image: UploadFile = File(...)):
    try:
        print(f"Received image upload: {image.filename}")
        
        # Read the image file
        contents = await image.read()
        print(f"Read image content, size: {len(contents)} bytes")
        
        # Convert to base64
        base64_image = base64.b64encode(contents).decode('utf-8')
        print(f"Converted image to base64, length: {len(base64_image)}")
        
        try:
            # Call OpenAI Vision API using the client directly
            print("Calling OpenAI Vision API...")
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract grocery items from this handwritten or printed list. Format as a simple text list."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ]
                    }
                ],
                max_tokens=300
            )
            print("OpenAI API call successful")
            
            # Extract the text from the response
            extracted_text = response.choices[0].message.content
            print(f"Extracted text: {extracted_text}")
            
            return {"extractedText": extracted_text}
        except Exception as api_error:
            print(f"OpenAI API error: {str(api_error)}")
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(api_error)}")
    except Exception as e:
        print(f"Image processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")


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
                # Create context with product names and metadata
                context_parts = []
                for doc in similar_docs:
                    product_name = doc.page_content
                    metadata = doc.metadata if hasattr(doc, 'metadata') else {}
                    
                    # Format metadata for context
                    metadata_str = ""
                    if metadata:
                        metadata_str = "\nMetadata:"
                        for key, value in metadata.items():
                            metadata_str += f"\n  {key}: {value}"
                    
                    context_parts.append(f"Product Name: {product_name}{metadata_str}")
                
                context = "\n---\n".join(context_parts)
                print(f"Found {len(similar_docs)} similar documents")
                inputs = {"context": context, "query": item}
                formatted_prompt = EXTRACT_PROMPT.format_prompt(**inputs)
                response_raw = llm.invoke(formatted_prompt).content.strip()
                response_raw = response_raw.replace("```json", "").replace("```", "").strip()
                try:
                    response_json = json.loads(response_raw)
                    print(f"LLM extracted: {json.dumps(response_json, indent=2)}")
                    if isinstance(response_json, list):
                        # Process each product item from LLM response
                        for product_item in response_json:
                            # Check if the product has metadata from LLM
                            if "metadata" in product_item:
                                # Get product name for database lookup to find image URL
                                product_name = product_item["productname"]
                                image_url = ""
                                
                                try:
                                    # Connect to database to get image URL
                                    conn = sqlite3.connect("products.db")
                                    cursor = conn.cursor()
                                    
                                    # Look up the product to get its image URL
                                    cursor.execute(
                                        "SELECT image_url FROM products WHERE lower(productname) LIKE ?", 
                                        (f"%{product_name.lower()}%",)
                                    )
                                    image_result = cursor.fetchone()
                                    
                                    if image_result:
                                        image_url = image_result[0]
                                        print(f"Found image URL for {product_name}")
                                    
                                    conn.close()
                                except Exception as e:
                                    print(f"Error looking up image URL: {e}")
                                
                                # Use the metadata directly from LLM response plus image URL from DB
                                final_results.append({
                                    "productname": product_item["productname"],
                                    "quantity": product_item["quantity"],
                                    "price": product_item["metadata"].get("price", ""),
                                    "image_url": image_url,  # Now we include image URL from database
                                    "category": product_item["metadata"].get("category", ""),
                                    "subcategory": product_item["metadata"].get("subcategory", ""),
                                    "packSize": product_item["metadata"].get("packSize", "")
                                })
                                print(f"Added product with metadata: {product_item['productname']}")
                            else:
                                # Fall back to database lookup if no metadata
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
                                        "SELECT productname, price, image_url, quantity AS packSize, category, subcategory FROM products WHERE lower(productname) LIKE ?", 
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
                                        keys = ["productname", "price", "image_url", "packSize", "category", "subcategory"]
                                        product_data = dict(zip(keys, product_rows[best_match_idx]))
                                        
                                        print(f"Best match: '{product_data['productname']}' with score {best_match_score:.2f}")
                                        
                                        # Add the product data to the result
                                        final_results.append({
                                            "productname": product_data["productname"],
                                            "quantity": product_item["quantity"],
                                            "price": product_data["price"],
                                            "image_url": product_data["image_url"],
                                            "category": product_data["category"],
                                            "subcategory": product_data["subcategory"],
                                            "packSize": product_data["packSize"]
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
        cursor.execute("SELECT productname, price, image_url, quantity AS packSize, category, subcategory FROM products")
        rows = cursor.fetchall()
        conn.close()

        keys = ["productname", "price", "image_url", "packSize", "category", "subcategory"]
        products = [dict(zip(keys, row)) for row in rows]

        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))