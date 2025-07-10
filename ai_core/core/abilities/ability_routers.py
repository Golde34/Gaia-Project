from core.domain.enums import enum
from core.service.onboarding_service import introduce, register_task
from core.service.gaia_abilities_service import abilities_handler


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

async def call_router_function(label_value: str, query: dict) -> dict:
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
            return await router['function'](query)
    
    raise ValueError(f"No function found for label: {label_value}")