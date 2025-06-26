import json
import re

from core.validation import milvus_validation
from core.domain.enum.enum import SemanticRoute
from core.domain.request.query_request import SystemRequest
from core.domain.response.model_output_schema import DailyRoutineSchema
from core.prompts import onboarding_prompt, classify_prompt
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.semantic_router import route, samples, router, router_registry
from infrastructure.vector_db.milvus import milvus_db
from kernel.config import llm_models, config


default_model = config.LLM_DEFAULT_MODEL

GAIA_INTRODUCTION_ROUTE_NAME = 'introduction'
CHITCHAT_ROUTE_NAME = 'chitchat'
introduction_route = route.Route(
    name=GAIA_INTRODUCTION_ROUTE_NAME, samples=samples.gaia_introduction_sample)
chitchat_route = route.Route(
    name=CHITCHAT_ROUTE_NAME, samples=samples.chitchat_sample)
semantic_router = router.SemanticRouter(
    routes=[introduction_route, chitchat_route], model_name=config.EMBEDDING_MODEL)


async def gaia_introduction(query: SystemRequest) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        guided_route = await router_registry.gaia_introduction_route(query.query)
        if guided_route == SemanticRoute.GAIA_INTRODUCTION:
            return _gaia_introduce(query)
        elif guided_route == SemanticRoute.CHITCHAT:
            return _chitchat(query) 
        else:
            raise ValueError("No route found for the query.")
    except Exception as e:
        raise e


async def _gaia_introduce(query: SystemRequest):
    query_embedding = await embedding_model.get_embeddings(
        texts=[query.query])

    query_embeddings = milvus_validation.validate_milvus_search_top_n(
        query_embedding)
    search_result = milvus_db.search_top_n(
        query_embeddings=query_embeddings,
        top_k=1,
        partition_name="context"
    )

    prompt = onboarding_prompt.GAIA_INTRODUCTION_PROMPT.format(
        system_info=search_result,
        query=query.query
    )

    response = llm_models.get_model_generate_content(
        default_model)(prompt=prompt,
                       model_name=default_model)
    print("Response:", response)
    data = {
        'type': SemanticRoute.GAIA_INTRODUCTION.value,
        'response': response
    }
    return data


async def _chitchat(query: SystemRequest):
    """
    Chitchat pipeline
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: Short response to the request
    """
    prompt = onboarding_prompt.CHITCHAT_PROMPT.format(query=query.query)
    if not query.model_name:
        query.model_name = default_model
    response = llm_models.get_model_generate_content(
        query.model_name)(prompt=prompt, model_name=query.model_name)
    print("Response:", response)
    
    data = {
        'type': SemanticRoute.CHITCHAT.value,
        'response': response
    }
    return data


def register_task(query: SystemRequest) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        prompt = classify_prompt.REGISTER_SCHEDULE_CALENDAR.format(
            query=query.query)
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
