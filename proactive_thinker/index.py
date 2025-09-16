from contextlib import asynccontextmanager
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware

from infrastructure.graphdb.graphdb_connection import GraphDBConnection 
from kernel.config.config import Config
import uvicorn



# Kafka consumer setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Loading config
    config = Config()
    # Connect to GraphDB
    app.graphdb = GraphDBConnection(
        uri=config.GRAPHDB_URI,
        user=config.GRAPHDB_USER,
        password=config.GRAPHDB_PASSWORD
    )
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
