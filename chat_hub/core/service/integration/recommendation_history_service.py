import datetime
from typing import Any, Dict, List, Optional

from core.domain.entities.database.recommendation_history import RecommendationHistory
from core.domain.enums.enum import RecommendationStatusEnum
from core.domain.request.query_request import QueryRequest
from infrastructure.repository.recommendation_history_repo import recommendation_history_repo


class RecommendationHistoryService:
    """
    Service for managing recommendation history tools. 
    """

    async def pre_handle_recommendations(self, user_id: int, tool: str) -> List[RecommendationHistory] | None:
        waiting_recommendations = await recommendation_history_repo.get_by_statuses(
            user_id, 
            [RecommendationStatusEnum.WAITING.value, 
             RecommendationStatusEnum.SUGGEST.value]
        )
            
        for rec in waiting_recommendations:
            if rec.tool == tool:
                await recommendation_history_repo.update_by_id(
                    rec.id,
                    {"status": RecommendationStatusEnum.RECOMMENDED.value}
                )
            elif rec.tool != tool and rec.status == RecommendationStatusEnum.SUGGEST.value: 
                await recommendation_history_repo.update_by_id(
                    rec.id,
                    {"status": RecommendationStatusEnum.WAITING.value}
                )
            elif rec.created_at.date() < datetime.datetime.now().date():
                await recommendation_history_repo.update_by_id(
                    rec.id,
                    {"status": RecommendationStatusEnum.OUTDATED.value}
                )
        
        return [rec for rec in waiting_recommendations 
                if rec.tool == tool
                and rec.status == RecommendationStatusEnum.WAITING.value]

    async def update_waiting_recommendations(self, query: QueryRequest, recommendations_response: Dict[str, Any]):
        message = recommendations_response.get("message", "")
        waiting_bundles = recommendations_response.get("waiting_bundles", [])
        tools = [bundle.get("tool") for bundle in waiting_bundles if bundle.get("tool")]
        tool_recommendations_history = await recommendation_history_repo.get_by_tools(
            tools=tools, user_id=query.user_id
        )

        for tool in tools:
            existing_rec = next((rec for rec in tool_recommendations_history if rec.tool == tool), None)
            if existing_rec:
                await recommendation_history_repo.update_by_id(
                    existing_rec.id,
                    {"status": RecommendationStatusEnum.WAITING.value}
                )
            else:
                await self.save_suggest_recommendation(
                    user_id=query.user_id,
                    dialogue_id=query.dialogue_id,
                    recommendation=message,
                    tool=tool
                )
                  
    
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
