from typing import List

from core.domain.entities.recursive_summary import RecursiveSummary
from infrastructure.repository.recursive_summary_repository import recursive_summary_repo


async def save_summary(summary: RecursiveSummary) -> int:
    return await recursive_summary_repo.save_summary(summary)


async def get_summaries(user_id: str, dialogue_id: str) -> List[RecursiveSummary]:
    return await recursive_summary_repo.list_by_dialogue(user_id, dialogue_id)
