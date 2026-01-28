import contextvars
from dotenv import load_dotenv
import os


load_dotenv()

session_id_var = contextvars.ContextVar("session_id", default=None)

SYSTEM_ORGANIZATION = os.getenv('SYSTEM_ORGANIZATION', 'google')
SYSTEM_API_KEY = os.getenv('SYSTEM_API_KEY', 'your_system_api_key_here')
OPENAPI_KEY = os.getenv('OPENAPI_KEY', 'your_openai_api_key_here')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your_gemini_api_key_here')
LLAMA_API_KEY = os.getenv('LLAMA_API_KEY', 'your_llama_api_key_here')
LLAMA_API_URL = os.getenv('LLAMA_API_URL', 'https://api.llama.com/v1/generate')
LLM_DEFAULT_MODEL = os.getenv('LLM_DEFAULT_MODEL', 'gemini-2.5-flash')
LLM_SUB_MODEL = os.getenv('LLM_SUB_MODEL', 'gemini-2.5-flash-lite')

EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL')
RERANKING_MODEL = os.getenv('RERANKING_MODEL', 'default_reranking_config')
MODEL_MODE = os.getenv('MODEL_MODE', 'vllm')

EMBEDDING_RERANKING_HOST = os.getenv('EMBEDDING_RERANKING_HOST', 'http://localhost:8000')
EMBEDDING_RERANKING_PORT = int(os.getenv('EMBEDDING_RERANKING_PORT', 8000))

EMBEDDING_API = EMBEDDING_RERANKING_HOST + f":{EMBEDDING_RERANKING_PORT}" 
RERANKING_API = EMBEDDING_RERANKING_HOST + f":{EMBEDDING_RERANKING_PORT}" 

REDIS_MODE = os.getenv('REDIS_MODE', 'cluster')
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', 'bitnami')

CHAT_HIS_SEMANTIC_THRESHOLD = float(os.getenv('CHAT_HISTORY_SEMANTIC_ROUTER_THRESHOLD', 0.7))
REGISTER_CALENDAR_SEMANTIC_THRESHOLD = float(os.getenv('REGISTER_CALENDAR_SEMANTIC_ROUTER_THRESHOLD', 0.8))

RECOMMENDATION_SERVICE_HOST = os.getenv('RECOMMENDATION_SERVICE_HOST', 'localhost')
RECOMMENDATION_SERVICE_PORT = int(os.getenv('RECOMMENDATION_SERVICE_PORT', 4005))
RECOMMENDATION_SERVICE_URL = (
    f"http://{RECOMMENDATION_SERVICE_HOST}:{RECOMMENDATION_SERVICE_PORT}/proactive-recommendator"
)

AUTH_SERVICE_HOST = os.getenv('AUTH_SERVICE_HOST', 'localhost')
AUTH_SERVICE_PORT = int(os.getenv('AUTH_SERVICE_PORT', 4001))
AUTH_SERVICE_URL = f"http://{AUTH_SERVICE_HOST}:{AUTH_SERVICE_PORT}"

SCHEDULE_PLAN_SERVICE_HOST = os.getenv('SCHEDULE_PLAN_SERVICE_HOST', 'localhost')
SCHEDULE_PLAN_SERVICE_PORT = int(os.getenv('SCHEDULE_PLAN_SERVICE_PORT', 3002))
SCHEDULE_PLAN_SERVICE_URL = f"http://{SCHEDULE_PLAN_SERVICE_HOST}:{SCHEDULE_PLAN_SERVICE_PORT}"

TASK_MANAGER_SERVICE_HOST = os.getenv('TASK_MANAGER_SERVICE_HOST', 'localhost')
TASK_MANAGER_SERVICE_PORT = int(os.getenv('TASK_MANAGER_SERVICE_PORT', 3000))
TASK_MANAGER_SERVICE_URL = f"http://{TASK_MANAGER_SERVICE_HOST}:{TASK_MANAGER_SERVICE_PORT}"

# PostgreSQL configuration for ai_core service
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', 5432))
POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'password')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'ai_core')

RECENT_HISTORY_MAX_LENGTH = int(os.getenv('RECENT_HISTORY_MAX_LENGTH', 3))
RECURSIVE_SUMMARY_MAX_LENGTH = int(os.getenv('RECURSIVE_SUMMARY_MAX_LENGTH', 3))
LONG_TERM_MEMORY_MAX_LENGTH = int(os.getenv('LONG_TERM_MEMORY_MAX_LENGTH', 10))

DEFAULT_SEMANTIC_RESPONSE = {
    "recent_history": True,
    "recursive_summary": True,
    "long_term_memory": True
}

BACKGROUND_LOOP_POOL_SIZE = int(os.getenv('BACKGROUND_LOOP_POOL_SIZE', 2))

# Search ability configuration
GOOGLE_SEARCH_API_KEY = os.getenv('GOOGLE_SEARCH_API_KEY', '')
GOOGLE_SEARCH_ENGINE_ID = os.getenv('GOOGLE_SEARCH_ENGINE_ID', '')
SEARCH_DEFAULT_TOP_K = int(os.getenv('SEARCH_DEFAULT_TOP_K', 5))
SEARCH_CACHE_TTL = int(os.getenv('SEARCH_CACHE_TTL', 300))
SEARCH_HTTP_TIMEOUT = int(os.getenv('SEARCH_HTTP_TIMEOUT', 6))
SEARCH_MAX_EXTRACT_CHARS = int(os.getenv('SEARCH_MAX_EXTRACT_CHARS', 2000))
SEARCH_MAX_PROMPT_CHARS = int(os.getenv('SEARCH_MAX_PROMPT_CHARS', 3000))
