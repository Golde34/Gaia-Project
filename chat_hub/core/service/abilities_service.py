from core.domain.enums import enum
from core.domain.enums.enum import SenderTypeEnum
from core.domain.request.query_request import LLMModel, QueryRequest
from core.prompts.abilities_prompt import CHITCHAT_PROMPT, CHITCHAT_WITH_HISTORY_PROMPT
from core.service import memory_service
from core.service.orchestrator_service import orchestrator_service
from core.service.integration.task_service import handle_task_service_response
from core.service.integration.dialogue_service import dialogue_service
from core.service.integration.message_service import message_service
from infrastructure.search.google_search import run_search
from kernel.config import llm_models, config


async def abilities_handler(query: QueryRequest, guided_route: str) -> str:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        response (any): The response content to determine service type.
    Returns:
        str: The response from the appropriate service handler.
    """
    print("Abilities Handler called with query:", query)
    try:
        task = orchestrator_service.resolve_tasks(guided_route)
        if not task:
            return await chitchat_with_history(query)

        orchestration_result = await orchestrator_service.execute(query=query, task=task)
        primary = orchestration_result.get("primary")
        if not primary:
            return handle_task_service_response(enum.GaiaAbilities.CHITCHAT.value, "")

        primary_type = primary.get("type") or enum.GaiaAbilities.CHITCHAT.value
        primary_result = primary.get("result") or {"response": ""}
        response_payload = handle_task_service_response(primary_type, primary_result)
        formatted_tasks = [
            orchestrator_service.format_task_payload(task)
            for task in orchestration_result.get("tasks", [])
        ]
        if "data" not in response_payload:
            response_payload["data"] = {}
        response_payload["data"]["tasks"] = formatted_tasks
        response_payload["recommend"] = orchestration_result.get("recommend", "")
        if not orchestration_result.get("recommend_handled"):
            await persist_recommendation_message(query, response_payload["recommend"])

        print("Result: ", response_payload)
        return response_payload
    except Exception as e:
        raise e

async def chitchat(query: QueryRequest) -> str:
    """
    Chitchat pipeline
    Args:
        query (str): The user's query containing task information.
    Returns:
        str: Short response to the request
    """
    try:
        prompt = CHITCHAT_PROMPT.format(query=query.query)
        if not query.model:
            model: LLMModel = LLMModel(
                model_name=config.LLM_DEFAULT_MODEL,
                model_key=config.SYSTEM_API_KEY
            )
        else:
            model = query.model
        function = await llm_models.get_model_generate_content(model=model, user_id=query.user_id)
        response = function(prompt=prompt, model=model)
        print("Response:", response)
        return response
    except Exception as e:
        raise e

async def chitchat_with_history(query: QueryRequest) -> str:
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
        recent_history, recursive_summary, long_term_memory = await memory_service.query_chat_history(query)
        prompt = CHITCHAT_WITH_HISTORY_PROMPT.format(
            query=query.query,
            recent_history=recent_history,
            recursive_summary=recursive_summary,
            long_term_memory=long_term_memory
        )
        function = await llm_models.get_model_generate_content(model=query.model, user_id=query.user_id)
        response = function(prompt=prompt, model=query.model)
        return response
    except Exception as e:
        raise e

async def persist_recommendation_message(query: QueryRequest, recommend_message: str) -> None:
    if not recommend_message:
        return
    if not query.dialogue_id or not query.user_message_id:
        return

    dialogue, _ = await dialogue_service.get_dialogue_by_id(
        user_id=query.user_id, dialogue_id=query.dialogue_id
    )
    if not dialogue:
        return

    await message_service.create_message(
        dialogue=dialogue,
        user_id=query.user_id,
        message=recommend_message,
        message_type=query.type,
        sender_type=SenderTypeEnum.BOT.value,
        user_message_id=query.user_message_id,
    )
