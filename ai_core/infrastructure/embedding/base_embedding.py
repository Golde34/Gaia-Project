import asyncio
import aiohttp
from typing import List, Dict, Any
import traceback
import time

from core.domain.enum.enum import ModelMode
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

        self.endpoint = f"http://{self.base_url}/embed"
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

    async def _get_embedding_api(self, texts: List[str], logger = None) -> Dict[str, Any]:
        payload = {
            "inputs": texts
        }
        try:
            if logger:
                logger.add_log(f"Start call embedding {time.perf_counter()}")
            
            print(f"Calling embedding service at {self.endpoint} with payload: {payload}")
            async with aiohttp.ClientSession() as session:
                async with session.post(self.endpoint, json=payload) as response:
                    print(f"Received response with status {response} from {self.endpoint}")
                    if response.status != 200:
                        error_message = await response.text()
                        if logger:
                            logger.add_log(f"Error from embedding service: {error_message}", "ERROR")
                        raise Exception(f"Embedding service returned error: {error_message}") 
            try:
                result = await response.json()
            except:
                result = response
                
            return result
        except Exception as e:
            stack_trace = traceback.format_exc()
            if logger:
                logger.add_log(f"Error getting embeddings: {stack_trace}", "ERROR")
            raise

    async def _get_embedding_from_model(self, texts: List[str], logger: None):
        # Use cached model if available
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

import asyncio
import time
import aiohttp
from typing import List
import logging

import random

def generate_random_sentences(count: int) -> list:
    subjects = ["The cat", "A dog", "The bird", "My friend", "The student", "The teacher", "A scientist", "The doctor", 
                "The artist", "The musician", "A child", "The engineer", "The chef", "A programmer", "The writer"]
    
    verbs = ["walks", "runs", "jumps", "studies", "reads", "writes", "plays", "works", "creates", "builds", 
             "designs", "cooks", "programs", "explores", "discovers"]
    
    objects = ["in the park", "at home", "at school", "in the lab", "at the office", "in the garden", 
               "at the library", "in the studio", "at the hospital", "in the kitchen", "on the computer",
               "through the forest", "by the lake", "in the city", "at the museum"]
    
    adjectives = ["happy", "busy", "creative", "curious", "dedicated", "energetic", "focused", "helpful",
                  "innovative", "kind", "motivated", "patient", "skilled", "thoughtful", "wise"]
    
    sentences = []
    for i in range(count):
        subject = random.choice(subjects)
        verb = random.choice(verbs)
        obj = random.choice(objects)
        adj = random.choice(adjectives)
        
        # Vary sentence structure
        if random.random() < 0.5:
            sentence = f"The {adj} {subject.lower()} {verb} {obj}"
        else:
            sentence = f"{subject} {verb} {obj} while being {adj}"
            
        sentences.append(sentence)
    
    return sentences

async def worker(worker_id: int, embedder: BaseEmbedding, texts: List[str], duration_seconds: int = 60):
    """
    Worker that continuously gets embeddings and logs results
    
    Args:
        worker_id: ID of the worker for logging
        embedder: Embedding instance to use
        texts: List of texts to embed
        duration_seconds: How long to run the worker for (default 60 seconds)
    """
    end_time = time.perf_counter() + duration_seconds
    call_count = 0
    
    while time.perf_counter() < end_time:
        try:
            start_time = time.perf_counter()
            embeddings = await embedder.get_embeddings(generate_random_sentences(1))
            elapsed = time.perf_counter() - start_time
            
            call_count += 1
            print(f"Worker {worker_id} | Call {call_count} | Time: {elapsed:.2f}s | "
                  f"Embeddings: {len(embeddings)}x{len(embeddings[0])} | "
                  f"Type: {type(embeddings[0][0])}")
                  
        except aiohttp.ClientError as e:
            print(f"Worker {worker_id} error: {e}")
            await asyncio.sleep(1)  # Wait before retrying on error
            
        # Optional: Add a small delay between calls to avoid overwhelming the API
        await asyncio.sleep(0.1)
        


async def main():
    # Initialize logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Initialize the embedding class
    embedder = BaseEmbedding()
    
    # Example texts for embedding
    texts = [
        "This is a 1st sentence",
        "This is the 2nd test", 
        "This is the 3rd test"
    ]
    
    # Create 5 workers
    workers = []
    num_workers = 2 
    run_duration = 60  # Run for 60 seconds
    
    logger.info(f"Starting {num_workers} workers for {run_duration} seconds...")
    
    for i in range(num_workers):
        worker_task = asyncio.create_task(
            worker(i+1, embedder, texts, run_duration)
        )
        workers.append(worker_task)
    
    # Wait for all workers to complete
    await asyncio.gather(*workers)
    
    logger.info("All workers completed!")

if __name__ == "__main__":
    asyncio.run(main())
    
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(main())

# Global instance for easy access across modules
embedding_model = BaseEmbedding()

