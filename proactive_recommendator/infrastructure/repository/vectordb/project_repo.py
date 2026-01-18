from typing import List, Dict, Any
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db
from core.domain.entities.vectordb.project_entity import Project


async def insert_project_vector(
    project_entity: Project,
    user_id: int,
    project_id: str,
    summary: str,
    status: str = "active"
) -> Project:
    """
    Insert Project vectors into Milvus
    
    Args:
        project_entity: Project entity with keywords and examples
        user_id: User ID for partition key
        project_id: Project ID from GraphDB
        summary: Generated summary for semantic search
        status: active/inactive status
        
    Returns:
        Project entity after insertion
    """
    project_schema = project_entity.schema_fields()

    milvus_db.create_collection_if_not_exists(
        project_entity.connection_name, schema=project_schema)

    # Combine all texts into ONE string for single embedding
    texts_to_embed = project_entity.keywords + project_entity.example
    combined_text = " ".join(texts_to_embed)
    
    # Get single embedding for the project
    embeddings = await embedding_model.get_embeddings([combined_text])
    embedding_vector = embeddings[0] if isinstance(embeddings, list) else embeddings

    # Insert ONE record per project
    data_to_insert = [{
        "id": project_id,  # Use project_id directly as primary key
        "vector": embedding_vector,
        "user_id": user_id,
        "status": status,
        "summary": summary,
        "metadata": project_entity.metadata
    }]

    milvus_db.insert_data(project_entity.connection_name, data_to_insert)

    return project_entity


async def search_projects_by_vector(
    query: str,
    user_id: int,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Search projects by semantic similarity
    
    Args:
        query: Search query text
        user_id: User ID to filter results (uses partition key for efficient search)
        top_k: Number of results to return
        
    Returns:
        List of matching projects with scores
    """
    query_embeddings = await embedding_model.get_embeddings([query])
    query_vector = query_embeddings[0] if isinstance(query_embeddings, list) else query_embeddings
    
    filter_query = f'user_id == {user_id} and status == "active"'
    
    results = milvus_db.search_top_n(
        collection_name="project",
        query_embeddings=[query_vector],
        output_fields=["id", "summary", "metadata"],
        top_k=top_k,
        filter_query=filter_query
    )

    return results


async def get_user_projects(user_id: int) -> List[Dict[str, Any]]:
    """
    Get all projects for a user
    
    Args:
        user_id: User ID for access control
        
    Returns:
        List of projects
    """
    filter_query = f'user_id == {user_id} and status == "active"'
    
    results = milvus_db.search_by_fields(
        collection_name="project",
        filter_query=filter_query,
        output_fields=["id", "summary", "metadata"]
    )

    return results if results else []


async def delete_user_projects(user_id: int):
    """
    Delete all projects for a user from VectorDB.
    
    Args:
        user_id: User ID to filter deletion
    """
    try:
        filter_query = f'user_id == {user_id}'
        milvus_db.delete_by_filter(
            collection_name="project",
            filter_query=filter_query
        )
    except Exception as e:
        print(f"Error deleting user projects from VectorDB: {e}")
        # Don't raise - allow sync to continue


async def update_project_status(
    project_id: str,
    user_id: int,
    new_status: str
) -> bool:
    """
    Update project status (soft delete)
    
    Args:
        project_id: Project ID to update
        user_id: User ID for access control
        new_status: New status (active/inactive)
        
    Returns:
        Success boolean
    """
    # TODO: Implement update logic in milvus_db
    # For now, would need to delete and reinsert with new status
    pass 
