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
async def get_command_label(label: str = None, keywords: str = None, name: str = None, description: str = None, query: str = None):
    try:
        command_label = CommandLabel(
            label=label,
            name=name if name else "",
            description=description if description else "",
            keywords=keywords.split(", ") if keywords else [],
            example=[query] if query else []
        )
        commands = await command_label_service.get_command_label(command_label)
        return {"message": "Command label retrieved successfully", "commands": commands}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve command label: {e}"
        )
