from dotenv import load_dotenv
import os

load_dotenv()


class Config:
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', 'bitnami')

    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL')
    RERANKING_MODEL = os.getenv('RERANKING_MODEL', 'default_reranking_config')
    MODEL_MODE = os.getenv('MODEL_MODE', 'vllm')

    EMBEDDING_RERANKING_HOST = os.getenv('EMBEDDING_RERANKING_HOST', 'http://localhost:8000')
    EMBEDDING_RERANKING_PORT = int(os.getenv('EMBEDDING_RERANKING_PORT', 8000))

    EMBEDDING_API = EMBEDDING_RERANKING_HOST + f":{EMBEDDING_RERANKING_PORT}" 
    RERANKING_API = EMBEDDING_RERANKING_HOST + f":{EMBEDDING_RERANKING_PORT}"
    
    AUTH_SERVICE_URL = os.getenv('AUTH_SERVICE_URL', 'http://localhost:4001')
    TASK_MANAGER_URL = os.getenv('TASK_MANAGER_URL', 'http://localhost:3002')