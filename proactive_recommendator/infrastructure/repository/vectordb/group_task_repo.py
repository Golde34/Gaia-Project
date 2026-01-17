"""
GroupTask VectorDB Repository
Handle vector storage and retrieval for group tasks in Milvus
"""
from typing import List, Dict, Any
from core.domain.entities.vectordb.group_task_entity import GroupTask
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db


async def insert_group_task_vector(
    group_task_entity: GroupTask, 
    user_id: int,
    group_task_id: str,
    project_id: str,
    summary: str,
    status: str = "active"
) -> GroupTask:
    """
    Insert GroupTask vectors into Milvus
    
    Args:
        group_task_entity: GroupTask entity with keywords and examples
        user_id: User ID for partition key
        group_task_id: GroupTask ID from GraphDB
        project_id: Parent project ID
        summary: Generated summary for semantic search
        status: active/inactive status
        
    Returns:
        GroupTask entity after insertion
    """
    # Create collection if not exists
    group_task_schema = group_task_entity.schema_fields()
    milvus_db.create_collection_if_not_exists(
        group_task_entity.connection_name, 
        schema=group_task_schema
    )

    # Prepare texts for embedding
    texts_to_embed = group_task_entity.keywords + group_task_entity.example
    embeddings = await embedding_model.get_embeddings(texts_to_embed)

    # Insert data for each keyword/example
    data_to_insert = []
    for i, text in enumerate(texts_to_embed):
        data_to_insert.append({
            "id": f"{group_task_id}_{i}",  # Unique ID per embedding
            "vector": embeddings[i],
            "user_id": user_id,
            "project_id": project_id,
            "status": status,
            "summary": summary,
            "metadata": {}  # Empty for now
        })

    milvus_db.insert_data(group_task_entity.connection_name, data_to_insert)

    return group_task_entity


async def search_group_tasks_by_vector(
    query: str, 
    user_id: int,
    top_k: int = 5,
    project_id: str = None
) -> List[Dict[str, Any]]:
    """
    Search group tasks by semantic similarity
    
    Args:
        query: Search query text
        user_id: User ID to filter results
        top_k: Number of results to return
        project_id: Optional project ID to filter by project
        
    Returns:
        List of matching group tasks with scores
    """
    # Generate query embedding
    query_embeddings = await embedding_model.get_embeddings([query])
    query_vector = query_embeddings[0] if isinstance(query_embeddings, list) else query_embeddings
    
    # Build filter
    filter_parts = [f'user_id == {user_id}', 'status == "active"']
    if project_id:
        filter_parts.append(f'project_id == "{project_id}"')
    filter_query = " and ".join(filter_parts)
    
    # Search
    results = milvus_db.search_top_n(
        collection_name="group_task",
        query_embeddings=[query_vector],
        output_fields=["id", "project_id", "summary", "metadata"],
        top_k=top_k,
        filter_query=filter_query
    )
    
    return results


async def get_group_tasks_by_project(
    project_id: str,
    user_id: int
) -> List[Dict[str, Any]]:
    """
    Get all group tasks for a specific project
    
    Args:
        project_id: Project ID to filter
        user_id: User ID for access control
        
    Returns:
        List of group tasks
    """
    filter_query = f'project_id == "{project_id}" and user_id == {user_id} and status == "active"'
    
    results = milvus_db.search_by_fields(
        collection_name="group_task",
        filter_query=filter_query,
        output_fields=["id", "project_id", "summary", "metadata"]
    )
    
    return results if results else []


async def delete_user_group_tasks(user_id: int):
    """
    Delete all group tasks for a user from VectorDB.
    
    Args:
        user_id: User ID to filter deletion
    """
    try:
        filter_query = f'user_id == {user_id}'
        milvus_db.delete_by_filter(
            collection_name="group_task",
            filter_query=filter_query
        )
    except Exception as e:
        print(f"Error deleting user group tasks from VectorDB: {e}")
        # Don't raise - allow sync to continue


async def update_group_task_status(
    group_task_id: str,
    user_id: int,
    new_status: str
) -> bool:
    """
    Update group task status (soft delete)
    
    Args:
        group_task_id: GroupTask ID to update
        user_id: User ID for access control
        new_status: New status (active/inactive)
        
    Returns:
        Success boolean
    """
    # TODO: Implement update logic in milvus_db
    # For now, would need to delete and reinsert with new status
    pass
