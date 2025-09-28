from fastapi import APIRouter, HTTPException, status

from core.service import command_label_service
from core.domain.request.command_label_request import CommandLabelRequest
from core.usecase import command_label_usecase


VectorDBRouter = APIRouter(
    prefix="/vectordb",
    tags=["VectorDB"],
)


@VectorDBRouter.post("/add-command-label", status_code=status.HTTP_201_CREATED)
async def add_command_label(entity: CommandLabelRequest):
    try:
        await command_label_service.insert_command_label(entity)
        return {"message": "Command label added successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add command label: {e}"
        )


@VectorDBRouter.get("/query-command-label", status_code=status.HTTP_200_OK)
async def query_command_label(query: str = None, type: str = "vector"):
    try:
        command = await command_label_usecase.search_command_label(query, type)
        return {"message": "Command label retrieved successfully", "commands": command}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve command label: {e}"
        )


@VectorDBRouter.get("/get-command-label", status_code=status.HTTP_200_OK)
async def get_command_label(label: str):
    try:
        commands = await command_label_service.get_command_label(label)
        return {"message": "Command label retrieved successfully", "commands": commands}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve command label: {e}"
        )

@VectorDBRouter.get("/rank-command-label", status_code=status.HTTP_200_OK)
async def rank_command_label(query: str):
    try:
        commands = await command_label_usecase.rank_labels_by_relevance(query)
        return {"message": "Command label ranked successfully", "commands": commands}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rank command label: {e}"
        )