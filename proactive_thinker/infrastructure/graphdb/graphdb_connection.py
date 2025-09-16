from neo4j import GraphDatabase, Driver
from functools import lru_cache

from kernel.config.config import Config


config = Config()

@lru_cache()
def get_neo4j_driver() -> Driver:
    """Creates a Neo4j driver with connection details from environment variables."""
    uri = config.NEO4J_URI
    username = config.NEO4J_USER
    password = config.NEO4J_PASSWORD
    
    if not all([uri, username, password]):
        raise ValueError("Neo4j environment variables are not set correctly.")
    
    return GraphDatabase.driver(uri, auth=(username, password))

async def close_neo4j_driver(driver: Driver):
    """Closes the Neo4j driver connection."""
    if driver:
        await driver.close()

async def get_db_session():
    """Dependency that provides a Neo4j session and handles its closure."""
    driver = get_neo4j_driver()
    session = driver.session()
    try:
        yield session
    finally:
        await session.close()
