from fastapi import APIRouter, HTTPException, status

from core.service import command_label_service
from core.domain.request.command_label_request import CommandLabelRequest


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
async def query_command_label(query: str = None):
    try:
        command = await command_label_service.query(query)
        return {"message": "Command label retrieved successfully", "command": command}
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
