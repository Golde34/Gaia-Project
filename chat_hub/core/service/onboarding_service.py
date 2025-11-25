import asyncio
from collections import defaultdict
from typing import Dict
from pydantic import ValidationError
import json

from infrastructure.client.schedule_plan_client import schedule_plan_client
from core.domain.enums import enum, kafka_enum
from core.domain.request.query_request import LLMModel, QueryRequest
from core.domain.response.base_response import return_response
from core.domain.response.model_output_schema import DailyRoutineSchema, TimeBubbleDTO
from core.prompts import onboarding_prompt
from core.prompts.abilities_prompt import CHITCHAT_WITH_HISTORY_PROMPT
from core.service import chat_service
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.kafka.producer import publish_message
from infrastructure.vector_db.milvus import milvus_db
from kernel.config import llm_models, config
from kernel.utils.parse_json import bytes_to_str, clean_json_string
from kernel.utils.background_loop import log_background_task_error


async def handle_onboarding_action(query: QueryRequest, selection: str) -> dict:
    recent_history, recursive_summary, long_term_memory = await chat_service.query_chat_history(query)

    handlers = {
        enum.SemanticRoute.GAIA_INTRODUCTION.value:
            lambda: _gaia_introduce(
                query, recent_history, recursive_summary, long_term_memory),
        enum.SemanticRoute.CHITCHAT.value:
            lambda: _chitchat_with_history(
                query, recent_history, recursive_summary, long_term_memory),
        enum.GaiaAbilities.REGISTER_SCHEDULE_CALENDAR.value:
            lambda: _generate_calendar_schedule_response(
                query, recent_history=recent_history, long_term_memory=long_term_memory),
        enum.GaiaAbilities.CHITCHAT.value:
            lambda: _chitchat_and_register_calendar(
                query, recent_history, recursive_summary, long_term_memory),
    }

    handler = handlers.get(selection)
    return await handler() if handler else None


async def _gaia_introduce(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
    embedding = await embedding_model.get_embeddings(texts=[enum.VectorDBContext.GAIA_INTRODUCTION.value])
    query_embeddings = milvus_validation.validate_milvus_search_top_n(
        embedding)

    results = milvus_db.search_top_n(
        query_embeddings=query_embeddings,
        top_k=4,
        partition_name="default_context"
    )

    prompt = onboarding_prompt.GAIA_INTRODUCTION_PROMPT.format(
        system_info=results[0][0]['content'],
        recent_history=recent_history,
        recursive_summary=recursive_summary,
        long_term_memory=long_term_memory,
        query=query.query,
    )
    model: LLMModel = LLMModel(
        model_name=config.LLM_DEFAULT_MODEL,
        model_key=config.SYSTEM_API_KEY
    )

    function = await llm_models.get_model_generate_content(model=model, user_id=query.user_id, prompt=prompt)
    return function(prompt=prompt, model=model)

async def _chitchat_with_history(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
    """
    Chitchat with history pipeline
    Args:
        query (str): The user's query containing task information.
        recent_history (str): Recent chat history.
        recursive_summary (str): Recursive summary of the conversation.
        long_term_memory (str): Long term memory of the user.
    Returns:
        str: Short response to the request
    """
    try:
        prompt = CHITCHAT_WITH_HISTORY_PROMPT.format(
            query=query.query,
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory
        )
        if query.model is None:
            model: LLMModel = LLMModel(
                model_name=config.LLM_DEFAULT_MODEL,
                model_key=config.SYSTEM_API_KEY
            )
        else:
            model = query.model
        function = await llm_models.get_model_generate_content(model, query.user_id)
        return function(prompt=prompt, model=model)
    except Exception as e:
        raise e


async def _generate_calendar_schedule_response(query: QueryRequest, recent_history: str, long_term_memory: str) -> Dict:
    try:
        readiness = await _prepare_calendar_readiness(
            query=query,
            recent_history=recent_history,
            long_term_memory=long_term_memory,
        )

        if readiness["ready"]:
            background_task = asyncio.create_task(
                _dispatch_register_calendar_request(
                    query=query,
                    requirement=readiness["requirement"],
                )
            )
            background_task.add_done_callback(log_background_task_error)

        return readiness["response"]
    except Exception as e:
        print(f"Error generating calendar schedule: {str(e)}")


async def _prepare_calendar_readiness(query: QueryRequest, recent_history: str, long_term_memory: str) -> Dict[str, object]:
    prompt = onboarding_prompt.REGISTER_CALENDAR_READINESS_PROMPT.format(
        query=query.query,
        recent_history=recent_history,
        long_term_memory=long_term_memory
    )
    if query.model is None:
        model: LLMModel = LLMModel(
            model_name=config.LLM_DEFAULT_MODEL,
            model_key=config.SYSTEM_API_KEY
        )
    else:
        model = query.model
    function = await llm_models.get_model_generate_content(model, query.user_id)
    response = await asyncio.to_thread(function, prompt=prompt, model=model)
    json_response = clean_json_string(response)

    try:
        parsed_response = json.loads(json_response)
    except json.JSONDecodeError as exc:
        print(f"Failed to parse readiness response: {exc}")
        return {
            "ready": False,
            "requirement": query.query,
            "response": "Sorry, I couldn't process your request at this time.",
        }

    ready = bool(parsed_response.get("ready", False))
    requirement = parsed_response.get("requirement", query.query)
    response_text = parsed_response.get(
        "response",
        "Sorry, I couldn't process your request at this time."
    )

    return {
        "ready": ready,
        "requirement": requirement,
        "response": response_text,
    }


async def _dispatch_register_calendar_request(query: QueryRequest, requirement: str) -> None:
    payload = {
        "user_id": query.user_id,
        "dialogue_id": query.dialogue_id,
        "model_name": query.model_name,
        "query": requirement,
        "type": "register_calendar_schedule",
        "user_message_id": query.user_message_id,
    }

    try:
        await publish_message(
            kafka_enum.KafkaTopic.REGISTER_CALENDAR_SCHEDULE.value,
            kafka_enum.KafkaCommand.GENERATE_CALENDAR_SCHEDULE.value,
            payload,
        )
    except Exception as exc:
        print(f"Failed to dispatch register calendar request: {exc}")


async def _chitchat_and_register_calendar(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
    try:
        prompt = onboarding_prompt.CHITCHAT_AND_RECOMMEND_REGISTER_CALENDAR_PROMPT.format(
            query=query.query,
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory
        )
        if query.model is None:
            model: LLMModel = LLMModel(
                model_name=config.LLM_DEFAULT_MODEL,
                model_key=config.SYSTEM_API_KEY
            )
        else:
            model = query.model
        function = await llm_models.get_model_generate_content(model, query.user_id)
        response = function(prompt=prompt, model=model)
        return response
    except Exception as e:
        raise e


async def llm_generate_calendar_schedule(query: QueryRequest, recent_history: str, long_term_memory: str) -> str:
    prompt = onboarding_prompt.REGISTER_SCHEDULE_CALENDAR.format(
        query=query.query.strip(),
        recent_history=json.dumps(recent_history),
        long_term_memory=long_term_memory
    )

    model: LLMModel = LLMModel(
        model_name=config.LLM_DEFAULT_MODEL,
        model_key=config.SYSTEM_API_KEY
    )
    function = await llm_models.get_model_generate_content(model, query.user_id, prompt=prompt)
    response = function(prompt=prompt, model=model)
    try:
        json_response = clean_json_string(response)
        parsed_response = json.loads(json_response)
        print(f"Parsed JSON response: {json_response}")
    except json.JSONDecodeError as e:
        print(f"Invalid JSON response: {str(e)}")
        return return_response(status="error", status_message="Failed to parse LLM response",
                               error_code=400, error_message=str(e), data=None)

    try:
        return DailyRoutineSchema.model_validate(parsed_response)
    except ValidationError as e:
        print(f"Schema validation failed: {str(e)}")
        return return_response(status="error", status_message="Invalid schedule format",
                               error_code=400, error_message=str(e), data=None)


async def return_generated_schedule(user_id: int, payload: DailyRoutineSchema):
    safe_response = json.loads(json.dumps(
        payload.model_dump(), default=bytes_to_str))
    result = await schedule_plan_client.create_or_update_time_bubble_configs(
        user_id=user_id,
        schedule_config=safe_response
    )
    if result == {}:
        print("No response from Schedule Plan Service.")
        return {
            "response": "System Error! Failed to generate schedule. Please try again later."
        }

    response = _validate_generated_calendar_result(result, user_id, payload)

    await publish_message(
        kafka_enum.KafkaTopic.GENERATE_CALENDAR_SCHEDULE.value,
        kafka_enum.KafkaCommand.GENERATE_CALENDAR_SCHEDULE.value,
        response,
    )

    return response


def _validate_generated_calendar_result(result: dict, user_id: int, payload: DailyRoutineSchema) -> Dict:
    if type(result.get("taskConfig")) is str:
        task_config = payload.totals
    return {
        "userId": user_id,
        "timeBubbleConfig": _convert_to_schedule_format(result.get("timeBubblesConfig")),
        "taskConfig": task_config.model_dump(),
        "response": payload.response,
    }


def _convert_to_schedule_format(time_bubbles: list) -> Dict[str, list]:
    schedule = defaultdict(list)

    for slot in time_bubbles:
        day = slot["dayOfWeek"]
        schedule[day].append({
            "start": slot["startTime"][:-3],
            "end": slot["endTime"][:-3],
            "tag": slot["tag"]
        })

    return dict(schedule)


async def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text to English using a translation service.
    Replace with actual implementation (e.g., Google Cloud Translate).
    """
    print(f"Translating from {source_lang} to English: {text}")
    # Mock translation; integrate Google Translate, DeepL, or similar
    return text  # Replace with actual translation logic
