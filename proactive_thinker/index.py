from contextlib import asynccontextmanager
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import uvicorn


load_dotenv()

# Kafka consumer setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # asyncio.create_task(consume())
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

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4005, reload=True)
