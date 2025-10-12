from core.domain.enums import enum
from core.prompt import get_task_information
from core.service.abilities_service import daily_calendar, priority_tasks


ABILITIES = {
    enum.GaiaAbilities.CREATE_TASK.value: {
        'description': 'Create a new task/job to do in the future.',
        'is_sync': True,
        # 'function': priority_tasks
    },
    enum.GaiaAbilities.LIST_TASK.value: {
        'description': 'List user\'s tasks by command.',
        'is_sync': False,
        'function': priority_tasks
    },
    enum.GaiaAbilities.LIST_CALENDAR.value: {
        'description': 'List daily user\'s calendar ',
        'is_sync': False,
        'function': daily_calendar
    },
    enum.GaiaAbilities.SEARCH_INFOR.value: {
        'description': 'Search information',
        'is_sync': True,
    }
}

PROVIDER_REGISTRY = {
    'TaskStatsProvider': {
        'function': priority_tasks,
        'llm_type': enum.GaiaService.SP
    },
    'CalendarDayProvider': {
        'function': daily_calendar,
        'llm_type': enum.GaiaService.SP
    },
    # 'FreeSlotFinderProvider'
}

PROMPT_CATEGORY = {
    enum.GaiaService.SP: get_task_information.TASKS_INFORMATION_PROMPT
}