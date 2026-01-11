from datetime import datetime

from core.domain.entities.graphdb.user_node_entity import UserNode
from infrastructure.repository.graphdb import base as graphdb_base


async def create_user_information(user_entity: UserNode):
    """
    Create or update user information in GraphDB
    
    Args:
        user_entity (UserNode): User entity object
        
    Returns:
        Neo4j record with user node
    """
    # Store to GraphDB
    query = """
        MERGE (u:User {user_id: $user_id})
        ON CREATE SET 
            u.username = $username,
            u.name = $name,
            u.email = $email,
            u.active = $active,
            u.created_at = datetime($created_at),
            u.updated_at = datetime($updated_at),
            u.metadata = $metadata
        ON MATCH SET
            u.username = $username,
            u.name = $name,
            u.email = $email,
            u.active = $active,
            u.updated_at = datetime($updated_at),
            u.metadata = $metadata
        RETURN u
    """
    
    parameters = {
        "user_id": user_entity.user_id,
        "username": user_entity.username,
        "name": user_entity.name,
        "email": user_entity.email,
        "active": user_entity.active,
        "created_at": user_entity.created_at.isoformat(),
        "updated_at": user_entity.updated_at.isoformat(),
        "metadata": user_entity.metadata
    }
    
    return await graphdb_base.run_session(query=query, parameters=parameters)


async def get_user_information(user_id: int):
    """
    Get user information from GraphDB
    
    Args:
        user_id (int): User ID
        
    Returns:
        Neo4j record with user node or None
    """
    query = """
        MATCH (u:User {user_id: $user_id})
        WHERE u.active = true
        RETURN u
    """
    parameters = {
        "user_id": user_id
    }
    return await graphdb_base.run_session(query=query, parameters=parameters)

