# === main.py ===

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
import re
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

Given CONTEXT of available grocery products:
{context}

And a CUSTOMER QUERY:
{query}

Extract and return the order as a valid JSON list:
[
  {{"productname": "product name", "quantity": "quantity"}},
  ...
]

Rules:
- Default quantity to 1 if not specified.
- Translate any language into English.
- Correct spelling mistakes.
- Only use available products.
- No extra text, only JSON output.
"""
)

CORRECT_PROMPT = PromptTemplate(
    input_variables=["query"],
    template="""
You are a smart corrector.
Fix all spelling mistakes and translate this messy grocery order into clean English text.
Only output the corrected text, no extra explanation.

Messy input:
{query}
"""
)

extract_chain = EXTRACT_PROMPT | llm
correct_chain = CORRECT_PROMPT | llm

# === Helper to clean LLM output ===
def clean_json_output(text: str) -> str:
    text = text.strip()
    text = re.sub(r"```json|```", "", text)  # remove markdown json fences if any
    return text

# === API endpoint ===
@app.post("/process-order/")
async def process_order(req: OrderRequest):
    try:
        query = req.query

        # Step 1: Similarity search from Chroma
        similar_docs = vectordb.similarity_search(query, k=5)

        if not similar_docs:
            corrected_query = correct_chain.invoke({"query": query}).content.strip()
            similar_docs = vectordb.similarity_search(corrected_query, k=5)

            if not similar_docs:
                raise HTTPException(status_code=404, detail="404: No matching products found.")
            else:
                context = "\n".join(doc.page_content for doc in similar_docs)
                inputs = {"context": context, "query": corrected_query}
        else:
            context = "\n".join(doc.page_content for doc in similar_docs)
            inputs = {"context": context, "query": query}

        # Step 2: Ask LLM to extract structured order
        response_raw = extract_chain.invoke(inputs).content.strip()
        response_clean = clean_json_output(response_raw)
        response_json = json.loads(response_clean)

        return {"result": response_json}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
