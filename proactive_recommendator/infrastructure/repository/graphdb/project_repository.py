from typing import List, Dict, Any
from core.domain.entities.graphdb.project_node_entity import ProjectNode
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

# async def upsert_group_task(group_task: GroupTaskNode):
#     """Create or update group task and link to project"""
#     pass

# async def get_project_with_groups(user_id: int, project_id: str):
#     """Get project with all its group tasks"""
#     pass

# async def search_projects_by_vector(user_id: int, query_vector: List[float], top_k: int = 10):
#     """Search projects by vector similarity (semantic search)"""
#     pass

# async def soft_delete_project(project_id: str):
#     """Soft delete a project"""
#     pass
