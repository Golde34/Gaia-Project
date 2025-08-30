from core.domain.enums import enum
from core.service.task_service import create_task, create_task_result


FUNCTIONS = {
    enum.GaiaAbilities.CREATE_TASK.value: create_task,
    enum.GaiaAbilities.CREATE_TASK_RESULT.value: create_task_result,
}