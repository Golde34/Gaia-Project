from dotenv import load_dotenv
import os

load_dotenv()


SYSTEM_API_KEY = os.getenv('SYSTEM_API_KEY', 'your_system_api_key_here')
OPENAPI_KEY = os.getenv('OPENAPI_KEY', 'your_openai_api_key_here')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your_gemini_api_key_here')
LLAMA_API_KEY = os.getenv('LLAMA_API_KEY', 'your_llama_api_key_here')
LLAMA_API_URL = os.getenv('LLAMA_API_URL', 'https://api.llama.com/v1/generate')
LLM_DEFAULT_MODEL = os.getenv('LLM_DEFAULT_MODEL', 'gemini-2.0-flash')

EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL')
RERANKING_MODEL = os.getenv('RERANKING_MODEL', 'default_reranking_config')
MODEL_MODE = os.getenv('MODEL_MODE', 'vllm')

EMBEDDING_RERANKING_HOST = os.getenv('EMBEDDING_RERANKING_HOST', 'http://localhost:8000')
EMBEDDING_RERANKING_PORT = int(os.getenv('EMBEDDING_RERANKING_PORT', 8000))

EMBEDDING_API = EMBEDDING_RERANKING_HOST + f":{EMBEDDING_RERANKING_PORT}" 
RERANKING_API = EMBEDDING_RERANKING_HOST + f":{EMBEDDING_RERANKING_PORT}" 

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', 'bitnami')

CHAT_HIS_SEMANTIC_THRESHOLD = float(os.getenv('CHAT_HISTORY_SEMANTIC_ROUTER_THRESHOLD', 0.7))

CHAT_HUB_SERVICE_HOST = os.getenv('CHAT_HUB_SERVICE_HOST', 'localhost')
CHAT_HUB_SERVICE_PORT = int(os.getenv('CHAT_HUB_SERVICE_PORT', 4004))
CHAT_HUB_SERVICE_URL = f"http://{CHAT_HUB_SERVICE_HOST}:{CHAT_HUB_SERVICE_PORT}"