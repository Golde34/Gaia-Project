from core.gemini_generate_content import create_task


FUNCTIONS = [
    {
        'func': create_task,
        'label': 'Create Task',
        'description': 'Task Information Extraction And Create Task'
    }
]