
import traceback
from fastapi import APIRouter, HTTPException

from core.usecase.cache import clear_user_llm_config


CacheRouter = APIRouter(
    prefix="/cache",
    tags=["cache"],
)

@CacheRouter.post("/clear-user-llm-config/{user_id}")
async def user_llm_config(user_id: str):
    try:
        clear_user_llm_config(user_id)
        return {"status": "success", "message": f"Cleared LLM config cache for user {user_id}"} 
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
