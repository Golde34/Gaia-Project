from fastapi import FastAPI, Request 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import asyncio
import uuid
import uvicorn

from ui.controller import chat_controller, onboarding_controller, rag_controller
from infrastructure.kafka.consumer import consume
from kernel.config.config import session_id_var


load_dotenv()

app = FastAPI(title="Task Information Extraction API")

# Add CORS middleware for SSE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_controller.ChatRouter)
app.include_router(onboarding_controller.OnboardingRouter)
app.include_router(rag_controller.RagRouter)

# Middleware
@app.middleware("http")
async def add_session_id_to_context(request: Request, call_next):
    session_id_var.set(uuid.uuid4().hex)
    response = await call_next(request)
    return response

# Kafka consumer setup
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consume())

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
