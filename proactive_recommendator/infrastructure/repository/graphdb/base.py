from kernel.connection.graphdb_connection import get_db_session


async def run_session(query: str, parameters: dict[str, any] | None = None, **kwargs: any):
    async for session in get_db_session():
        result = await session.run(query, parameters or {}, **kwargs)
        record = await result.single()
        if not record:
            return None 
        return record
