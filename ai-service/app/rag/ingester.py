import os
import glob
import chromadb
from chromadb.utils import embedding_functions

# Define persistent storage directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
DOCS_PATH = os.path.join(BASE_DIR, "..", "docs")

def get_chroma_client():
    os.makedirs(CHROMA_PATH, exist_ok=True)
    return chromadb.PersistentClient(path=CHROMA_PATH)

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

def ingest_documents():
    print(f"[ChromaDB Ingester] Scanning documents in: {os.path.abspath(DOCS_PATH)}")
    client = get_chroma_client()
    
    # Use ChromaDB DefaultEmbeddingFunction (ONNX MiniLM - robust offline/online)
    try:
        embedding_fn = embedding_functions.DefaultEmbeddingFunction()
    except Exception as e:
        print(f"[Embedding Warning] Falling back to default: {e}")
        embedding_fn = embedding_functions.DefaultEmbeddingFunction()
    
    collection = client.get_or_create_collection(
        name="department_regulations",
        embedding_function=embedding_fn
    )
    
    doc_files = glob.glob(os.path.join(DOCS_PATH, "*.txt")) + glob.glob(os.path.join(DOCS_PATH, "*.pdf"))
    
    if not doc_files:
        print("[ChromaDB Ingester] Warning: No documents found in docs/ directory.")
        return {"status": "warning", "message": "No documents found to ingest"}

    total_chunks = 0
    for file_path in doc_files:
        filename = os.path.basename(file_path)
        print(f"[ChromaDB Ingester] Processing: {filename}")
        
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            chunks = chunk_text(content)
            
            documents = []
            metadatas = []
            ids = []
            
            for idx, chunk in enumerate(chunks):
                chunk_id = f"{filename}_chunk_{idx}"
                documents.append(chunk)
                metadatas.append({
                    "source": filename,
                    "chunk_index": idx
                })
                ids.append(chunk_id)
                
            if documents:
                collection.upsert(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                total_chunks += len(documents)
        except Exception as e:
            print(f"[ChromaDB Ingester Error] Error processing {filename}: {str(e)}")
            
    print(f"[ChromaDB Ingester Success] Ingested {total_chunks} chunks into ChromaDB.")
    return {
        "status": "success",
        "documents_processed": len(doc_files),
        "total_chunks_ingested": total_chunks,
        "chroma_dir": os.path.abspath(CHROMA_PATH)
    }

if __name__ == "__main__":
    ingest_documents()
