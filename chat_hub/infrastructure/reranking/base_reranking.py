from asyncio import Queue
from typing import List, Dict, Any
import traceback

import aiohttp

from chat_hub.kernel.config import config
from core.domain.enums.enum import ModelMode
from infrastructure.reranking import reranking_config


class BaseReranking:
    def __init__(self):
        self.config = reranking_config.RerankingConfig()
        self.base_url = self.config.url
        self.model_name = self.config.model_name
        self.api_model_name = self.config.api_model_name

        self.endpoint = f"http://{self.base_url}/rerank"
        self.session_queue = Queue(maxsize=20)
        self.model_mode = self.config.model_mode

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
        if self.model_mode == ModelMode.VLLM.value:
            return await self._rerank_from_vllm(query, documents, top_n, logger)
        elif self.model_mode == ModelMode.LOCAL.value:
            return await self._rerank_from_model(query, documents, top_n, logger)
        elif self.model_mode == ModelMode.API.value:
            return await self._rerank_from_api(query, documents, top_n, logger)

    async def _rerank_from_model(self, query: str, documents: List[Dict[str, Any]], top_n: int, logger=None):
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(self.model_name)
            embeddings = model.encode(
                [doc['text'] for doc in documents], convert_to_tensor=True)
            query_embedding = model.encode(query, convert_to_tensor=True)
            from sklearn.metrics.pairwise import cosine_similarity
            similarities = cosine_similarity(
                query_embedding.reshape(1, -1), embeddings).flatten()
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

    async def _rerank_from_vllm(self, query: str, documents: List[Dict[str, Any]], top_n: int, logger=None):
        """
        Rerank documents using infinity rerank API.
        """
        # Extract text from documents
        doc_texts = [doc.get('text', '') for doc in documents]

        payload = {
            "query": query,
            "documents": doc_texts,  # Send list of strings, not dict
            "model": self.model_name,
            "top_n": top_n,
            "return_documents": False,
            "raw_scores": True
        }

        try:
            print(f"Calling reranking service at {self.endpoint}")
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, json=payload) as response:
                    response.raise_for_status()
                    data = await response.json()

                    # Parse response: results = [{"index": 0, "relevance_score": 0.95}, ...]
                    results = data.get('results', [])
                    indices = [result['index'] for result in results]
                    scores = [result['relevance_score'] for result in results]

                    # Map back to original documents using indices
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

    async def _rerank_from_api(self, query: str, documents: List[Dict[str, Any]], top_n: int, logger=None):
        from google import genai
        client = genai.Client(api_key=config.SYSTEM_API_KEY)
        try:
            doc_texts = [doc.get('text', '') for doc in documents]
            response = client.models.rerank(
                model=self.api_model_name,
                query=query,
                documents=doc_texts,
                top_n=top_n
            )
            ranked_indices = [item.index for item in response.ranked_documents]
            reranked_documents = [documents[i] for i in ranked_indices]
            return {"documents": reranked_documents, "query": query, "top_n": top_n} 
            
        except Exception as e:
            print(f"Error getting embeddings from Gemini: {e}")
            raise


reranking_model = BaseReranking()
