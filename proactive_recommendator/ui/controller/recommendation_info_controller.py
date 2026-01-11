from fastapi import APIRouter, HTTPException, status

from core.usecase import recommendation_usecase
from core.domain.request.recommendation_request import RecommendationRequest
from proactive_recommendator.ui.controller.recommendation_controller import RecommendationRouter


RecommendationInfoRouter= APIRouter(
    prefix="/recommend-info",
    tags=["Recommendation Info"]
)

@RecommendationInfoRouter.get("/project-list", status_code=status.HTTP_201_CREATED)
async def list_project():
    try:
        pass
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recommend: {e}"
        )

@RecommendationInfoRouter.get("/group-task-list", status_code=status.HTTP_201_CREATED)
async def list_project():
    try:
        pass
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recommend: {e}"
        )