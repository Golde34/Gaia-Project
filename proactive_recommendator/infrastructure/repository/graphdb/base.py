from kernel.connection.graphdb_connection import get_db_session


async def run_session(query: str, parameters: dict[str, any] | None = None, **kwargs: any):
    async for session in get_db_session():
        result = await session.run(query, parameters or {}, **kwargs)
        record = await result.single()
        if not record:
            return None 
        return record

async def clear_database():
    try:
        query = "MATCH (n) DETACH DELETE n"
        result = await run_session(query=query, parameters={})
        if result is None: return "Already deleted"
        return result["u"]
    except Exception as e:
        return "ok"