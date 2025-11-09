import json
from typing import Dict, Optional
from langdetect import detect
from datetime import datetime

from pydantic import ValidationError

from core.domain.enums import kafka_enum, enum
from core.domain.response.model_output_schema import DailyRoutineSchema
from core.domain.response.base_response import return_response
from core.domain.request.query_request import QueryRequest
from core.prompts import onboarding_prompt
from core.service import chat_service, onboarding_service
from infrastructure.kafka.producer import publish_message
from kernel.config import config, llm_models
from kernel.utils.parse_json import bytes_to_str


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
        if guided_route == enum.SemanticRoute.GAIA_INTRODUCTION:
            return await handle_onboarding_action(query, enum.SemanticRoute.GAIA_INTRODUCTION.value)
        elif guided_route == enum.SemanticRoute.CHITCHAT:
            return await handle_onboarding_action(query, enum.SemanticRoute.CHITCHAT.value)
        else:
            raise ValueError("No route found for the query.")
    except Exception as e:
        raise e


async def register_schedule_calendar(query: QueryRequest, guided_route: Optional[str] = None) -> Dict:
    """
    Register or modify a task via a user's daily life summary, using Chain of Thought to handle
    incomplete or ambiguous inputs in a single LLM call.

    Args:
        query (QueryRequest): User's daily summary or schedule modification request.
        guided_route: Optional parameter for guided routing (not used in this version).

    Returns:
        Dict: Response containing the schedule or a clarification request.
    """
    print(
        f"Processing query: {query.query} (Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S %Z')})")

    try:
        selection_prompt = onboarding_prompt.CLASSIFY_REGISTER_CALENDAR_PROMPT.format(query=query.query)
        function = await llm_models.get_model_generate_content(default_model, query.user_id, prompt=selection_prompt)
        selection = function(prompt=selection_prompt,
                             model_name=default_model).strip().lower()
        print(f"Selected action: {selection}")
        return await handle_onboarding_action(query, selection)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return return_response(
            status="error",
            status_message="Unexpected error occurred",
            error_code=400,
            error_message=str(e),
            data=None
        )


async def handle_onboarding_action(query: QueryRequest, selection: str) -> dict:
    recent_history, recursive_summary, long_term_memory = await chat_service.query_chat_history(query)

    handlers = {
        enum.SemanticRoute.GAIA_INTRODUCTION.value:
            lambda: onboarding_service.gaia_introduce(
                query, recent_history, recursive_summary, long_term_memory),
        enum.SemanticRoute.CHITCHAT.value:
            lambda: onboarding_service.chitchat_with_history(
                query, recent_history, recursive_summary, long_term_memory),
        enum.GaiaAbilities.REGISTER_SCHEDULE_CALENDAR.value:
            lambda: onboarding_service.generate_calendar_schedule_response(
                query, recent_history=recent_history, long_term_memory=long_term_memory),
        enum.GaiaAbilities.CHITCHAT.value:
            lambda: onboarding_service.chitchat_and_register_calendar(
                query, recent_history, recursive_summary, long_term_memory),
    }

    handler = handlers.get(selection)
    return await handler() if handler else None

async def generate_calendar_schedule(query: QueryRequest) -> Dict:
    query_text = query.query.strip()
    # Step 1: Preprocess query (language detection and translation)
    # query_text = await _detect(query_text) 

    recent_history, _, long_term_memory = await chat_service.query_chat_history(query)
    print(f"Retrieved recent history: {recent_history}")

    # Step 3: Construct CoT prompt
    prompt = onboarding_prompt.REGISTER_SCHEDULE_CALENDAR_V2.format(
        query=query_text,
        recent_history=json.dumps(recent_history),
        long_term_memory=long_term_memory
    )

    # Step 4: Call LLM
    function = await llm_models.get_model_generate_content(default_model, query.user_id, prompt=prompt)
    response = function(prompt=prompt, model_name=default_model)

    # Step 5: Parse response
    try:
        json_response = onboarding_service.clean_json_string(response)
        parsed_response = json.loads(json_response)
        print(f"Parsed JSON response: {json_response}")
    except json.JSONDecodeError as e:
        print(f"Invalid JSON response: {str(e)}")
        return return_response(
            status="error",
            status_message="Failed to parse LLM response",
            error_code=400,
            error_message=str(e),
            data=None
        )

    # Step 8: Validate schedule
    try:
        schedule_dto = DailyRoutineSchema.model_validate(parsed_response)
    except ValidationError as e:
        print(f"Schema validation failed: {str(e)}")
        return return_response(
            status="error",
            status_message="Invalid schedule format",
            error_code=400,
            error_message=str(e),
            data=None
        )

    # Step 9: Success case
    safe_response = json.loads(json.dumps(
        schedule_dto.model_dump(), default=bytes_to_str))
    result = {"response": safe_response, "userId": query.user_id}
    print(f"Generated schedule: {schedule_dto}")
    await publish_message(
        kafka_enum.KafkaTopic.GENERATE_CALENDAR_SCHEDULE.value,
        kafka_enum.KafkaCommand.GENERATE_CALENDAR_SCHEDULE.value,
        result,
    )

async def _detect(query_text: str) -> str:
    try:
        detected_language = detect(query_text)
        print(f"Detected language: {detected_language}")
        if detected_language != "en":
            query_text = await onboarding_service.translate_to_english(query_text, detected_language)
            print(f"Translated query: {query_text}")
        return query_text
    except Exception as e:
        detected_language = "en"
        print("Language detection failed; defaulting to English")
