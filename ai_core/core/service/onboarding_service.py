import json
import re

from core.prompts.classify_prompt import ONBOARDING_PROMPT
from core.domain.enum.enum import SemanticRoute
from core.domain.request.query_request import SystemRequest, QueryRequest
from core.domain.response.model_output_schema import DailyRoutineSchema
from core.prompts.onboarding_prompt import GAIA_INTRODUCTION_PROMPT, CHITCHAT_PROMPT
from kernel.config import llm_models, config
from infrastructure.embedding.base_embedding import BaseEmbedding
from infrastructure.semantic_router.router_registry import gaia_introduction_route
from infrastructure.vector_db.milvus import MilvusDB
from kernel.config import config


default_model = config.LLM_DEFAULT_MODEL
milvus_db = MilvusDB()


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


def gaia_introduction(query: SystemRequest) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        embedding_model = BaseEmbedding()
        guided_route = gaia_introduction_route(query.query)
        if guided_route == SemanticRoute.GAIA_INTRODUCTION:
            query_embedding = embedding_model.get_embeddings(
                texts=[query.query])
            search_result = milvus_db.search_top_n(
                query_embeddings=query_embedding,
                top_k=5,
                partition_name="context"
            )

            prompt = GAIA_INTRODUCTION_PROMPT.format(
                system_info=search_result,
                query=query.query
            )

            response = llm_models.get_model_generate_content(
                default_model)(prompt=prompt,
                               model_name=default_model)
            print("Response:", response)
            return response
        if guided_route == SemanticRoute.CHITCHAT:
            prompt = CHITCHAT_PROMPT.format(query=query.query)

            response = llm_models.get_model_generate_content(
                default_model)(prompt=prompt,
                               model_name=default_model)
            print("Response:", response)
            return response

    except Exception as e:
        raise e
