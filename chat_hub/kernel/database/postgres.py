import asyncio
from typing import Optional
from weakref import WeakKeyDictionary

import asyncpg

from kernel.config import config


class PostgresDB:
    """Manage one asyncpg pool per asyncio event loop."""

    _instance: Optional["PostgresDB"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pools = WeakKeyDictionary()
        return cls._instance

    async def connect(self) -> asyncpg.pool.Pool:
        loop = asyncio.get_running_loop()
        pool = self._pools.get(loop)
        if pool is None or pool._closed:
            pool = await asyncpg.create_pool(
                user=config.POSTGRES_USER,
                password=config.POSTGRES_PASSWORD,
                database=config.POSTGRES_DB,
                host=config.POSTGRES_HOST,
                port=config.POSTGRES_PORT,
            )
            self._pools[loop] = pool
        return pool

    async def close(self) -> None:
        loop = asyncio.get_running_loop()
        pool = self._pools.pop(loop, None)
        if pool is not None and not pool._closed:
            await pool.close()

    async def close_all(self) -> None:
        for loop in list(self._pools.keys()):
            pool = self._pools.pop(loop, None)
            if pool is not None and not pool._closed:
                await pool.close()


postgres_db = PostgresDB()
