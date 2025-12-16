import json

from core.abilities.abilities import ABILITIES
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.prompts.system_prompt import CLASSIFY_PROMPT
from core.semantic_router import router_registry
from kernel.config import llm_models


async def select_tool_by_router(label_value: str, query: QueryRequest) -> tuple[str, bool]:
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
        return await select_ability_tool(query)
        

async def select_ability_tool(query: QueryRequest) -> str:
    """
    Select the appropriate ability based on the label value.

    Args:
        label_value (str): The label to identify the ability.
        query (QueryRequest): The user's query containing task information.
    Returns:
        str: The response from the selected ability handler.
    """
    tools_string = json.dumps(ABILITIES, indent=2)

    prompt = CLASSIFY_PROMPT.format(
        query=query.query, tools=tools_string)

    function = await llm_models.get_model_generate_content(
        query.model, query.user_id, prompt=prompt)
    classify_response = function(prompt=prompt, model=query.model)

    print("Classify Response:", classify_response)
    is_need_history = _need_history(classify_response)
    return classify_response, is_need_history 


def _need_history(label_value: str) -> bool:
    """
    Check if the ability requires chat history.

    Args:
        label_value (str): The label to identify the ability.
    Returns:
        bool: True if the ability requires chat history, False otherwise.
    """
    for ability in ABILITIES:
        if ability['label'] == label_value:
            return ability.get('need_history', False)
    return False
