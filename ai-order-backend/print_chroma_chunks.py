import os
from langchain_community.vectorstores import Chroma  # Will use this for now but add a note about updating
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup OpenAI API key
openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file!")

# Path to your Chroma DB
CHROMA_DIR = "chroma_db"  # Make sure this matches your actual Chroma DB directory

# Note: For future reference, the Chroma import should be updated to:
# from langchain_chroma import Chroma

def print_chroma_chunks(limit=10, offset=0):
    """
    Print chunks of data from Chroma DB
    
    Args:
        limit: Number of items to print (default: 10)
        offset: Starting position (default: 0)
    """
    # Initialize embeddings
    embeddings = OpenAIEmbeddings(api_key=openai_key)
    
    # Load the existing Chroma DB
    vectordb = Chroma(persist_directory=CHROMA_DIR, embedding_function=embeddings)
    
    # Get collection
    collection = vectordb._collection
    
    # Get total count
    total_count = collection.count()
    print(f"Total documents in Chroma DB: {total_count}")
    
    # Get chunks of data
    if total_count > 0:
        # Get IDs of all documents
        all_ids = collection.get(include=[])["ids"]
        
        # Apply pagination
        chunk_ids = all_ids[offset:offset+limit]
        
        # Get documents by IDs
        results = collection.get(ids=chunk_ids, include=["documents", "metadatas", "embeddings"])
        
        # Print documents
        print(f"\nShowing documents {offset+1} to {min(offset+limit, total_count)} of {total_count}:")
        print("-" * 70)
        
        for i, (doc_id, document) in enumerate(zip(results["ids"], results["documents"])):
            print(f"Document #{offset+i+1} (ID: {doc_id}):")
            print(f"Product Name: {document}")
            
            # Print metadata with better formatting
            if "metadatas" in results and results["metadatas"] and i < len(results["metadatas"]):
                metadata = results["metadatas"][i]
                print("Metadata:")
                if metadata:
                    for key, value in metadata.items():
                        if key == "packSize":
                            print(f"  Pack Size: {value}")
                        else:
                            print(f"  {key.capitalize()}: {value}")
                else:
                    print("  None")
                
            # Fix the embeddings check to avoid ValueError
            if "embeddings" in results and len(results["embeddings"]) > i:
                embedding_sample = results["embeddings"][i][:5].tolist()  # Convert to list for printing
                print(f"Embedding (first 5 values): {embedding_sample}...")
                
            print("-" * 70)
    else:
        print("No documents found in the Chroma DB.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Print chunks of data from Chroma DB")
    parser.add_argument("--limit", type=int, default=10, help="Number of items to print")
    parser.add_argument("--offset", type=int, default=0, help="Starting position")
    
    args = parser.parse_args()
    
    print_chroma_chunks(limit=args.limit, offset=args.offset)
