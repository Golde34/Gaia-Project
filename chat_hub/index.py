from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import asyncio
import uuid
import uvicorn

from ui.controller.back import config_controller, rag_controller, tool_controller
from ui.controller.external import auth_controller, chat_interaction_controller
from ui.controller.internal import llm_business_handler_controller, chat_system_controller
from core.middleware.validate_access_token import ValidateAccessTokenMiddleware
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
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)
app.add_middleware(ValidateAccessTokenMiddleware)

app.include_router(rag_controller.RagRouter)
app.include_router(auth_controller.AuthRouter)
app.include_router(chat_interaction_controller.ChatInteractionRouter)
app.include_router(chat_system_controller.ChatSystemRouter)
app.include_router(config_controller.ConfigRouter)
app.include_router(tool_controller.ToolRouter)

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
