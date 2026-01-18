import json
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
        p.user_id = $user_id,
        p.description = $description,
        p.category = $category,
        p.last_action_at = datetime($last_action_at),
        p.active_status = $active_status
    ON MATCH SET
        p.name = $name,
        p.description = $description,
        p.category = $category,
        p.last_action_at = datetime($last_action_at),
        p.active_status = $active_status
    WITH p
    MATCH (u:User {user_id: $user_id})
    MERGE (u)-[:OWNS]->(p)
    RETURN p
    """
    
    parameters = {
        "id": project.id,
        "name": project.name,
        "user_id": project.user_id,
        "description": project.description,
        "category": project.category,
        "last_action_at": project.last_action_at.isoformat() if project.last_action_at else None,
        "active_status": project.active_status
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
        .category,
        .last_action_at
    } as project
    ORDER BY p.last_action_at DESC
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
        gt.last_action_at = datetime($last_action_at),
        gt.activity_count = $activity_count,
        gt.active_status = $active_status
    ON MATCH SET
        gt.title = $title,
        gt.description = $description,
        gt.last_action_at = datetime($last_action_at),
        gt.active_status = $active_status
    WITH gt
    MATCH (p:Project {id: $project_id})
    MERGE (p)-[:HAS_GROUP]->(gt)
    RETURN gt
    """
    
    parameters = {
        "id": group_task.id,
        "title": group_task.title,
        "description": group_task.description,
        "last_action_at": group_task.last_action_at.isoformat() if group_task.last_action_at else None,
        "activity_count": group_task.activity_count,
        "active_status": group_task.active_status,
        "project_id": project_id
    }
    
    return await graphdb_base.run_session(query=query, parameters=parameters)
    

async def delete_user_projects_and_tasks(user_id: int):
    """
    Delete all projects and group tasks for a user from GraphDB.
    Uses DETACH DELETE to remove all relationships as well.
    """
    query = """
    MATCH (u:User {user_id: $user_id})-[:OWNS]->(p:Project)
    OPTIONAL MATCH (p)-[:HAS_GROUP]->(gt:GroupTask)
    DETACH DELETE p, gt
    """
    
    async for session in get_db_session():
        result = await session.run(query, {"user_id": user_id})
        summary = await result.consume()
        print(f"[GraphDB] Deleted all projects and group tasks for user_id={user_id} summary: {summary}")
        return


# async def get_project_with_group_tasks(project_id: str) -> Dict[str, Any]:
#     """Get project with all its group tasks"""
#     pass

# async def search_projects_by_vector(user_id: int, query_vector: List[float], top_k: int = 10):
#     """Search projects by vector similarity (semantic search)"""
#     pass

# async def soft_delete_project(project_id: str):
#     """Soft delete a project"""
#     pass
