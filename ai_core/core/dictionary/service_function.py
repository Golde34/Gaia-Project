from core.service.task_service import create_task, task_result, chitchat
from core.service.onboarding_service import register_task


HANDLERS = {
    'create_task': create_task,
    'task_result': task_result,
    'chitchat': chitchat,
    'onboarding': register_task, 
}