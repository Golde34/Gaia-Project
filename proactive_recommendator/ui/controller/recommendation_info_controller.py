from fastapi import APIRouter, HTTPException, status

from core.usecase import command_usecase
from core.domain.request.recommendation_request import RecommendationInfoRequest


RecommendationInfoRouter= APIRouter(
    prefix="/recommend-info",
    tags=["Recommendation Info"]
)

@RecommendationInfoRouter.post("/project-list", status_code=status.HTTP_201_CREATED)
async def list_project(body: RecommendationInfoRequest):
    try:
        return await command_usecase.get_project_list(body)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Get project list failed: {e}"
        )

@RecommendationInfoRouter.post("/group-task-list", status_code=status.HTTP_201_CREATED)
async def list_project(body: RecommendationInfoRequest):
    try:
        return await command_usecase.get_group_task_list(body)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Get group task list failed: {e}"
        )
