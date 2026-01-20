from core.prompt.base import BASE_PROMPT


TASKS_INFORMATION_PROMPT = BASE_PROMPT + """
You have these information sources to help user:
{bundle}
"""
