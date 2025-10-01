from infrastructure.repository.graphdb import base as graphdb_base


async def create_user_information(user_id: str, user_information: any):
    # Store to GraphDB
    query = """
        MERGE (u:User {user_id: $user_id})
        SET u.username = $username,
            u.name = $name,
            u.email = $email
        RETURN u
    """
    parameters = {
        "user_id": user_id,
        "username": user_information['username'],
        "name": user_information['name'],
        "email": user_information['email']
    }
    return await graphdb_base.run_session(query=query, parameters=parameters)


async def get_user_information(user_id: str):
    query = """
            MATCH (u:User {user_id: $user_id})
            return u
        """
    parameters = {
        "user_id": user_id
    }
    return await graphdb_base.run_session(query=query, parameters=parameters)
