from typing import Callable, Dict, Any

from core.domain.enums import enum


MESSAGE_TYPE_CONVERTER = {
    enum.DialogueEnum.CHAT_TYPE.value: enum.ChatType.ABILITIES.value,
    enum.DialogueEnum.GAIA_INTRODUCTION_TYPE.value: enum.ChatType.GAIA_INTRODUCTION.value,
    enum.DialogueEnum.REGISTER_SCHEDULE_CALENDAR_TYPE.value: enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value,
}


_ROUTER_REGISTRY: Dict[str, Dict[str, Any]] = {}


def llm_route(label: str, description: str):
    """
    Decorator to register a function as a router handler.

    Args:
        label (str): The label/identifier for this route
        description (str): Description of what this route does

    Usage:
        @route(label=enum.ChatType.ABILITIES.value, description="Gaia's abilities")
        async def my_handler(query: QueryRequest, guided_route: str = None):
            pass
    """
    def decorator(func: Callable):
        _ROUTER_REGISTRY[label] = {
            'label': label,
            'description': description,
            'function': func
        }
        return func
    return decorator


def get_routers():
    """Get all registered routers."""
    return list(_ROUTER_REGISTRY.values())


async def call_router_function(label_value: str, query: dict, guided_route: str = None) -> dict:
    """
    Call the appropriate function based on the label value.

    Args:
        label_value (str): The label to identify the function to call.
        query (dict): The query data to pass to the function.
        guided_route (str): Optional guided route parameter.

    Returns:
        dict: The response from the called function.
    """
    print(f"Calling function for label: {label_value} with query: {query}")

    router = _ROUTER_REGISTRY.get(label_value)
    if router:
        return await router['function'](query, guided_route)

    raise ValueError(f"No function found for label: {label_value}")
