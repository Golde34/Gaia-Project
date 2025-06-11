import asyncio
import aiohttp
from typing import List, Dict, Any
import traceback
import time

import embedding_config

class BaseEmbedding:
    def __init__(self, config: embedding_config.EmbeddingConfig = None):
        self.base_url = config.url.strip('/')
        self.api_model_name = config.api_model_name 
        self.use_model_api = config.use_model_api
        self.model_name = config.model_name

        self.endpoint = f"{self.base_url}/embeddings"

    async def get_embeddings(self, texts: List[str], logger = None) -> Dict[str, Any]:
        """
        Get embeddings for a list of texts.

        Args:
            texts (List[str]): List of texts to embed.
            logger: Optional logger for logging errors.

        Returns:
            Dict[str, Any]: Dictionary containing the embeddings.
        """
        if self.use_model_api:
            return await self._get_embeddings_from_api(texts, logger)
        return await self._get_embeddings_from_model(texts, logger)

    async def _get_embeddings_from_model(self, texts: List[str], logger=None):
        try:
            from sentence_transformers import SentenceTransformer
            if logger:
                logger.add_log(f"Using model {self.model_name} for embeddings.")
            for text in texts:
                if not text.strip():
                    raise ValueError("Text cannot be empty or whitespace.")
                
                model = SentenceTransformer(self.model_name)
                embeddings = model.encode(texts, show_progress_bar=False, convert_to_tensor=True)
                return {"embeddings": embeddings.tolist()}
        except Exception as e:
            if logger:
                logger.error(f"Error in _get_embeddings_from_model: {e}")
            else:
                print(f"Error in _get_embeddings_from_model: {e}")
            traceback.print_exc()
            return {"error": str(e)}
    
    async def _get_embeddings_from_api(self, texts: List[str], logger=None):
        try:
            if logger:
                logger.add_log(f"Using API {self.endpoint} for embeddings.")
            request = {
                "inputs": texts,
            }
            response = await aiohttp.ClientSession().post(
                self.endpoint,
                request,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=60)
            )
            result = await response.json()
            if response.status != 200:
                error_message = result.get("error", "Unknown error")
                if logger:
                    logger.error(f"API error: {error_message}")
                else:
                    print(f"API error: {error_message}")
                return {"error": error_message}
            return result
        except Exception as e:
            stack_trace = traceback.format_exc()
            if logger:
                logger.error(f"Error in _get_embeddings_from_api: {e}\n{stack_trace}")
            else:
                print(f"Error in _get_embeddings_from_api: {e}\n{stack_trace}")
            return {"error": str(e)}

