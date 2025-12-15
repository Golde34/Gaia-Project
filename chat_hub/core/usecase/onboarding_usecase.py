from datetime import datetime
from typing import Dict, Optional

from langdetect import detect
from core.abilities.ability_routers import llm_route
from core.domain.enums import enum
from core.domain.response.model_output_schema import DailyRoutineSchema
from core.domain.request.query_request import QueryRequest
from core.service import memory_service, onboarding_service
from core.service.integration.dialogue_service import dialogue_service
from core.service.integration.message_service import message_service
from core.prompts import onboarding_prompt
from kernel.config import config, llm_models


default_model = config.LLM_DEFAULT_MODEL


@llm_route(label=enum.ChatType.GAIA_INTRODUCTION.value, 
           description='Introduce GAIA and its capabilities.')
async def introduce(query: QueryRequest, guided_route: str) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (QueryRequest): onboarding user's daily summary
    Returns:
        user_daily_entries (dict):
    """
    try:
        print("Onboarding Query:", query.query)
        if guided_route == enum.SemanticRoute.GAIA_INTRODUCTION:
            return await onboarding_service.handle_onboarding_action(query, enum.SemanticRoute.GAIA_INTRODUCTION.value), "onboarding"
        elif guided_route == enum.SemanticRoute.CHITCHAT:
            return await onboarding_service.handle_onboarding_action(query, enum.SemanticRoute.CHITCHAT.value), "onboarding"
        else:
            raise ValueError("No route found for the query.")
    except Exception as e:
        raise e


@llm_route(label=enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value, 
           description='Register schedule calendar.')
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
        selection_prompt = onboarding_prompt.CLASSIFY_REGISTER_CALENDAR_PROMPT.format(
            query=query.query)
        function = await llm_models.get_model_generate_content(query.model, query.user_id, prompt=selection_prompt)
        selection = function(prompt=selection_prompt, model=query.model) 
        print(f"Selected action: {selection}")
        return await onboarding_service.handle_onboarding_action(query, selection), "register_schedule_calendar"
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise e 


async def generate_calendar_schedule(query: QueryRequest) -> Dict:
    # query_text = query.query.strip()
    # query_text = await _detect_language(query_text)
    # query.query = query_text

    recent_history, _, long_term_memory = await memory_service.query_chat_history(query)
    print(f"Retrieved recent history: {recent_history}")

    schedule_dto: DailyRoutineSchema = await onboarding_service.llm_generate_calendar_schedule(
        query, recent_history, long_term_memory)

    print(f"Generated schedule: {schedule_dto}")
    response = await onboarding_service.return_generated_schedule(query.user_id, schedule_dto)

    msg_type = enum.DialogueEnum.REGISTER_SCHEDULE_CALENDAR_TYPE.value
    dialogue, _ = await dialogue_service.get_or_create_dialogue(user_id=query.user_id, msg_type=msg_type, dialogue_id=None)
    if dialogue is None:
        raise Exception("Failed to get or create dialogue")
    bot_message_id = await message_service.create_message(
            dialogue=dialogue,
            user_id=query.user_id,
            message=response["data"]["response"],
            message_type=msg_type,
            sender_type=enum.SenderTypeEnum.BOT.value,
            user_message_id=query.user_message_id,
        )
    print(f"Created bot message with ID: {bot_message_id}")


async def _detect_language(query: str) -> str:
    try:
        detected_language = detect(query_text)
        print(f"Detected language: {detected_language}")
        if detected_language != "en":
            query_text = await onboarding_service.translate_to_english(query_text, detected_language)
            print(f"Translated query: {query_text}")
    except Exception as e:
        detected_language = "en"
        print("Language detection failed; defaulting to English")
