import datetime
from functools import wraps
from typing import Callable, Dict, Any, Optional
import uuid

from core.domain.entities.database.agent_execution import AgentExecution
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.service.chat_service import push_and_save_bot_message
from infrastructure.repository.agent_execution_repository import agent_execution_repo

import core.service


# Function registry to store decorated functions
_FUNCTION_REGISTRY: Dict[str, Dict[str, Any]] = {}


def function_handler(label: str, is_sequential: bool = False):
    """
    Decorator to register a function handler for LLM routing.

    Apply this decorator directly to service methods to register them
    as callable functions for LLM function calling.

    Args:
        label (str): The label/identifier for this function (e.g., enum value)
        is_sequential (bool): Whether the function should be executed sequentially
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            query: QueryRequest = _extract_query(args, kwargs)
            execution_entity: AgentExecution = _extract_agent_execution(args, kwargs, label, query)
            execution_log: AgentExecution = await agent_execution_repo.create_agent_execution(execution_entity)
            try:
                # All function handlers are expected to return a tuple of (result, is_need_recommendation)
                response, is_need_recommendation = await func(*args, **kwargs)
                await push_and_save_bot_message(
                    message=response, query=query
                )
            except Exception as exc:
                execution_result = await agent_execution_repo.update_agent_execution_status(
                    execution_id=execution_log.id,
                    status=enum.TaskStatus.FAILED.value,
                    tool_output=str(exc),
                )
                raise exc

            execution_result = await agent_execution_repo.update_agent_execution_status(
                execution_id=execution_log.id,
                status=enum.TaskStatus.SUCCESS.value,
                tool_output=str(response),
            )
            print("Execution result:", execution_result)
            return response, execution_result, is_need_recommendation

        _FUNCTION_REGISTRY[label] = {
            'executor': wrapper,
            'is_sequential': is_sequential,
        }
        return wrapper
    return decorator


def _extract_agent_execution(args: tuple, kwargs: dict, label: str, query: QueryRequest) -> Optional[AgentExecution]:
    confidence_score = kwargs.get('confidence_score', None)
    tool_input = kwargs.get('tool_input', None)
    tool_output = kwargs.get('tool_output', None)
    return AgentExecution(
        id=uuid.uuid4(),
        user_id=query.user_id,
        message_id=query.user_message_id,
        selected_tool_id=label,
        user_query=query.query,
        status=enum.TaskStatus.INIT.value,
        confidence_score=confidence_score,
        tool_input=tool_input,
        tool_output=tool_output,
        created_at=datetime.datetime.today(),
        updated_at=datetime.datetime.today(),
    )


def _extract_query(args: tuple, kwargs: dict) -> Optional[QueryRequest]:
    query = kwargs.get('query')
    if isinstance(query, QueryRequest):
        return query
    for arg in args:
        if isinstance(arg, QueryRequest):
            return arg
    print("No QueryRequest found in function arguments. This case cannot happen.")
    return None


FUNCTIONS = _FUNCTION_REGISTRY
