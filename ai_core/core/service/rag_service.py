from infrastructure.embedding.base_embedding import BaseEmbedding
from infrastructure.vector_db.milvus import milvus_db


async def upload_context_to_vectordb(context: str, metadata: dict) -> None:
    """
    Upload context to the vector database.

    Args:
        context (str): The context string to be uploaded.
        metadata (dict): Metadata associated with the context.
    """
    try:
        # Get embeddings for the context
        embedder = BaseEmbedding()
        embeddings_tensor = await embedder.get_embeddings(texts=[context])

        print("Embeddings generated successfully:", embeddings)
        print("Context to be uploaded:", context)
        print("Metadata for context:", metadata)

        # Insert data into the vector database
        result = milvus_db.insert_data(
            vectors=embeddings,
            contents=[context],
            metadata_list=[metadata],
            partition_name="default_context"  
        )

        print("Context uploaded successfully to vector database:", result.primary_keys)
        return {
            "status": "success",
            "message": "Context uploaded successfully",
            "primary_keys": result.primary_keys
        }
    except Exception as e:
        print("Error uploading context to vector database:", e)
        raise e