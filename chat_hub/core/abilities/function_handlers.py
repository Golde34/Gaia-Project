from core.domain.enums import enum
from core.service.task_service import create_task, create_task_result


FUNCTIONS = {
    enum.GaiaAbilities.CREATE_TASK.value: {
        "handler": create_task,
        "is_sequential": True,
    },
    enum.GaiaAbilities.CREATE_TASK_RESULT.value: {
        "handler": create_task_result,
        "is_sequential": True,
    },
}
