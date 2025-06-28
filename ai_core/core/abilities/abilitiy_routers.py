from core.domain.enums import enum
from core.service.onboarding_service import introduce, register_task
from core.service.gaia_abilities_service import abilities_handler


ROUTERS = [
    {
        'label': enum.SemanticRoute.GAIA_INTRODUCTION,
        'description': 'Introduce GAIA and its capabilities.',
        'function': introduce 
    },
    {
        'label': enum.SemanticRoute.REGISTER_SCHEDULE_CALENDAR,
        'description': 'Register a calendar for task management.',
        'function': register_task 
    },
    {
        'label': enum.SemanticRoute.ABILITIES,
        'description': 'Gaia\'s abilities.',
        'function': abilities_handler 
    }   
]

ROUTER_MAP = {router['label']: router['function'] for router in ROUTERS}

def call_router_function(label_value, *args, **kwargs):
    if label_value not in ROUTER_MAP:
        raise ValueError(f"No route found for label: {label_value}")
    return ROUTER_MAP[label_value](*args, **kwargs)