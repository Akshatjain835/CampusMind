import os
import chromadb
from chromadb.utils import embedding_functions

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")

def search_regulations(query: str, top_k: int = 3):
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        embedding_fn = embedding_functions.DefaultEmbeddingFunction()
        
        collection = client.get_or_create_collection(
            name="department_regulations",
            embedding_function=embedding_fn
        )
        
        results = collection.query(
            query_texts=[query],
            n_results=top_k
        )
        
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        
        retrieved_contexts = []
        for idx in range(len(documents)):
            doc = documents[idx]
            meta = metadatas[idx] if idx < len(metadatas) else {}
            dist = distances[idx] if idx < len(distances) else 0.0
            
            retrieved_contexts.append({
                "chunk": doc,
                "source": meta.get("source", "Academic Regulations Handbook"),
                "chunk_index": meta.get("chunk_index", 0),
                "relevance_score": round(1.0 / (1.0 + dist), 4) # Normalized score
            })
            
        formatted_context = "\n---\n".join([
            f"[Source: {ctx['source']} | Chunk #{ctx['chunk_index']} | Score: {ctx['relevance_score']}]\n{ctx['chunk']}"
            for ctx in retrieved_contexts
        ])
        
        return {
            "query": query,
            "results_count": len(retrieved_contexts),
            "contexts": retrieved_contexts,
            "formatted_context": formatted_context
        }
    except Exception as e:
        print(f"[ChromaDB Search Error]: {str(e)}")
        return {
            "query": query,
            "results_count": 0,
            "contexts": [],
            "formatted_context": "No regulations retrieved or ChromaDB collection not initialized."
        }

if __name__ == "__main__":
    res = search_regulations("Can I sit in exam if attendance is 68%?")
    print("Search Output:\n", res["formatted_context"])
