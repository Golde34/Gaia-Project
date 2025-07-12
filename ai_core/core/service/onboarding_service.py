import json
import re

from core.domain.enums.enum import SemanticRoute
from core.domain.request.query_request import QueryRequest
from core.domain.response.base_response import return_success_response
from core.domain.response.model_output_schema import DailyRoutineSchema
from core.prompts import onboarding_prompt
from core.service import chat_service
from core.service.gaia_abilities_service import chitchat
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db
from kernel.config import llm_models, config


default_model = config.LLM_DEFAULT_MODEL


async def introduce(query: QueryRequest, guided_route: str) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        print("Onboarding Query:", query.query)
        recent_history, recursive_summary, long_term_memory = await chat_service.query_chat_history(query, semantic_response=None)
        if guided_route == SemanticRoute.GAIA_INTRODUCTION:
            response = await _gaia_introduce(query, recent_history, recursive_summary, long_term_memory)
        elif guided_route == SemanticRoute.CHITCHAT:
            response = await chitchat(query)
        else:
            raise ValueError("No route found for the query.")

        data = {
            'type': guided_route,
            'response': response
        }

        return return_success_response(
            status_message="Onboarding response generated successfully",
            data=data
        )
    except Exception as e:
        raise e


async def _gaia_introduce(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
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
        recent_history=recent_history,
        recursive_summary=recursive_summary,
        long_term_memory=long_term_memory,
        query=query.query,
    )

    function = await llm_models.get_model_generate_content(default_model, query.user_id, prompt=prompt)
    response = function(prompt=prompt, model_name=default_model)
    print("Response:", response)
    return response


async def register_task(query: QueryRequest, guided_route=None) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        recent_history, _, long_term_memory = await chat_service.query_chat_history(query, semantic_response=None)
        prompt = onboarding_prompt.REGISTER_SCHEDULE_CALENDAR.format(
            query=query.query,
            recentHistory=recent_history,
            long_term_memory=long_term_memory)
        
        function = await llm_models.get_model_generate_content(default_model, query.user_id, prompt=prompt)
        response = function(prompt=prompt, model_name=default_model)
        
        json_str = clean_json_string(response)
        schedule_dto = DailyRoutineSchema.model_validate(json.loads(json_str))
        result = {
            "response": schedule_dto
        }
        return return_success_response(
            status_message="Task registration response generated successfully",
            data=result
        )
    except Exception as e:
        raise e


def clean_json_string(raw_str: str) -> str:
    cleaned = re.sub(r"^```json\s*|\s*```$", "",
                     raw_str, flags=re.MULTILINE).strip()
    return cleaned
