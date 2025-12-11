from core.domain.enums import enum
from core.service.integration.task_service import personal_task_service
from core.service.abilities.search import search


FUNCTIONS = {
    enum.GaiaAbilities.CREATE_TASK.value: {
        "handler": personal_task_service.create_personal_task,
        "is_sequential": True,
    },
    # enum.GaiaAbilities.CREATE_TASK_RESULT.value: {
    #     "handler": create_personal_task_result,
    #     "is_sequential": False,
    # },
    enum.GaiaAbilities.SEARCH.value: {
        "handler": search,
        "is_sequential": False,
    },
}
