from fastapi import APIRouter, HTTPException, status

from core.usecase import recommendation_usecase
from core.domain.request.recommendation_request import RecommendationRequest


RecommendationRouter = APIRouter(
    prefix="/recommend",
    tags=["Recommendation"]
)


@RecommendationRouter.post("/", status_code=status.HTTP_201_CREATED)
async def recommend(body: RecommendationRequest):
    try:
        return await recommendation_usecase.recommend(body)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recommend: {e}"
        )
