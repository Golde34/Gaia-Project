
import json
from typing import List

from core.domain.enums.enum import TAG_LIST
from core.domain.request.tag_schedule_task_request import TagScheduleTaskRequest
from core.domain.response.tag_schedule_task_response import TagScheduleTaskResponse
from infrastructure.llm.interface import get_model_generate_content
from core.prompt.task_tagging_prompt import TAG_SCHEDULE_TASK_PROMPT
from kernel.utils.parse_json import parse_json_string


async def tag_schedule_tasks(
    user_id: int,
    tasks: List[TagScheduleTaskRequest],
) -> List[TagScheduleTaskResponse]:
    print("Tagging schedule tasks for user_id:", user_id)
    tasks_json = json.dumps([task.dict() for task in tasks], ensure_ascii=False)
    prompt = TAG_SCHEDULE_TASK_PROMPT.format(
        tasks_json=tasks_json, allowed_tags=", ".join(TAG_LIST)
    )

    function = await get_model_generate_content()
    response = function(prompt=prompt)

    try:
        parsed = parse_json_string(response)
    except Exception:
        parsed = []

    return [TagScheduleTaskResponse(**item) for item in parsed]
