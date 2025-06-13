from dataclasses import dataclass
from kernel.config import config


@dataclass
class RerankingConfig:
    url: str = config.RERANKING_API
    use_model_api: bool = config.USE_RERANKING_API
    api_model_name: str = config.RERANKING_MODEL_API
    model_name: str = config.RERANKING_MODEL

    # todo
    # max_results: int = config.RERANKING_MAX_RESULTS
    # top_k: int = config.RERANKING_TOP_K