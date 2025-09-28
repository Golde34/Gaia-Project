from infrastructure.repository.graphdb import base as graphdb_base


async def clear_database():
    try:
        query = "MATCH (n) DETACH DELETE n"
        result = await graphdb_base.run_session(query=query, parameters={})
        if result is None: return "Already deleted"
        return result["u"]
    except Exception as e:
        return "ok"
