import uuid

from core.domain.enums.enum import DialogueEnum, ActiveEnum
from core.domain.entities.user_dialogue import UserDialogue
from infrastructure.repository.dialogue_repository import user_dialogue_repository


class DialogueService:
    """Service layer for user dialogues, interfacing with the UserDialogueRepository."""

    async def get_or_create_dialogue(
            self,
            user_id: int,
            dialogue_id: str,
            msg_type: str) -> tuple[UserDialogue, bool]:
        """
        Retrieves an existing dialogue by ID or creates a new one based on message type.
        If msg_type is chitchat_message, considers it as a new dialogue that needs to change the title (which is type).

        user_id: ID of the user.
        dialogue_id: ID of the dialogue to retrieve. If provided, fetches that dialogue.
        msg_type: Type of the message/dialogue. Used when creating a new dialogue.
        Returns:
            UserDialogue: The retrieved or newly created dialogue.
            IsChangedTitle: bool indicating if the dialogue is of type CHAT_TYPE.
        """
        if msg_type is None or msg_type.strip() == "":
            msg_type = DialogueEnum.CHAT_TYPE.value
        if dialogue_id:
            return await self.get_dialogue_by_id(user_id, dialogue_id)

        return await self._create_dialogue_if_not_exists(user_id, msg_type)

    async def get_dialogue_by_id(
            self,
            user_id: int,
            dialogue_id: str) -> tuple[UserDialogue | None, bool]:
        try:
            dialogue = await user_dialogue_repository.get_dialogue_by_id(user_id, dialogue_id)
            if dialogue is None:
                print(f"Dialogue with ID {dialogue_id} not found for user {user_id}.")
            if dialogue.dialogue_type == DialogueEnum.CHAT_TYPE.value:
                return dialogue, True

            return dialogue, False
        except Exception as e:
            print(f"Error in get_dialogue_by_id: {e}")
            return None

    async def _create_dialogue_if_not_exists(
            self,
            user_id: int,
            dialogue_type: str) -> tuple[UserDialogue, bool]:
        dialogue = await self._get_dialogue_by_user_id_and_type(user_id, dialogue_type)
        if dialogue is not None and dialogue.id is not None:
            if dialogue.dialogue_type == DialogueEnum.CHAT_TYPE.value:
                return dialogue, True
            return dialogue, False

        return await self._create_dialogue(user_id, dialogue_type)

    async def _get_dialogue_by_user_id_and_type(
            self,
            user_id: int,
            dialogue_type: str) -> UserDialogue:
        return await user_dialogue_repository.get_dialogue_by_user_id_and_type(user_id, dialogue_type)

    async def _create_dialogue(
            self,
            user_id: int,
            dialogue_type: str) -> tuple[UserDialogue, bool]:
        new_dialogue = UserDialogue(
            id=uuid.uuid4(),
            user_id=int(user_id),
            dialogue_name=DialogueEnum.GAIA_INTRODUCTION.value,
            dialogue_type=dialogue_type,
            dialogue_status=ActiveEnum.ACTIVE_BOOL.value,
            metadata="",
        )
        created_dialogue = await user_dialogue_repository.create_dialogue(new_dialogue)
        return created_dialogue, True

    async def get_all_dialogues_by_user_id(
            self,
            user_id: int,
            size: int,
            cursor: str | None) -> tuple[list[UserDialogue], bool]:
        """
        Retrieves all dialogues for a user with pagination.

        user_id: ID of the user.
        size: Number of dialogues to retrieve.
        cursor: Pagination cursor (ISO timestamp) for fetching dialogues created before this time.
        Returns:
            Tuple[List[UserDialogue], bool]: A list of UserDialogue objects 
            and a boolean indicating if more dialogues are available.
        """
        try:
            dialogues, has_more = await user_dialogue_repository.get_all_dialogues_by_user_id(user_id, size, cursor)
            if len(dialogues) == 0:
                print("No dialogues found for user_id:", user_id)
                return [], False
            return dialogues, has_more
        except Exception as e:
            raise e


dialogue_service = DialogueService()
