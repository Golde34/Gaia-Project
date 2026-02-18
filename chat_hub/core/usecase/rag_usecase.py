from typing import List

from core.domain.entities.vectordb.root_memory import root_memory_entity
from core.graph_memory.entity.stag import stag_entity
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model 


async def upload_context_to_vectordb(context_list: List[str], metadata: dict) -> None:
    """
    Upload context to the vector database.

    Args:
        context (str): The context string to be uploaded.
        metadata (dict): Metadata associated with the context.
    """
    
    metadata_list = [
        {
            "file_name": metadata.get("file_name", "unknown"),
            "file_type": metadata.get("file_type", "text/plain"),
            "upload_time": metadata.get("upload_time", "unknown"),
            "line_number": i + 1,  # Line number for each context
        }
        for i, _ in enumerate(context_list)
    ]

    try:
        embedding = await embedding_model.get_embeddings(texts=context_list)
        query_embeddings = milvus_validation.validate_milvus_insert(embedding) 

        print("Embeddings generated successfully:", len(query_embeddings), "vectors")
        print("Context to be uploaded:", len(context_list), "characters")
        print("Metadata for context:", len(metadata_list), "fields")

        result = root_memory_entity.insert_data(
            vectors=query_embeddings,
            content=context_list,
            metadata=metadata_list,
            partition_name="default_context"
        )

        return result.__str__()
    except Exception as e:
        print("Error uploading context to vector database:", e)
        raise e


async def query_context(query: str, top_k: int = 5, partition_name: str = "default_context") -> dict:
    """
    Query the vector database for similar contexts.

    Args:
        query (str): The input text to find similar context.
        top_k (int): Number of similar contexts to return.
        partition_name (str): Partition name to search in.

    Returns:
        dict: A dictionary containing the search results.
    """
    try:
        embedding = await embedding_model.get_embeddings(texts=[query])
        query_embeddings = milvus_validation.validate_milvus_search_top_n(embedding)

        results = root_memory_entity.search_top_n(
            query_embeddings=query_embeddings,
            top_k=top_k,
            partition_name=partition_name
        )

        return {
            "status": "success",
            "results": results
        }
    except Exception as e:
        print("Error querying context from vector database:", e)
        raise e

async def create_collection():
    try:
        stag_entity.create_collection()
        return {"message": "STAG collection schema created successfully."}
    except Exception as e:
        print("Error creating collection:", e)
        raise e 
