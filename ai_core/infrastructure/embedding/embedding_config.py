from dataclasses import dataclass
# from kernel.config import config


# @dataclass
# class EmbeddingConfig:
#     url: str = config.EMBEDDING_API 
#     model_name = config.EMBEDDING_MODEL

@dataclass
class EmbeddingConfigTest:
    url: str = "localhost:7997"
    model_name: str = "BAAI/bge-large-en-v1.5"

    # def __post_init__(self):
    #     self.url = self.url.rstrip('/')
    #     self.endpoint = f"{self.url}/embed"