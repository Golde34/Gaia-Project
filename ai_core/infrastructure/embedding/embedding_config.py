from dataclasses import dataclass
from kernel.config import config


@dataclass
class EmbeddingConfig:
    url: str = config.EMBEDDING_API 
    use_model_api: bool = config.USE_EMBEDDING_API
    api_model_name: str = config.EMBEDDING_MODEL_API
    model_name = config.EMBEDDING_MODEL