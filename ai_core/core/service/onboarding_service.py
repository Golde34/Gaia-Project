import json
import re

from core.prompts.classify_prompt import ONBOARDING_PROMPT
from core.domain.request.query_request import SystemRequest, QueryRequest
from core.domain.response.model_output_schema import DailyRoutineSchema
from core.service.task_service import chitchat
from kernel.config import llm_models, config
from infrastructure.embedding.base_embedding import BaseEmbedding
from infrastructure.semantic_router import route, samples, router
from infrastructure.vector_db.milvus import MilvusDB
from kernel.config import config 


default_model = "gemini-2.0-flash"

def register_task(query: SystemRequest) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        prompt = ONBOARDING_PROMPT.format(query=query.query)
        print("Onboarding Prompt:", prompt)
        response = llm_models.get_model_generate_content(
            default_model)(prompt=prompt,
                                model_name=default_model,
                                )
        json_str = clean_json_string(response)
        data_dict = json.loads(json_str)
        schedule_dto = DailyRoutineSchema.parse_obj(data_dict)
        result = {
            "response": schedule_dto 
        }
        return result
    except Exception as e:
        raise e

def clean_json_string(raw_str: str) -> str:
    cleaned = re.sub(r"^```json\s*|\s*```$", "",
                    raw_str, flags=re.MULTILINE).strip()
    return cleaned

GAIA_INTRODUCTION_ROUTE_NAME='introduction'
CHITCHAT_ROUTE_NAME='chitchat'
introduction_route = route.Route(name=GAIA_INTRODUCTION_ROUTE_NAME, samples=samples.gaia_introduction_sample) 
chitchat_route = route.Route(name=CHITCHAT_ROUTE_NAME,samples=samples.chitchat_sample)
semantic_router=router.SemanticRouter(routes=[introduction_route, chitchat_route], model_name=config.EMBEDDING_MODEL)
embedding_model = BaseEmbedding()

def gaia_introduction(query: SystemRequest) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        guided_route = semantic_router.guide(query.query)
        print(f"Semantic router: {guided_route}")
        if guided_route is None:
            raise ValueError("No suitable route found for the query.")
        if guided_route == GAIA_INTRODUCTION_ROUTE_NAME:
            query_embedding = embedding_model.get_embeddings(texts=[query.query])
            milvusDb = MilvusDB()
            search_result = milvusDb.search_top_n(
                query_embeddings=query_embedding,
                top_k=5,
                partition_name="context"
                )

            results = []
            for hits in search_result:
                for hit in hits:
                    results.append({
                        "content": hit["content"],
                        "score": hit["distance"],
                        "metadata": hit["metadata"]
                    })
            print("Search results:", results)
            return {
                "response": results
            }
        if guided_route == CHITCHAT_ROUTE_NAME:
            query= QueryRequest(query=query.query, model_name=default_model)
            chitchat(query=query)    
        
    except Exception as e:
        raise e