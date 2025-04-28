# === main.py ===

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
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
- Pick product names only from CONTEXT.
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

        # Step 1: Correct spelling, translate to English
        corrected_query = correct_chain.invoke({"query": query}).content.strip()

        # Step 2: Split query into individual grocery items
        items = split_items(corrected_query)

        final_results = []

        # Step 3: Search and extract for each item
        for item in items:
            similar_docs = vectordb.similarity_search(item, k=5)
            if similar_docs:
                context = "\n".join(doc.page_content for doc in similar_docs)
                inputs = {"context": context, "query": item}
                formatted_prompt = EXTRACT_PROMPT.format_prompt(**inputs)
                response_raw = llm.invoke(formatted_prompt).content.strip()
                response_raw = response_raw.replace("```json", "").replace("```", "").strip()
                try:
                    response_json = json.loads(response_raw)
                    if isinstance(response_json, list):
                        final_results.extend(response_json)
                except json.JSONDecodeError:
                    continue  # skip invalid parse

        if not final_results:
            raise HTTPException(status_code=404, detail="No matching products found.")

        return {"result": final_results}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
