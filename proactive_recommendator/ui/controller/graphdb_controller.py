from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from core.service.graphdb_service import create_user_information


GraphDBRouter = APIRouter(
    prefix="/graphdb",
    tags=["GraphDB"],
)

class LabelRequestBody(BaseModel):
    user_id: str

@GraphDBRouter.post("/create-user-information", status_code=status.HTTP_201_CREATED)
async def add_label(body: LabelRequestBody):
    try:
        record = await create_user_information(body.user_id)
        return {"message": "User created successfully", "user": record["u"]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {e}"
        )
