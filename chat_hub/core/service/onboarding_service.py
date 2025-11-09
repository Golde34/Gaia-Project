import asyncio
from typing import Dict, List
import json
import re

from core.domain.enums import enum, kafka_enum
from core.domain.request.query_request import QueryRequest
from core.prompts import onboarding_prompt
from core.prompts.abilities_prompt import CHITCHAT_WITH_HISTORY_PROMPT
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.kafka.producer import publish_message
from infrastructure.vector_db.milvus import milvus_db
from kernel.config import llm_models, config
from kernel.utils.background import log_background_task_error


default_model = config.LLM_DEFAULT_MODEL

async def gaia_introduce(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
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
    return function(prompt=prompt, model_name=default_model)


async def chitchat_with_history(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
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
        return function(prompt=prompt, model_name=query.model_name)
    except Exception as e:
        raise e


async def generate_calendar_schedule_response(query: QueryRequest, recent_history: str, long_term_memory: str) -> Dict:
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

    function = await llm_models.get_model_generate_content(query.model_name, query.user_id)
    response = await asyncio.to_thread(function, prompt=prompt, model_name=query.model_name)
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
    }

    try:
        await publish_message(
            kafka_enum.KafkaTopic.REGISTER_CALENDAR_SCHEDULE.value,
            kafka_enum.KafkaCommand.GENERATE_CALENDAR_SCHEDULE.value,
            payload,
        )
    except Exception as exc:
        print(f"Failed to dispatch register calendar request: {exc}")


async def chitchat_and_register_calendar(query: QueryRequest, recent_history: str, recursive_summary: str, long_term_memory: str) -> str:
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


def clean_json_string(raw_str: str) -> str:
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
