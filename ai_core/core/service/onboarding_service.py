from datetime import datetime
from typing import Dict, List, Optional
from pydantic import ValidationError
from langdetect import detect
import json
import re

from core.domain.enums import enum, kafka_enum
from core.domain.enums.enum import SemanticRoute
from core.domain.request.query_request import QueryRequest
from core.domain.response.base_response import return_success_response, return_response
from core.domain.response.model_output_schema import DailyRoutineSchema, TimeBubbleDTO
from core.prompts import onboarding_prompt
from core.prompts.abilities_prompt import CHITCHAT_WITH_HISTORY_PROMPT
from core.service import chat_service
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.kafka.producer import send_kafka_message, publish_message
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
        if guided_route == SemanticRoute.GAIA_INTRODUCTION:
            response = await handle_onboarding_action(query, enum.SemanticRoute.GAIA_INTRODUCTION.value)
        elif guided_route == SemanticRoute.CHITCHAT:
            response = await handle_onboarding_action(query, enum.SemanticRoute.CHITCHAT.value)
        else:
            raise ValueError("No route found for the query.")

        data = {
            'type': guided_route.value,
            'response': response
        }

        return return_success_response(
            status_message="Onboarding response generated successfully",
            data=data
        )
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
        response = await handle_onboarding_action(query, selection)

        return return_success_response(
            status_message="Onboarding response generated successfully",
            data=response
        )

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

    function = await llm_models.get_model_generate_content(default_model, query.user_id, prompt=prompt)
    response = function(prompt=prompt, model_name=default_model)
    print("Response:", response)
    return response


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
        function = await llm_models.get_model_generate_content(query.model_name, query.user_id)
        response = function(prompt=prompt, model_name=query.model_name)
        return response
    except Exception as e:
        raise e


async def _generate_calendar_schedule_response(query: QueryRequest, recent_history: str, long_term_memory: str) -> Dict:
    try:
        prompt = onboarding_prompt.REGISTER_CALENDAR_READINESS_PROMPT.format(
            query=query.query,
            recent_history=recent_history,
            long_term_memory=long_term_memory
        )
        function = await llm_models.get_model_generate_content(query.model_name, query.user_id)
        response = function(prompt=prompt, model_name=query.model_name)
        json_response = _clean_json_string(response)
        parsed_response = json.loads(json_response)
        if (parsed_response.get("ready", False)):
            print("User is ready to register calendar schedule.")
            query: QueryRequest = {
                "user_id": query.user_id,
                "dialogue_id": query.dialogue_id,
                "model_name": query.model_name,
                "query": parsed_response.get("requirement", query.query),
                "type": "register_calendar_schedule"
            }
            await send_kafka_message(kafka_enum.KafkaTopic.REGISTER_CALENDAR_SCHEDULE.value, query)

        return parsed_response 
    except Exception as e:
        print(f"Error generating calendar schedule: {str(e)}")


async def _chitchat_and_register_calendar(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
    try:
        prompt = onboarding_prompt.CHITCHAT_AND_RECOMMEND_REGISTER_CALENDAR_PROMPT.format(
            query=query.query,
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory
        )
        function = await llm_models.get_model_generate_content(query.model_name, query.user_id)
        response = function(prompt=prompt, model_name=query.model_name)
        return response
    except Exception as e:
        raise e


async def generate_calendar_schedule(query: QueryRequest) -> Dict:
    # Step 1: Preprocess query (language detection and translation)
    query_text = query.query.strip()
    try:
        detected_language = detect(query_text)
        print(f"Detected language: {detected_language}")
        if detected_language != "en":
            query_text = await translate_to_english(query_text, detected_language)
            print(f"Translated query: {query_text}")
    except Exception as e:
        detected_language = "en"
        print("Language detection failed; defaulting to English")

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
    print(f"LLM response: {response}")

    # Step 5: Parse response
    try:
        json_response = _clean_json_string(response)
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

    # Step 6: Handle clarification request
    # if "clarification_needed" in parsed_response:
    #     print(
    #         f"Clarification needed: {parsed_response['clarification_needed']}")
    #     return return_clarification_response(
    #         status_message="Additional information required",
    #         data={"clarification": parsed_response["clarification_needed"]}
    #     )

    # # Step 7: Handle modifications
    # if parsed_response.get("modification", False):
    #     existing_schedule = recent_history.get("latest_schedule", {})
    #     for day in parsed_response["schedule"]:
    #         parsed_response["schedule"][day] = merge_schedules(
    #             existing_schedule, parsed_response["schedule"], day
    #         )

    # Step 8: Validate schedule
    try:
        schedule_dto = DailyRoutineSchema.model_validate(parsed_response)
        totals = calculate_totals(schedule_dto.schedule)
        total_hours = sum(totals.values())

        # if abs(total_hours - 24) > 0.01:  # Allow small float errors
        #     print(
        #         f"Total hours ({total_hours}) does not sum to 24; filling gaps")
        #     for day in schedule_dto.schedule:
        #         schedule_dto.schedule[day] = fill_schedule_gaps(
        #             schedule_dto.schedule[day])
        #     totals = calculate_totals(
        #         schedule_dto.schedule)  # Recalculate totals
        #     total_hours = sum(totals.values())

        #     if abs(total_hours - 24) > 0.01:  # Final check
        #         print(
        #             f"Total hours ({total_hours}) still invalid after gap filling")
        #         return return_clarification_response(
        #             status_message="Schedule does not sum to 24 hours",
        #             data={
        #                 "clarification": "Please provide a schedule that covers exactly 24 hours."}
        #         )
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
    schedule_dto.totals = totals  # Update totals in DTO
    result = {"response": schedule_dto, "userId": query.user_id}
    print(f"Generated schedule: {schedule_dto}")
    publish_message(kafka_enum.KafkaTopic.GENERATE_CALENDAR_SCHEDULE.value,
                   kafka_enum.KafkaCommand.GENERATE_CALENDAR_SCHEDULE.value, result)


async def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text to English using a translation service.
    Replace with actual implementation (e.g., Google Cloud Translate).
    """
    print(f"Translating from {source_lang} to English: {text}")
    # Mock translation; integrate Google Translate, DeepL, or similar
    return text  # Replace with actual translation logic


def merge_schedules(existing_schedule: Dict[str, List], new_intervals: Dict[str, List], day: str) -> List:
    """
    Merge new intervals into an existing schedule, resolving conflicts by prioritizing new entries.
    """
    merged = existing_schedule.get(day, []).copy()
    new_entries = new_intervals.get(day, [])

    # Remove conflicting intervals (new entries take precedence)
    for new_entry in new_entries:
        merged = [entry for entry in merged if not (
            entry.start < new_entry.end and new_entry.start < entry.end
        )]
        merged.append(new_entry)

    # Sort by start time and fill gaps
    merged.sort(key=lambda x: x.start)
    return fill_schedule_gaps(merged)


def _clean_json_string(raw_str: str) -> str:
    cleaned = re.sub(r"^```json\s*|\s*```$", "",
                     raw_str, flags=re.MULTILINE).strip()
    return cleaned


def fill_schedule_gaps(intervals: List[Dict]) -> List[Dict]:
    """
    Fill gaps in a day's schedule with 'relax' to ensure 24-hour coverage.
    """
    if not intervals:
        return [{"start": "00:00", "end": "23:59", "tag": "relax"}]

    filled = []
    current_time = "00:00"
    for interval in intervals:
        if interval["start"] > current_time:
            filled.append(
                {"start": current_time, "end": interval["start"], "tag": "relax"})
        filled.append(interval)
        current_time = interval["end"]

    if current_time < "23:59":
        filled.append({"start": current_time, "end": "23:59", "tag": "relax"})

    return filled


def calculate_totals(schedule: Dict[str, List[TimeBubbleDTO]]) -> Dict[str, float]:
    """
    Calculate total hours per tag for a single day's schedule.
    """
    totals = {"work": 0, "eat": 0, "travel": 0, "relax": 0, "sleep": 0}
    for day in schedule:
        for interval in schedule[day]:
            start = datetime.strptime(interval.start, "%H:%M")
            end = datetime.strptime(interval.end, "%H:%M")
            hours = (end - start).total_seconds() / 3600
            totals[interval.tag] += hours
    return totals
