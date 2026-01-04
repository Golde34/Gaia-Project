from datetime import datetime
from typing import List, Optional

from core.domain.entities.database.recommendation_history import RecommendationHistory
from kernel.database.base import BaseRepository


class RecommendationHistoryRepository(BaseRepository[RecommendationHistory]):
    """Postgres-backed repository for recommendation history.

    Provides simple methods to get the latest recommendation for a user+context,
    save/update a recommendation record, list records by user, and delete by user.
    This mirrors the style of recursive_summary_repository.
    """
    def __init__(self):
        super().__init__(
            table_name="recommendation_history",
            model_cls=RecommendationHistory,
            pk="id",
            default_order_by="created_at DESC",
        )
    async def get_by_status(
        self,
        user_id: int,
        status: str
    ) -> List[RecommendationHistory]:
        rows = await self.list(
            where={"user_id": user_id, "status": status},
            to_models=True,
        )
        return rows


recommendation_history_repo = RecommendationHistoryRepository()
