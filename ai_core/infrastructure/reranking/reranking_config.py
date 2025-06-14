from dataclasses import dataclass
from kernel.config import config


@dataclass
class RerankingConfig:
    url: str = config.RERANKING_API
    model_name: str = config.RERANKING_MODEL

    # todo
    # max_results: int = config.RERANKING_MAX_RESULTS
    # top_k: int = config.RERANKING_TOP_K