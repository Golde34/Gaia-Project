from core.domain.enums import enum
from proactive_recommendator.core.service.abilities_service import priority_tasks



ABILITIES = {
    enum.GaiaAbilities.CREATE_TASK.value: {
        'description': 'Create a new task/job to do in the future.',
        'is_sync': True,
        'function': priority_tasks
    },
    enum.GaiaAbilities.LIST_TASK.value: {
        'description': 'List user\'s tasks by command.',
        'is_sync': False,
    },
    enum.GaiaAbilities.LIST_CALENDAR.value: {
        'description': 'List daily user\'s calendar ',
        'is_sync': False,
    },
    enum.GaiaAbilities.SEARCH_INFOR.value: {
        'description': 'Search information',
        'is_sync': True,
    }
}
