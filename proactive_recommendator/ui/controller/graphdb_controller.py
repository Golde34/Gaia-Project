from fastapi import APIRouter, HTTPException, status

from core.domain.request.node_bundle_request import NodeBundle
from core.service import user_information_service
from core.usecase import label_usecase 
from infrastructure.repository.graphdb import base


GraphDBRouter = APIRouter(
    prefix="/graphdb",
    tags=["GraphDB"],
)


@GraphDBRouter.get("/get-user-information", status_code=status.HTTP_201_CREATED)
async def add_label(user_id: int):
    try:
        record = await user_information_service.get_user_information(user_id)
        return {"message": "User list successfully", "user": record}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {e}"
        )


@GraphDBRouter.post("/delete-all", status_code=status.HTTP_201_CREATED)
async def delete_all():
    try:
        record = await base.clear_database()
        return {"result": record}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete all: {e}"
        )

## Create Router to upsert graph node label
@GraphDBRouter.post("/upsert-node-bundle", status_code=status.HTTP_201_CREATED)
async def upsert_node_bundle(payload: NodeBundle):
    try:
        return await label_usecase.upsert_label_node(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upsert node bundle: {e}"
        )