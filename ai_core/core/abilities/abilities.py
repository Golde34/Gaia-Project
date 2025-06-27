from core.domain.enums import enum


ABILITIES = [
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
]

