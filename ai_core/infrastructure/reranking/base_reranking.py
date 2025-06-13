import asyncio
from asyncio import Queue
import aiohttp
from typing import List, Dict, Any
import traceback

import reranking_config


class BaseReranking:
    def __init__(self, config: reranking_config.RerankingConfig):
        self.base_url = config.url.rstrip('/')
        self.api_model_name = config.api_model_name
        self.use_model_api = config.use_model_api
        self.model_name = config.model_name

        self.endpoint = f"http://{self.base_url}/rerank"
        self.session_queue = Queue(maxsize=20)

    async def rerank(self, query: str, documents: List[Dict[str, Any]], top_n: int, logger=None) -> Dict[str, Any]:
        """
        Rerank a list of documents based on the query.

        Args:
            query (str): The query string.
            documents (List[Dict[str, Any]]): List of documents to rerank.
            logger: Optional logger for logging errors.

        Returns:
            Dict[str, Any]: Dictionary containing the reranked documents.
        """
        if self.use_model_api:
            return await self._rerank_from_api(query, documents, top_n, logger)
        return await self._rerank_from_model(query, documents, top_n, logger)

    async def _rerank_from_model(self, query: str, documents: List[Dict[str, Any]], top_n: int, logger=None):
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(self.model_name)
            embeddings = model.encode([doc['text'] for doc in documents], convert_to_tensor=True)
            query_embedding = model.encode(query, convert_to_tensor=True)
            from sklearn.metrics.pairwise import cosine_similarity
            similarities = cosine_similarity(query_embedding.reshape(1, -1), embeddings).flatten()
            ranked_indices = similarities.argsort()[::-1][:top_n]
            reranked_documents = [documents[i] for i in ranked_indices]
            return {"documents": reranked_documents, "query": query, "top_n": top_n}
        except Exception as e:
            if logger:
                logger.error(f"Error in _rerank_from_model: {e}")
            else:
                print(f"Error in _rerank_from_model: {e}")
            traceback.print_exc()
            return {"error": str(e)}

    async def _rerank_from_api(self, query: str, documents: List[Dict[str, Any]], top_n: int, logger=None):
        payload = {
            "query": query,
            "documents": documents,
            "model": self.api_model_name,
            "top_n": top_n,
            "return_documents": False,
            "raw_scores": True
        }

        session = await self.session_queue.get()
        try:
            async with session.post(self.endpoint, json=payload) as response:
                response.raise_for_status()
                data = await response.json()
                
                indices = [result['index'] for result in data['results']]
                scores = [result['relevance_score'] for result in data['results']]
                
                sorted_documents = [documents[idx] for idx in indices]
                
                return {
                    "documents": sorted_documents,
                    "scores": scores,
                }
        except Exception as e:
            if logger:
                logger.error(f"Error in _rerank_from_api: {e}")
            else:
                print(f"Error in _rerank_from_api: {e}")
            traceback.print_exc()
            return {"error": str(e)}
