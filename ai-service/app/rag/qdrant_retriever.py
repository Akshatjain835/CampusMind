import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from app.rag.qdrant_ingester import get_qdrant_client, simple_text_embedding, COLLECTION_NAME

load_dotenv()

def search_qdrant_regulations(query: str, top_k: int = 3):
    try:
        client = get_qdrant_client()
        query_vector = simple_text_embedding(query)
        
        # Compatibility for qdrant-client 1.18+
        if hasattr(client, "query_points"):
            res = client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                limit=top_k
            )
            search_results = getattr(res, "points", [])
        else:
            search_results = client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                limit=top_k
            )
        
        retrieved_contexts = []
        for hit in search_results:
            payload = hit.payload or {}
            retrieved_contexts.append({
                "chunk": payload.get("content", ""),
                "source": payload.get("source", "Department Regulation"),
                "chunk_index": payload.get("chunk_index", 0),
                "similarity_score": round(hit.score, 4)
            })
            
        formatted_context = "\n---\n".join([
            f"[Source: {ctx['source']} | Chunk #{ctx['chunk_index']} | Similarity: {ctx['similarity_score']}]\n{ctx['chunk']}"
            for ctx in retrieved_contexts
        ])
        
        return {
            "query": query,
            "vector_store": "Qdrant",
            "results_count": len(retrieved_contexts),
            "contexts": retrieved_contexts,
            "formatted_context": formatted_context
        }
    except Exception as e:
        print(f"[Qdrant Search Error]: {str(e)}")
        return {
            "query": query,
            "vector_store": "Qdrant",
            "results_count": 0,
            "contexts": [],
            "formatted_context": "No regulations retrieved from Qdrant Vector Store."
        }

if __name__ == "__main__":
    res = search_qdrant_regulations("What is the attendance requirement for sitting in exams?")
    print(res["formatted_context"])
