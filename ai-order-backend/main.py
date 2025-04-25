from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import os

from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains.question_answering import load_qa_chain
from langchain.text_splitter import CharacterTextSplitter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change this to ["http://localhost:8080"] if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductRequest(BaseModel):
    query: str

@app.on_event("startup")
def init_db():
    conn = sqlite3.connect("products.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT
        )
    ''')
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        cursor.executemany(
            "INSERT INTO products (name, description) VALUES (?, ?)",
            [
                ("Rice", "5kg pack of basmati rice"),
                ("Wheat Flour", "1kg whole wheat flour"),
                ("Sugar", "Refined white sugar, 1kg"),
                ("Salt", "Iodized cooking salt, 1kg"),
                ("Tomato", "Fresh red tomatoes")
            ]
        )
        conn.commit()
    conn.close()

def get_llm():
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise ValueError("Missing OpenAI API key")
    return ChatOpenAI(model="gpt-4", api_key=openai_key)

@app.post("/ask/")
def ask(req: ProductRequest):
    try:
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            raise ValueError("Missing OpenAI API key")

        # Get data from DB
        conn = sqlite3.connect("products.db")
        cursor = conn.cursor()
        cursor.execute("SELECT name, description FROM products")
        rows = cursor.fetchall()
        conn.close()

        # Format and split text
        data = "\n".join([f"{name}: {desc}" for name, desc in rows])
        splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        texts = splitter.split_text(data)

        # Embed and query
        embeddings = OpenAIEmbeddings(api_key=openai_key)
        db = Chroma.from_texts(texts, embedding=embeddings)
        docs = db.similarity_search(req.query)

        llm = get_llm()
        chain = load_qa_chain(llm, chain_type="stuff")
        response = chain.run(input_documents=docs, question=req.query)

        return {"result": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
def get_products():
    try:
        conn = sqlite3.connect("products.db")
        cursor = conn.cursor()
        cursor.execute("SELECT productname, price, image_url, quantity, category, subcategory FROM products")
        rows = cursor.fetchall()
        conn.close()

        # Convert rows to dict
        keys = ["productname", "price", "image_url", "quantity", "category", "subcategory"]
        products = [dict(zip(keys, row)) for row in rows]

        return {"products": products}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
