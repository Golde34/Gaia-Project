from typing import List, Optional, Tuple

from core.domain.entities.user_dialogue import UserDialogue
from kernel.database.base import BaseRepository, Page


class UserDialogueRepository(BaseRepository[UserDialogue]):
    def __init__(self):
        super().__init__(
            table_name="user_dialogues",
            model_cls=UserDialogue,
            pk="id",
            default_order_by="created_at DESC",
        )

    async def create_dialogue(self, dialogue: UserDialogue) -> UserDialogue:
        """
        INSERT and return the full entity (with generated/returned id).
        """
        ret = await self.insert(
            dialogue,
            returning=("id", "user_id", "dialogue_name", "dialogue_type", "dialogue_status",
                       "metadata", "created_at", "updated_at"),
            auto_timestamps=True,
        )
        return UserDialogue(**ret)

    async def get_dialogue_by_user_id_and_type(self, user_id: str, dialogue_type: str) -> Optional[UserDialogue]:
        rows = await self.select_paginated(
            where={"user_id": user_id, "dialogue_type": dialogue_type},
            page=Page(limit=1, offset=0),
            order_by="created_at DESC",
            to_models=True,
        )
        return rows[0] if rows else None

    async def get_dialogue_by_id(self, user_id: str, dialogue_id: str) -> Optional[UserDialogue]:
        rows = await self.list(
            where={"user_id": user_id, "id": dialogue_id},
            to_models=True,
            limit=1,
        )
        return rows[0] if rows else None

    async def get_all_dialogues_by_user_id(
        self,
        user_id: str,
        size: int,
        cursor: str | None,  # ISO timestamp (e.g., "2025-10-23T10:32:01Z") or None
    ) -> Tuple[List[UserDialogue], bool]:
        """
        Mirrors Go logic:
          - size = utils.ValidatePagination(size)
          - where = {"user_id": user_id} plus cursor condition (updated_at < cursor)
          - select size+1 rows ordered by updated_at DESC
          - hasMore = len(dialogues) > size; if so, trim to size
        """
        size = max(1, min(size, 100))

        where = {"user_id": user_id}
        if cursor:
            where["updated_at <"] = cursor

        rows = await self.select_paginated(
            where=where,
            columns=("id", "user_id", "dialogue_name", "dialogue_type", "dialogue_status",
                     "metadata", "created_at", "updated_at"),
            page=Page(limit=size + 1, offset=0),
            order_by="updated_at DESC",
            to_models=True,
        )

        has_more = len(rows) > size
        if has_more:
            rows = rows[:size]

        return rows, has_more