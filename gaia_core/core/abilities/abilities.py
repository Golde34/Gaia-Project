from core.domain.enums import enum
from core.service.gaia_abilities_service import chitchat, abilities_handler
from core.service.onboarding_service import introduce, register_task
from core.service.task_service import create_task, create_task_result


ROUTERS = {
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
}

ABILITIES = {
    {
        'label': enum.GaiaAbilities.CREATE_TASK.value,
        'description': 'Create a new task/job to do in the future.',
    },
    {
        'label': enum.GaiaAbilities.CHITCHAT.value,
        'description': 'For types of queries that are just regular chat conversations.',
    },
    {
        'label': enum.GaiaAbilities.CREATE_TASK_RESULT.value,
        'description': 'Return task results (get task list, task created/updated/deleted, task schedule optimized, etc.).',
    },
}

FUNCTIONS = {
    enum.GaiaAbilities.CREATE_TASK.value: create_task,
    enum.GaiaAbilities.CREATE_TASK_RESULT.value: create_task_result,
    enum.GaiaAbilities.CHITCHAT.value: chitchat,
}