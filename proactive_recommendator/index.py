from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from kernel.connection.graphdb_connection import get_neo4j_driver, close_neo4j_driver
from ui.controller import graphdb_controller


# Kafka consumer setup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to GraphDB
    driver_initialized = False
    try:
        driver = get_neo4j_driver()
        driver_initialized = True
        await driver.verify_connectivity()
        print("Connected to Neo4j database successfully.")
    except Exception as e:
        print(f"Failed to connect to Neo4j database: {e}")

    # asyncio.create_task(consume())

    yield

    if driver_initialized:
        try:
            await close_neo4j_driver()
            print("Disconnected from Neo4j database.")
        except Exception as e:
            print(f"Failed to close Neo4j database connection: {e}")

app = FastAPI(title="Task Information Extraction API", lifespan=lifespan)

# Add CORS middleware for SSE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphdb_controller.GraphDBRouter)

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=4005, reload=True)
