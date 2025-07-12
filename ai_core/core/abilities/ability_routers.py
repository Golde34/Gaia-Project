import json

from core.abilities.abilities import ABILITIES
from core.domain.enums import enum
from core.prompts.system_prompt import CLASSIFY_PROMPT
from core.semantic_router import router_registry
from core.service.onboarding_service import introduce, register_task
from core.service.gaia_abilities_service import abilities_handler, chitchat
from kernel.config import llm_models


ROUTERS = [
    {
        'label': enum.ChatType.GAIA_INTRODUCTION.value,
        'description': 'Introduce GAIA and its capabilities.',
        'function': introduce
    },
    {
        'label': enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value,
        'description': 'Register a calendar for task management.',
        'function': register_task
    },
    {
        'label': enum.ChatType.ABILITIES.value,
        'description': 'Gaia\'s abilities.',
        'function': abilities_handler
    }
]


async def select_ability(label_value: str, query: str) -> tuple[str, bool]:
    """
    Select the appropriate ability based on the label value.

    Args:
        label_value (str): The label to identify the ability.
        query (QueryRequest): The user's query containing task information.
    Returns:
        str: The response from the selected ability handler.
    """
    if label_value == enum.ChatType.GAIA_INTRODUCTION.value:
        guided_route = await router_registry.gaia_introduction_route(query.query)
        return guided_route, False 
    elif label_value == enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value:
        return label_value, False 
    elif label_value == enum.ChatType.ABILITIES.value:
        tools_string = json.dumps(ABILITIES, indent=2)

        prompt = CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)

        function = await llm_models.get_model_generate_content(query.model_name, query.user_id)
        classify_response = function(
            prompt=prompt, model_name=query.model_name)

        print("Classify Response:", classify_response)
        return classify_response, True 


async def call_router_function(label_value: str, query: dict, guided_route: str) -> dict:
    """
    Call the appropriate function based on the label value.

    Args:
        label_value (str): The label to identify the function to call.
        query (dict): The query data to pass to the function.

    Returns:
        dict: The response from the called function.
    """
    print(f"Calling function for label: {label_value} with query: {query}")
    for router in ROUTERS:
        if router['label'] == label_value:
            return await router['function'](query, guided_route)

    raise ValueError(f"No function found for label: {label_value}")
