from typing import List, Dict, Any
from core.domain.entities.graphdb.project_node_entity import ProjectNode, GroupTaskNode
from infrastructure.repository.graphdb import base as graphdb_base
from kernel.connection.graphdb_connection import get_db_session


async def upsert_project(project: ProjectNode):
    """Create or update project and link to user"""
    query = """
    MERGE (p:Project {id: $id})
    ON CREATE SET
        p.name = $name,
        p.description = $description,
        p.user_id = $user_id,
        p.description_vector = $description_vector,
        p.created_at = datetime($created_at),
        p.updated_at = datetime($updated_at),
        p.active_status = $active_status,
        p.metadata = $metadata
    ON MATCH SET
        p.name = $name,
        p.description = $description,
        p.description_vector = $description_vector,
        p.updated_at = datetime($updated_at),
        p.active_status = $active_status,
        p.metadata = $metadata
    WITH p
    MATCH (u:User {user_id: $user_id})
    MERGE (u)-[:OWNS]->(p)
    RETURN p
    """
    
    parameters = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "user_id": project.user_id,
        "description_vector": project.description_vector,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "active_status": project.active_status,
        "metadata": project.metadata
    }
    
    return await graphdb_base.run_session(query=query, parameters=parameters)


async def get_user_projects(user_id: int) -> List[Dict[str, Any]]:
    """Get all active projects for a user"""
    query = """
    MATCH (u:User {user_id: $user_id})-[:OWNS]->(p:Project)
    WHERE p.active_status = 'active'
    RETURN p {
        .id,
        .name,
        .description,
        .created_at,
        .updated_at
    } as project
    ORDER BY p.updated_at DESC
    """
    
    async for session in get_db_session():
        result = await session.run(query, {"user_id": user_id})
        records = await result.data()
        return [record["project"] for record in records]
    return []


async def upsert_group_task(group_task: GroupTaskNode, project_id: str):
    """
    Create or update group task and link to project
    
    Args:
        group_task (GroupTaskNode): GroupTask entity
        project_id (str): Parent project ID
        
    Returns:
        Neo4j record with group task node
    """
    query = """
    MERGE (gt:GroupTask {id: $id})
    ON CREATE SET
        gt.title = $title,
        gt.description = $description,
        gt.description_vector = $description_vector,
        gt.created_at = datetime($created_at),
        gt.updated_at = datetime($updated_at),
        gt.active_status = $active_status,
        gt.metadata = $metadata
    ON MATCH SET
        gt.title = $title,
        gt.description = $description,
        gt.description_vector = $description_vector,
        gt.updated_at = datetime($updated_at),
        gt.active_status = $active_status,
        gt.metadata = $metadata
    WITH gt
    MATCH (p:Project {id: $project_id})
    MERGE (p)-[:HAS_GROUP]->(gt)
    RETURN gt
    """
    
    parameters = {
        "id": group_task.id,
        "title": group_task.title,
        "description": group_task.description,
        "description_vector": group_task.description_vector,
        "created_at": group_task.created_at.isoformat() if group_task.created_at else None,
        "updated_at": group_task.updated_at.isoformat() if group_task.updated_at else None,
        "active_status": group_task.active_status,
        "metadata": group_task.metadata,
        "project_id": project_id
    }
    
    return await graphdb_base.run_session(query=query, parameters=parameters)


# ============================================
# TODO: Future functions to implement
# ============================================
#     """Get project with all its group tasks"""
#     pass

# async def search_projects_by_vector(user_id: int, query_vector: List[float], top_k: int = 10):
#     """Search projects by vector similarity (semantic search)"""
#     pass

# async def soft_delete_project(project_id: str):
#     """Soft delete a project"""
#     pass
