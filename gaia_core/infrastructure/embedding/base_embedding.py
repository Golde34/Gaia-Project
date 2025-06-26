import aiohttp
from typing import List, Dict, Any
import traceback
import time

from core.domain.enum.enum import ModelMode
from core.domain.response.vllm_response import VllmEmbeddingResponse
from infrastructure.embedding import embedding_config


class BaseEmbedding:
    _instance = None
    _model = None  # Cache for SentenceTransformer model

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BaseEmbedding, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.config = embedding_config.EmbeddingConfig()
        self.base_url = self.config.url
        self.model_name = self.config.model_name

        self.endpoint = f"http://{self.base_url}/embeddings"
        self.model_mode = self.config.model_mode 
        self._initialized = True

    async def get_embeddings(self, texts: List[str], logger = None) -> Dict[str, Any]:
        print(f"Getting embeddings for texts: {texts} using model mode: {self.model_mode}")
        if self.model_mode == ModelMode.LOCAL.value:
            return await self._get_embedding_from_model(texts, logger)
        elif self.model_mode == ModelMode.VLLM.value:
            return await self._get_embedding_api(texts, logger)
        elif self.model_mode == ModelMode.CLOUD.value:
            return await self._get_embedding_from_cloud(texts, logger)

    async def _get_embedding_api(self, texts: List[str], logger = None):
        payload = {
            "model": self.model_name,
            "input": texts
        }

        embedding_list = []
        try:
            print(f"Calling embedding service at {self.endpoint} with payload: {payload}")
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, json=payload) as response:
                    result = await response.json()
                    if response.status != 200:
                        error_message = await response.text()
                        raise Exception(f"Embedding service returned error: {error_message}") 
              
                    try:
                        embedding_response = VllmEmbeddingResponse(**result)  
                    except Exception as e:
                        print(f"Error parsing response JSON: {e}")
                        raise

            for embedding in embedding_response.data:
                embedding_list.append(embedding.embedding)
            return embedding_list
        except Exception as e:
            stack_trace = traceback.format_exc()
            print(f"Error getting embeddings: {stack_trace}")
            raise

    async def _get_embedding_from_model(self, texts: List[str], logger: None):
        if BaseEmbedding._model is None:
            from sentence_transformers import SentenceTransformer
            BaseEmbedding._model = SentenceTransformer(self.model_name)
            print(f"Loaded model: {self.model_name} for embedding")
        
        print(f"Using cached model: {self.model_name} for embedding")
        embeding_list = []
        for text in texts:
            try:
                if logger:
                    logger.add_log(f"Start embedding text: {text} at {time.perf_counter()}")
                embedding = BaseEmbedding._model.encode(text, convert_to_tensor=True)
                print(f"Generated embedding of shape: {embedding.shape} for text: {text}")
                if logger:
                    logger.add_log(f"Finished embedding text: {text} at {time.perf_counter()}")
                embeding_list.append(embedding)
            except Exception as e:
                stack_trace = traceback.format_exc()
                if logger:
                    logger.add_log(f"Error embedding text: {text} - {stack_trace}", "ERROR")
                raise
        return embeding_list

    async def _get_embedding_from_cloud(self, text: str, logger: None):
        """
        Placeholder for cloud embedding logic
        """
        raise NotImplementedError("Cloud embedding logic not implemented yet")

# Global instance for easy access across modules
embedding_model = BaseEmbedding()

