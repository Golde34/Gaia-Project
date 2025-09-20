from neo4j import AsyncSession

from kernel.connection.graphdb_connection import get_db_session


session: AsyncSession = get_db_session()

async def run_session(query: str, parameters: dict[str, any] | None = None, **kwargs: any):
    result = await session.run(query, parameters or {}, **kwargs)
    record = await result.single()
    if not record:
        raise RuntimeError("No result returned from Neo4j")
    return record