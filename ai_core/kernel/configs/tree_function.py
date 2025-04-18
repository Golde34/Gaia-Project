from core.service.task_service import create_task

FUNCTIONS = [
    {
        'func': create_task, 
        'label': 'Create Task',
        'description': 'Create task information extraction prompt for Gemini API.',
    }
]
