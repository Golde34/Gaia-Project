import json
import re

from core.domain.enums import enum
from core.domain.enums.enum import SemanticRoute
from core.domain.request.query_request import QueryRequest
from core.domain.response.base_response import return_success_response, return_clarification_response, return_response
from core.domain.response.model_output_schema import DailyRoutineSchema
from core.prompts import onboarding_prompt
from core.prompts.abilities_prompt import CHITCHAT_WITH_HISTORY_PROMPT
from core.service import chat_service
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
        recent_history, recursive_summary, long_term_memory = await chat_service.query_chat_history(query)
        if guided_route == SemanticRoute.GAIA_INTRODUCTION:
            response = await _gaia_introduce(query, recent_history, recursive_summary, long_term_memory)
        elif guided_route == SemanticRoute.CHITCHAT:
            response = await _chitchat_with_history(query, recent_history, recursive_summary, long_term_memory)
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
    embedding = await embedding_model.get_embeddings(texts=[enum.VectorDBContext.GAIA_INTRODUCTION.value])
    query_embeddings = milvus_validation.validate_milvus_search_top_n(embedding)

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


import logging
import json
from langdetect import detect, DetectorFactory
from pydantic import ValidationError

logger = logging.getLogger(__name__)
DetectorFactory.seed = 0

async def register_schedule_calendar(query: QueryRequest, guided_route=None) -> dict:
    """
    Register or modify a task via a user's daily life summary, using Chain of Thought to handle incomplete or ambiguous inputs.

    Args:
        query (QueryRequest): User's daily summary or schedule modification request.
        guided_route: Optional parameter for guided routing (not used in this version).

    Returns:
        dict: Response containing the schedule or a clarification request.
    """
    try:
        # Step 1: Detect query language
        logger.info(f"Processing query: {query.query}")
        query_text = query.query.strip()
        try:
            detected_language = detect(query_text)
        except LangDetectException:
            detected_language = "en"
        logger.info(f"Detected language: {detected_language}")
        
        # Step 2: Retrieve context
        recent_history, _, long_term_memory = await chat_service.query_chat_history(query)
        logger.info(f"Retrieved recent history: {recent_history}")

        # Step 3: Construct CoT prompt
        prompt = onboarding_prompt.REGISTER_SCHEDULE_CALENDAR.format(
            query=query_text,
            recent_history=recent_history,
            long_term_memory=long_term_memory
        )

        # Step 4: Call LLM with CoT reasoning
        function = await llm_models.get_model_generate_content(default_model, query.user_id, prompt=prompt)
        response = function(prompt=prompt, model_name=default_model)
        logger.info(f"LLM response: {response}")

        # Step 5: Parse and validate response
        json_response = _clean_json_string(response)
        parsed_response = json.loads(json_response)
        logger.info(f"Parsed JSON response: {json_response}")

        # Step 6: Check for clarification request
        if "clarification_needed" in parsed_response:
            return return_clarification_response(
                status_message="Additional information required",
                data={"clarification": parsed_response["clarification_needed"]}
            )

        # Step 7: Handle modifications
        if "modification" in parsed_response and parsed_response["modification"]:
            existing_schedule = recent_history.get("latest_schedule", {})
            for day in parsed_response["schedule"]:
                parsed_response["schedule"][day] = merge_schedules(
                    existing_schedule, parsed_response["schedule"], day
                )

        # Step 8: Validate schedule
        schedule_dto = DailyRoutineSchema.model_validate(parsed_response)
        total_hours = sum(schedule_dto.totals.values())
        if total_hours != 24:
            logger.warning(f"Total hours ({total_hours}) does not sum to 24. Adjusting schedule.")
            missing_hours = 24 - total_hours
            if missing_hours > 0:
                for day in schedule_dto.schedule:
                    if schedule_dto.schedule[day]:
                        last_interval = schedule_dto.schedule[day][-1]
                        if last_interval.end != "23:59":
                            schedule_dto.schedule[day].append({
                                "start": last_interval.end,
                                "end": "23:59",
                                "tag": "relax"
                            })
                            schedule_dto.totals["relax"] += missing_hours
            elif missing_hours < 0:
                return return_clarification_response(
                    status_message="Schedule exceeds 24 hours",
                    data={"clarification": "Please reduce the duration of some activities to fit within 24 hours."}
                )

        # Step 9: Return success response
        result = {"response": schedule_dto}
        logger.info(f"Generated schedule: {schedule_dto}")
        return return_success_response(
            status_message="Task registration response generated successfully",
            data=result
        )

    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON response from LLM: {str(e)}")
        return return_response(
            status="error",
            status_message="Failed to parse LLM response",
            error_code=400,
            error_message=str(e),
            data=None
        )
    except ValidationError as e:
        logger.error(f"Schema validation failed: {str(e)}")
        return return_response(
            status="error",
            status_message="Invalid schedule format",
            error_code=422,
            error_message=str(e),
            data=None
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise e

def _clean_json_string(raw_str: str) -> str:
    cleaned = re.sub(r"^```json\s*|\s*```$", "",
                     raw_str, flags=re.MULTILINE).strip()
    return cleaned

def merge_schedules(existing_schedule: dict, new_intervals: dict, day: str) -> list:
    """Merge new intervals into an existing schedule, resolving conflicts."""
    merged = existing_schedule.get(day, []).copy()
    new_entries = new_intervals.get(day, [])
    
    # Remove conflicting intervals
    for new_entry in new_entries:
        merged = [entry for entry in merged if not (entry["start"] < new_entry["end"] and new_entry["start"] < entry["end"])]
        merged.append(new_entry)
    
    # Sort by start time
    merged.sort(key=lambda x: x["start"])
    return merged
