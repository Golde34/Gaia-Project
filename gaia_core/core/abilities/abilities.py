from core.domain.enums import enum
from core.service.gaia_abilities_service import chitchat, create_task, create_task_result
from core.service.onboarding_service import introduce, register_task


ABILITIES = {
    {
        'label': enum.GaiaAbility.CREATE_TASK.value,
        'description': 'Create a new task/job to do in the future.',
        'function': create_task
    },
    {
        'label': enum.GaiaAbility.CHITCHAT.value,
        'description': 'For types of queries that are just regular chat conversations.',
        'function': chitchat
    },
    {
        'label': enum.GaiaAbility.CREATE_TASK_RESULT.value,
        'description': 'Return task results (get task list, task created/updated/deleted, task schedule optimized, etc.).',
        'function': create_task_result,
    },
    {
        'label': enum.SemanticRoute.GAIA_INTRODUCTION,
        'description': 'Introduce GAIA and its capabilities.',
        'function': introduce 
    },
    {
        'label': enum.SemanticRoute.REGISTER_SCHEDULE_CALENDAR,
        'description': 'Register a calendar for task management.',
        'function': register_task 
    }
}
