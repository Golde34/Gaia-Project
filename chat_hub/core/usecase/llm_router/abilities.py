from core.domain.enums import enum


ABILITIES = [
    {
        'label': enum.GaiaAbilities.CREATE_TASK.value,
        'description': 'Create personal tasks based on user requests.',
        'need_history': True,
    },
    {
        'label': enum.GaiaAbilities.CHITCHAT.value,
        'description': 'For types of queries that are just regular chat conversations.',
        'need_history': False,
    },
    {
        'label': enum.GaiaAbilities.CREATE_TASK_RESULT.value,
        'description': 'Return task results (get task list, task created/updated/deleted, task schedule optimized, etc.).',
        'need_history': True,
    },
    {
        'label': enum.GaiaAbilities.REGISTER_SCHEDULE_CALENDAR.value,
        'description': 'Register a calendar for task management.',
        'need_history': False,
    },
    {
        'label': enum.GaiaAbilities.SEARCH.value,
        'description': 'Search the web and return top links with optional summary.',
        'need_history': False,
    }
]
