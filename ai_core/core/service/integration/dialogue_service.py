import uuid
import time

from core.domain.enums.enum import DialogueEnum, ActiveEnum
from core.domain.entities.user_dialogue import UserDialogue
from infrastructure.repository.dialogue_repository import user_dialogue_repository 


class DialogueService:
    """Service layer for user dialogues, interfacing with the UserDialogueRepository."""
    
    async def get_or_create_dialogue(self, userId: str, dialogue_id: str, msg_type: str) -> UserDialogue:
        try:
            if dialogue_id:
                return await self._get_dialogue_by_id(dialogue_id)
            return await self._create_dialogue_if_not_exists(userId, msg_type)
        except Exception as e:
            print(f"Error in get_or_create_dialogue: {e}")
            return None

    async def _get_dialogue_by_id(self, user_id: str, dialogue_id: str) -> UserDialogue:
        return await user_dialogue_repository.get_dialogue_by_id(user_id, dialogue_id)

    async def _create_dialogue_if_not_exists(self, user_id: str, dialogue_type: str) -> UserDialogue:
        dialogue = await self._get_dialogue_by_user_id_and_type(user_id, dialogue_type)
        if dialogue is not None and dialogue.id is not None:
            return dialogue
        return self._create_dialogue(user_id, dialogue_type)

    async def _get_dialogue_by_user_id_and_type(self, user_id: str, dialogue_type: str) -> UserDialogue:
        return await user_dialogue_repository.get_dialogue_by_user_id_and_type(user_id, dialogue_type)
    
    async def _create_dialogue(self, user_id: str, dialogue_type: str) -> UserDialogue:
        new_dialogue = UserDialogue(
            id=uuid.uuid4(),
            user_id=int(user_id),
            dialogue_name=DialogueEnum.GAIA_INTRODUCTION.value,
            dialogue_type=dialogue_type,
            dialogue_status=ActiveEnum.ACTIVE.value,
            metadata={},
            created_at=time.time(),
            updated_at=time.time(),
        )
        return await user_dialogue_repository.create_dialogue(new_dialogue)
    
    async def get_all_dialogues_by_user_id(self, user_id: str, size: int, cursor: str | None) -> tuple[list[UserDialogue], bool]:
        try:
            dialogues, has_more = await user_dialogue_repository.get_all_dialogues_by_user_id(user_id, size, cursor)
            if len(dialogues) == 0:
                print("No dialogues found for user_id:", user_id)
                return [], False
            return dialogues, has_more
        except Exception as e:
            raise e

dialogue_service = DialogueService()
