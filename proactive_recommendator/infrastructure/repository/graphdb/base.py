from __future__ import annotations

from typing import Any, Dict

from kernel.connection.graphdb_connection import get_db_session


async def run_session(query: str, parameters: Dict[str, Any] | None = None, **kwargs: Any):
    async for session in get_db_session():
        result = await session.run(query, parameters or {}, **kwargs)
        record = await result.single()
        return record


async def clear_database() -> str:
    query = "MATCH (n) DETACH DELETE n"
    async for session in get_db_session():
        result = await session.run(query)
        await result.consume()
        return "ok"
    return "ok"
