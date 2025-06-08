import os


SYSTEM_API_KEY = os.getenv('SYSTEM_API_KEY', 'your_system_api_key_here')
OPENAPI_KEY = os.getenv('OPENAPI_KEY', 'your_openai_api_key_here')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'your_gemini_api_key_here')
LLAMA_API_KEY = os.getenv('LLAMA_API_KEY', 'your_llama_api_key_here')
LLAMA_API_URL = os.getenv('LLAMA_API_URL', 'https://api.llama.com/v1/generate')

EMBEDDING_MODEL = os.getenv('EMBEDDING_CONFIG', 'default_embedding_config')
RERANKING_MODEL = os.getenv('RERANKING_CONFIG', 'default_reranking_config')

EMBEDDING_API = os.getenv('EMBEDDING_API', 'https://api.embedding.com/v1/embeddings')
EMBEDDING_MODEL_API = os.getenv('EMBEDDING_MODEL_API', 'https://api.embedding.com/v1/models')
USE_EMBEDDING_API = os.getenv('USE_EMBEDDING_API', False)

RERANKING_API = os.getenv('RERANKING_API', 'https://api.reranking.com/v1/rerank')
RERANKING_MODEL_API = os.getenv('RERANKING_MODEL_API', 'https://api.reranking.com/v1/models')
USE_RERANKING_API = os.getenv('USE_RERANKING_API', False)