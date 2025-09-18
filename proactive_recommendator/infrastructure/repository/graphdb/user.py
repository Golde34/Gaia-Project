from infrastructure.repository.graphdb.base import base as graphdb_base


async def create_user(label: str, obj: str):
    query = """
        CREATE (u:User {name: $name, email: $email})
        RETURN u
    """
    return await graphdb_base.run_session(query, {"name": label, "email": obj})
