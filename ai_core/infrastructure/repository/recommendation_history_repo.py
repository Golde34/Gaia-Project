import asyncio
from dataclasses import dataclass
from typing import List, Optional

from core.domain.entities.recommendation_history import RecommendationHistory
from kernel.database.postgres import postgres_db


class RecommendationHistoryRepository:
    """Postgres-backed repository for recommendation history.

    Provides simple methods to get the latest recommendation for a user+context,
    save/update a recommendation record, list records by user, and delete by user.
    This mirrors the style of recursive_summary_repository.
    """

    async def get_by_user_and_context(self, user_id: str, dialogue_id: str) -> Optional[RecommendationHistory]:
        query = (
            "SELECT id, user_id, dialogue_id, fingerprint, recommendation, created_at "
            "FROM recommendation_history WHERE user_id=$1 AND dialogue_id=$2 ORDER BY created_at DESC"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, user_id, dialogue_id)
            return RecommendationHistory(**dict(rows[0])) if rows else None

    async def save(self, record: RecommendationHistory) -> int:
        existing = await self.get_by_user_and_context(record.user_id, record.dialogue_id)
        if existing:
            query = (
                "UPDATE recommendation_history SET fingerprint=$1, recommendation=$2, created_at=$3 WHERE id=$4 RETURNING id"
            )
            pool = await postgres_db.connect()
            async with pool.acquire() as conn:
                return await conn.fetchval(query, record.fingerprint, record.recommendation, record.created_at, existing.id)
        else:
            query = (
                "INSERT INTO recommendation_history (id, user_id, dialogue_id, fingerprint, recommendation, created_at) "
                "VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
            )
            pool = await postgres_db.connect()
            async with pool.acquire() as conn:
                return await conn.fetchval(query, record.id, record.user_id, record.dialogue_id, record.fingerprint, record.recommendation, record.created_at)

    async def list_by_user(self, user_id: str) -> List[RecommendationHistory]:
        query = (
            "SELECT id, user_id, dialogue_id, fingerprint, recommendation, created_at "
            "FROM recommendation_history WHERE user_id=$1 ORDER BY created_at"
        )
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, user_id)
            return [RecommendationHistory(**dict(r)) for r in rows]

    async def delete_by_user(self, user_id: str) -> None:
        query = "DELETE FROM recommendation_history WHERE user_id=$1"
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, user_id)

    async def should_recommend(self, user_id: Optional[str], fingerprint: str, dialogue_id: Optional[str] = "default") -> bool:
        if not user_id:
            # if no user id, always recommend
            return True
        rec = await self.get_by_user_and_context(user_id, dialogue_id)
        if rec is None:
            return True
        return rec.fingerprint != fingerprint
    
    async def register(self, user_id: Optional[str], fingerprint: str, recommendation: str, dialogue_id: Optional[str] = "default", record_id: Optional[str] = None, created_at=None) -> None:
        if not user_id or not recommendation:
            return
        # lazily import dataclass to avoid circular import at module load
        from core.domain.entities.recommendation_history import RecommendationHistory as RH
        rec = RH(
            id=record_id or __import__("uuid").uuid4().hex,
            user_id=str(user_id),
            dialogue_id=str(dialogue_id),
            fingerprint=fingerprint,
            recommendation=recommendation,
            created_at=created_at or __import__("datetime").datetime.utcnow(),
        )
        await self.save(rec)


recommendation_history_repo = RecommendationHistoryRepository()
