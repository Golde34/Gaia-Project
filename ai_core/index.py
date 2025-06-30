from fastapi import FastAPI 
from dotenv import load_dotenv

import asyncio
import uvicorn

from ui.controller import chat_controller, onboarding_controller, rag_controller 
from infrastructure.kafka.consumer import consume


load_dotenv()

app = FastAPI(title="Task Information Extraction API")

app.include_router(chat_controller.ChatRouter)
app.include_router(onboarding_controller.OnboardingRouter)
app.include_router(rag_controller.RagRouter)

# Kafka consumer setup
asyncio.create_task(consume())

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4002, reload=True)
