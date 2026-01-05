import datetime
from typing import List, Optional

from core.domain.entities.database.recommendation_history import RecommendationHistory
from core.domain.enums.enum import RecommendationStatusEnum
from infrastructure.repository.recommendation_history_repo import recommendation_history_repo


class RecommendationHistoryService:
    """
    Service for managing recommendation history tools. 
    """

    async def find_waiting_recommendations(self, user_id: int, tool: str) -> List[RecommendationHistory] | None:
        waiting_recommendations = await recommendation_history_repo.get_by_status(
            user_id, RecommendationStatusEnum.WAITING.value)
            
        for rec in waiting_recommendations:
            if rec.tool == tool:
                await recommendation_history_repo.update_by_id(
                    rec.id,
                    {"status": RecommendationStatusEnum.RECOMMENDED.value}
                )
            if rec.created_at.date() < datetime.datetime.now().date():
                await recommendation_history_repo.update_by_id(
                    rec.id,
                    {"status": RecommendationStatusEnum.OUTDATED.value}
                )
        return waiting_recommendations

    async def save_suggest_recommendation(
        self,
        user_id: int,
        dialogue_id: str,
        recommendation: str,
        tool: str
    ) -> RecommendationHistory:
        recommendation_history = RecommendationHistory(
            user_id=user_id,
            dialogue_id=dialogue_id,
            recommendation=recommendation,
            tool=tool,
            status=RecommendationStatusEnum.SUGGEST.value,
            created_at=datetime.datetime.now()
        )
        saved_recommendation = await recommendation_history_repo.insert(
            recommendation_history,
            returning=("id", "user_id", "dialogue_id",
                       "recommendation", "tool", "status", "created_at"),
            auto_timestamps=True,
        )
        return RecommendationHistory(**saved_recommendation)

    async def update_recommendation_status(
        self,
        recommendation_id: str,
        status: str
    ) -> Optional[RecommendationHistory]:
        await recommendation_history_repo.update_by_id(
            recommendation_id,
            {"status": status}
        )
        return await recommendation_history_repo.get_by_id(recommendation_id
                                                           )


recommendation_history_service = RecommendationHistoryService()
