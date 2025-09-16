from functools import lru_cache
from typing import AsyncGenerator

from neo4j import AsyncDriver, AsyncGraphDatabase, AsyncSession

from kernel.config.config import Config


config = Config()


@lru_cache(maxsize=1)
def get_neo4j_driver() -> AsyncDriver:
    """Create a Neo4j async driver with connection details from environment variables."""
    uri = config.NEO4J_URI
    username = config.NEO4J_USER
    password = config.NEO4J_PASSWORD

    if not all([uri, username, password]):
        raise ValueError("Neo4j environment variables are not set correctly.")

    return AsyncGraphDatabase.driver(uri, auth=(username, password))


async def close_neo4j_driver() -> None:
    """Close the cached Neo4j driver connection if it exists."""
    if get_neo4j_driver.cache_info().currsize:
        driver = get_neo4j_driver()
        await driver.close()
        get_neo4j_driver.cache_clear()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a Neo4j async session and handles its closure."""
    driver = get_neo4j_driver()
    session = driver.session()
    try:
        yield session
    finally:
        await session.close()
