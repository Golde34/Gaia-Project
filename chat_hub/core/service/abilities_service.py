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


async def abilities_handler(query: QueryRequest, guided_route: str) -> list[str]:
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
        type = orchestration_result.get("type")
        if not type:
            return handle_task_service_response(enum.GaiaAbilities.CHITCHAT.value, "")
        
        responses = _extract_task_response(orchestration_result)
        
        print(f"Orchestration result type: {type}, response: {responses}") 
        return responses, orchestration_result.get("operationStatus", enum.TaskStatus.SUCCESS.value)
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

def _extract_task_response(orchestration_result: dict) -> list[str]:
    """
    Extract the response from the orchestration result.
    Args:
        orchestration_result (dict): The result from the orchestrator service.
    Returns:
        list[str]: The extracted responses.
    """
    
    if orchestration_result.get("recommendation_handled", False):
        if type(orchestration_result.get("response")) is list:
            responses: list = orchestration_result.get("response")
            responses.append(orchestration_result.get("recommendation"))
            return responses
        else:
            return [
                orchestration_result.get("response"),
                orchestration_result.get("recommendation")
            ]
    else:
        if type(orchestration_result.get("response")) is list:
            return orchestration_result.get("response")
        else:
            return [orchestration_result.get("response")] 

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