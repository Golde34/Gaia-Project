import datetime
from typing import List, Optional

from core.domain.entities.database.recommendation_history import RecommendationHistory
from infrastructure.repository.recommendation_history_repo import recommendation_history_repo


class RecommendationHistoryService:
    """
    Service for managing recommendation history tools. 

    + Tao finger print bang ability selection tool la gi + nam thang ngay
    + Ham update fingerprint khi recommendation moi day thong tin sang, cap nhat fingerprint cu la outdate
    + Ham lay danh sach cac fingerprint chua duoc hien thi len, tru cac fingerprint outdate, cac fingerprint hien thi len roi thi danh la active
    """

    async def find_waiting_recommendations(self, user_id: int, tool: str) -> List[RecommendationHistory]:
        waiting_recommendations = await recommendation_history_repo.get_by_status(user_id, "waiting")
        for rec in waiting_recommendations:
            if rec.tool == tool:
                await recommendation_history_repo.update_by_id(
                    rec.id,
                    {"status": "recommended"}
                )
            if rec.created_at.date() < datetime.datetime.now().date():
                await recommendation_history_repo.update_by_id(
                    rec.id,
                    {"status": "outdated"}
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
            status="suggest",
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
