from core.gemini_generate_content import create_task

FUNCTIONS = [
    {
        'func': create_task, 
        'label': 'Create Task',
        'description': 'Create task information extraction prompt for Gemini API.',
    }
]
