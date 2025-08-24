import json
from typing import List

from core.domain.request.tag_schedule_task_request import TagScheduleTaskRequest
from core.domain.response.tag_schedule_task_response import TagScheduleTaskResponse
from core.prompts.task_tagging_prompt import TAG_SCHEDULE_TASK_PROMPT
from kernel.config import llm_models
from kernel.utils.parse_json import parse_json_string

DEFAULT_MODEL = "gemini-2.0-flash"
AVAILABLE_TAGS = ["work", "relax", "eat", "travel", "sleep"]


async def tag_schedule_tasks(
    tasks: List[TagScheduleTaskRequest],
) -> List[TagScheduleTaskResponse]:
    tasks_json = json.dumps([task.dict() for task in tasks], ensure_ascii=False)
    prompt = TAG_SCHEDULE_TASK_PROMPT.format(
        tasks_json=tasks_json, allowed_tags=", ".join(AVAILABLE_TAGS)
    )

    function = await llm_models.get_model_generate_content(
        DEFAULT_MODEL, user_id="0", prompt=prompt
    )
    response = function(prompt=prompt, model_name=DEFAULT_MODEL)

    try:
        parsed = parse_json_string(response)
    except Exception:
        parsed = []

    return [TagScheduleTaskResponse(**item) for item in parsed]
