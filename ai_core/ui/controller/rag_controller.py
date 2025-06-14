from core.domain.request import query_request
from infrastructure.embedding.base_embedding import BaseEmbedding

async def insert_rag_data(request: query_request.RAGRequest):
    """
    Handle RAG (Retrieval-Augmented Generation) requests.
    
    Args:
        request (RAGRequest): The RAG request containing data and configuration.
        
    Returns:
        str: A response indicating the result of the RAG operation.
    """
    try:
        content = await request.file.read()
        context_str = content.decode('utf-8')
        
        embedder = BaseEmbedding()
        embeddings = await embedder.get_embeddings(context_str) 

        
        
        return None
    except Exception as e:
        print("Error handling RAG request:", e)
        raise e