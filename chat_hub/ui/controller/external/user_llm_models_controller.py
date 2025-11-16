from fastapi import APIRouter, Request


UserLLMModelsRouter = APIRouter(
    prefix="/user-model",
    tags=["user-model"],
)

@UserLLMModelsRouter.get("")
async def get_all_user_model(request: Request):
    pass

@UserLLMModelsRouter.post("/upsert")
async def upsert_user_model(request: Request):
    pass