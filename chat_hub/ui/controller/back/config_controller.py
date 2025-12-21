
import traceback
from fastapi import APIRouter, HTTPException

from core.usecase import config


ConfigRouter = APIRouter(
    prefix="/config",
    tags=["config"],
)

@ConfigRouter.post("/cache/clear-user-llm-config/{user_id}")
async def user_llm_config(user_id: str):
    try:
        config.clear_user_llm_config(user_id)
        return {"status": "success", "message": f"Cleared LLM config cache for user {user_id}"} 
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))

@ConfigRouter.post("/vectordb/collections")
async def create_vectordb_collections():
    try:
        config.create_vectordb_collections()
        return {"status": "success", "message": "VectorDB collections created successfully"}
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))