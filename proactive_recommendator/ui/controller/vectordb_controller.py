from fastapi import APIRouter, HTTPException, status

from core.service import command_label_service
from core.domain.entities.vectordb.command_label_entity import CommandLabel 


VectorDBRouter = APIRouter(
    prefix="/vectordb",
    tags=["VectorDB"],
)

@VectorDBRouter.post("/add-command-label", status_code=status.HTTP_201_CREATED)
async def add_command_label():
    try:
        await command_label_service.insert_command_label()
        return {"message": "Command label added successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add command label: {e}"
        )

@VectorDBRouter.get("/get-command-label", status_code=status.HTTP_200_OK)
async def get_command_label(query: str = None):
    try:
        command = await command_label_service.get_command_label(query)
        return {"message": "Command label retrieved successfully", "command": command}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve command label: {e}"
        )