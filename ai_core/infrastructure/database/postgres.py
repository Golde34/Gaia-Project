import asyncpg
from typing import Optional

from kernel.config import config


class PostgresDB:
    """Singleton class to manage PostgreSQL connections using asyncpg."""

    _instance: Optional["PostgresDB"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pool = None
        return cls._instance

    async def connect(self) -> asyncpg.pool.Pool:
        if self._pool is None:
            self._pool = await asyncpg.create_pool(
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD,
                database=config.POSTGRES_DB,
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
            )
        return self._pool

    async def close(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None


postgres_db = PostgresDB()
