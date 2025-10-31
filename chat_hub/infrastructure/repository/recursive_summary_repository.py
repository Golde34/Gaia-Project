from typing import List

from core.domain.entities.recursive_summary import RecursiveSummary
from kernel.database.postgres import postgres_db


class RecursiveSummaryRepository:

    async def get_summary_by_dialogue_id_and_user_id(self, user_id: str, dialogue_id: str) -> RecursiveSummary:
        """
        Retrieves a list of recursive summaries for a specific user and dialogue ID.
        """
        query = (
            "SELECT * FROM recursive_summary WHERE user_id = $1 AND dialogue_id = $2 ORDER BY created_at DESC"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, user_id, dialogue_id)
            return [RecursiveSummary(**dict(row)) for row in rows][0] if rows else None

    async def save_summary(self, summary: RecursiveSummary) -> int:
        record = await self.get_summary_by_dialogue_id_and_user_id(summary.user_id, summary.dialogue_id)
        if record:
            print(f"Updating existing summary for user {summary.user_id} and dialogue {summary.dialogue_id}")
            query = (
                "UPDATE recursive_summary SET summary=$1, created_at=$2 WHERE id=$3 RETURNING id"
            )
            pool = await postgres_db.connect()
            async with pool.acquire() as conn:
                return await conn.fetchval(
                    query,
                    summary.summary,
                    summary.created_at,
                    record.id
                )
        else:
            print(f"Creating new summary for user {summary.user_id} and dialogue {summary.dialogue_id}")
            query = (
                "INSERT INTO recursive_summary (id, user_id, dialogue_id, summary, created_at) "
                "VALUES ($1, $2, $3, $4, $5) RETURNING id"
            )
            pool = await postgres_db.connect()
            async with pool.acquire() as conn:
                return await conn.fetchval(
                    query,
                    summary.id,
                    summary.user_id,
                    summary.dialogue_id,
                    summary.summary,
                    summary.created_at,
                )

    async def list_by_dialogue(self, user_id: int, dialogue_id: str) -> List[RecursiveSummary]:
        query = (
            "SELECT id, user_id, dialogue_id, summary, created_at "
            "FROM recursive_summary WHERE user_id=$1 AND dialogue_id=$2 ORDER BY id"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, str(user_id), dialogue_id)
            return [RecursiveSummary(**dict(row)) for row in rows]


recursive_summary_repo = RecursiveSummaryRepository()
