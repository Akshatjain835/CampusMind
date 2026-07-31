import os
import glob
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

QDRANT_PATH = os.path.join(BASE_DIR, "qdrant_db")
DOCS_PATH = os.path.join(BASE_DIR, "..", "docs")

COLLECTION_NAME = "department_regulations"

def get_qdrant_client():
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    
    if qdrant_url and qdrant_api_key:
        print(f"[Qdrant Client] Connecting to Qdrant Cloud Cluster: {qdrant_url}")
        return QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    else:
        print(f"[Qdrant Client] Using Local Qdrant Storage: {os.path.abspath(QDRANT_PATH)}")
        os.makedirs(QDRANT_PATH, exist_ok=True)
        return QdrantClient(path=QDRANT_PATH)

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

# Lightweight Deterministic Feature Vector Generator (384-dimensional vector)
def simple_text_embedding(text: str, vector_dim: int = 384):
    import hashlib
    words = text.lower().split()
    vector = [0.0] * vector_dim
    for idx, word in enumerate(words):
        hash_val = int(hashlib.md5(word.encode()).hexdigest(), 16)
        dim_idx = hash_val % vector_dim
        vector[dim_idx] += (hash_val % 100) / 100.0
    # Normalize vector
    norm = sum(x**2 for x in vector) ** 0.5
    if norm > 0:
        vector = [x / norm for x in vector]
    return vector

def ingest_to_qdrant():
    print(f"[Qdrant Ingester] Scanning documents in: {os.path.abspath(DOCS_PATH)}")
    client = get_qdrant_client()
    
    # Ensure collection exists
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in collections:
        print(f"[Qdrant] Creating collection: {COLLECTION_NAME}")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
        
    doc_files = glob.glob(os.path.join(DOCS_PATH, "*.txt")) + glob.glob(os.path.join(DOCS_PATH, "*.pdf"))
    
    if not doc_files:
        print("[Qdrant Ingester] Warning: No documents found in docs/ directory.")
        return {"status": "warning", "message": "No documents found in docs/"}

    total_chunks = 0
    points = []
    point_id = 1

    for file_path in doc_files:
        filename = os.path.basename(file_path)
        print(f"[Qdrant Ingester] Processing: {filename}")
        
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            chunks = chunk_text(content)
            
            for idx, chunk in enumerate(chunks):
                vector = simple_text_embedding(chunk)
                points.append(
                    PointStruct(
                        id=point_id,
                        vector=vector,
                        payload={
                            "source": filename,
                            "chunk_index": idx,
                            "content": chunk
                        }
                    )
                )
                point_id += 1
                total_chunks += 1
        except Exception as e:
            print(f"[Qdrant Error] Processing {filename}: {str(e)}")
            
    if points:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        
    print(f"[Qdrant Ingester Success] Successfully stored {total_chunks} vector points into Qdrant!")
    return {
        "status": "success",
        "vector_database": "Qdrant",
        "total_chunks_ingested": total_chunks
    }

if __name__ == "__main__":
    ingest_to_qdrant()
