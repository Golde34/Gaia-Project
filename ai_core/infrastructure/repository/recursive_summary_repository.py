from typing import List

from core.domain.entities.recursive_summary import RecursiveSummary
from infrastructure.database.postgres import postgres_db


class RecursiveSummaryRepository:
    async def save_summary(self, summary: RecursiveSummary) -> int:
        query = (
            "INSERT INTO recursive_summary (user_id, dialogue_id, summary, created_at) "
            "VALUES ($1, $2, $3, $4) RETURNING id"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            return await conn.fetchval(
                query,
                summary.user_id,
                summary.dialogue_id,
                summary.summary,
                summary.created_at,
            )

    async def list_by_dialogue(self, user_id: str, dialogue_id: str) -> List[RecursiveSummary]:
        query = (
            "SELECT id, user_id, dialogue_id, role, message, summary, created_at "
            "FROM recursive_summary WHERE user_id=$1 AND dialogue_id=$2 ORDER BY id"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, user_id, dialogue_id)
            return [RecursiveSummary(**dict(row)) for row in rows]


recursive_summary_repo = RecursiveSummaryRepository()
