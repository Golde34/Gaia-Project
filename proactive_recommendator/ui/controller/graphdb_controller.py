from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from core.usecase import user_information_usecase
from core.service.graphdb import graphdb_service


GraphDBRouter = APIRouter(
    prefix="/graphdb",
    tags=["GraphDB"],
)


@GraphDBRouter.get("/get-user-information", status_code=status.HTTP_201_CREATED)
async def add_label(user_id: int):
    try:
        record = await user_information_usecase.get_user_information(user_id)
        return {"message": "User list successfully", "user": record}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {e}"
        )


@GraphDBRouter.post("/delete-all", status_code=status.HTTP_201_CREATED)
async def delete_all():
    try:
        record = await graphdb_service.clear_database()
        return {"result": record}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete all: {e}"
        )
