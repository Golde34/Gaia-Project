from typing import List

from infrastructure.embedding.base_embedding import embedding_model 
from infrastructure.vector_db.milvus import milvus_db 


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
        embeddings_tensor = await embedding_model.get_embeddings(texts=context_list)

        if hasattr(embeddings_tensor, "tolist"):
            embeddings = embeddings_tensor.tolist()
        elif isinstance(embeddings_tensor, list):
            embeddings = embeddings_tensor
        else:
            raise ValueError("Unexpected type for embeddings_tensor: {}".format(
                type(embeddings_tensor)))

        print("Embeddings generated successfully:", len(embeddings), "vectors")
        print("Context to be uploaded:", len(context_list), "characters")
        print("Metadata for context:", len(metadata_list), "fields")

        # Insert data into the vector database
        result = milvus_db.insert_data(
            vectors=embeddings,
            contents=context_list,
            metadata_list=metadata_list,
            partition_name="default_context"
        )

        return {
            "status": "success",
            "message": "Context uploaded successfully",
            "result": result
        }
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

        if hasattr(embedding, "tolist"):
            embedding = embedding.tolist()
        elif isinstance(embedding, list) and hasattr(embedding[0], "tolist"):
            embedding = [emb.tolist() for emb in embedding]

        if isinstance(embedding, list) and isinstance(embedding[0], float):
            query_embeddings = [embedding]
        else:
            query_embeddings = embedding

        results = milvus_db.search_top_n(
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
