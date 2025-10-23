from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import asyncio
import uuid
import uvicorn

from core.middleware.validate_access_token import ValidateAccessTokenMiddleware
from ui.controller import (
    auth_controller, chat_controller, chat_interaction_controller,
    onboarding_controller, rag_controller, llm_business_handler_controller
)
from infrastructure.kafka.consumer import consume
from kernel.config.config import session_id_var


load_dotenv()


# Kafka consumer setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(consume())
    yield

app = FastAPI(title="Task Information Extraction API", lifespan=lifespan)

# Add CORS middleware for SSE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ValidateAccessTokenMiddleware)

app.include_router(chat_controller.ChatRouter)
app.include_router(onboarding_controller.OnboardingRouter)
app.include_router(rag_controller.RagRouter)
app.include_router(llm_business_handler_controller.LLMBusinessHandlerRouter)
app.include_router(auth_controller.AuthRouter)
app.include_router(chat_interaction_controller.ChatInteractionRouter)

# Middleware
@app.middleware("http")
async def add_session_id_to_context(request: Request, call_next):
    session_id_var.set(uuid.uuid4().hex)
    response = await call_next(request)
    return response

# @app.on_event("startup")
# async def startup_event():
#     asyncio.create_task(consume())

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
