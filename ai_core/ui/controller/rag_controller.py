from core.domain.request import query_request
from infrastructure.embedding.base_embedding import BaseEmbedding
from infrastructure.vector_db.milvus import milvus_db


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
        metadata = {
            "file_name": request.file.filename,
            "file_type": request.file.content_type,
            "upload_time": request.upload_time,
        }

        embedder = BaseEmbedding()
        embeddings = await embedder.get_embeddings(context_str)

        milvus_db.insert_data(
            vectors=embeddings,
            contents=context_str,
            metadata_list=[metadata] 
        )

        print("RAG data inserted successfully.")

        return None
    except Exception as e:
        print("Error handling RAG request:", e)
        raise e
