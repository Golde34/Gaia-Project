from fastapi import APIRouter, HTTPException, status

from core.service.command_label_service import insert_command_label 


VectorDBRouter = APIRouter(
    prefix="/vectordb",
    tags=["VectorDB"],
)

@VectorDBRouter.post("/add-command-label", status_code=status.HTTP_201_CREATED)
async def add_command_label():
    try:
        await insert_command_label()
        return {"message": "Command label added successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add command label: {e}"
        )