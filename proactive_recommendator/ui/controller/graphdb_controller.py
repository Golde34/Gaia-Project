from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from core.service.graphdb_service import test_create_user_info


GraphDBRouter = APIRouter(
    prefix="/graphdb",
    tags=["GraphDB"],
)

class LabelRequestBody(BaseModel):
    label: str
    obj: str

@GraphDBRouter.post("/add-label", status_code=status.HTTP_201_CREATED)
async def add_label(body: LabelRequestBody):
    try:
        record = await test_create_user_info(body.label, body.obj)
        return {"message": "User created successfully", "user": record["u"]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {e}"
        )
