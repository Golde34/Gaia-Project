import uuid
import time

from core.domain.entities.user_dialogue import UserDialogue
from core.domain.entities.message import Message
from core.domain.response.message_response import MessageResponseDTO, RecentHistory
from infrastructure.repository.message_repository import message_repository


class MessageService:
    """Service layer for messages, interfacing with the MessageRepository."""

    async def create_message(self, dialogue: UserDialogue, user_id: str, message: str, user_message_id: str, sender_type: str, message_type: str) -> str:
        message_request = self._build_message(
            dialogue, user_id, message, user_message_id, sender_type, message_type)
        message_id = await message_repository.create_message(message_request)
        print(f"Created message with ID: {message_id}")
        return message_id

    def _build_message(self, dialogue: UserDialogue, user_id: str, message: str, user_message_id: str, sender_type: str, message_type: str) -> Message:
        new_message = Message(
            id=uuid.uuid4(),
            user_id=int(user_id),
            dialogue_id=dialogue.id,
            user_message_id=user_message_id,
            message_type=message_type,
            content=message,
            sender_type=sender_type,
            content=message,
            sender_type=sender_type,
            metadata={},
            created_at=time.time(),
            updated_at=time.time(),
        )
        return new_message

    async def get_message_by_dialogue_id(self, dialogue_id: str, number_of_messages: int) -> Message:
        recent_chat_messages = await message_repository.get_recent_chat_messages_by_dialogue_id(dialogue_id, number_of_messages)
        if len(recent_chat_messages) == 0:
            print("No messages found for dialogue_id:", dialogue_id)
            return None
        recent_chat_messages_response = []
        for message in recent_chat_messages:
            recent_chat_messages_response.append(MessageResponseDTO(
                message="<" + message.sender_type + "> " + message.content,
                metadata=message.metadata
            ))

        recent_chat_his: RecentHistory = RecentHistory(
            user_id=recent_chat_messages[0].user_id,
            dialogue_id=dialogue_id,
            messages=recent_chat_messages_response
        )
        return recent_chat_his

    async def get_messages_by_dialogue_id_with_cursor_pagination(
        self, dialogue_id: str, size: int, cursor: str | None
    ) -> tuple[list[Message], bool]:
        messages, has_more = await message_repository.get_messages_by_dialogue_id_with_cursor_pagination(
            dialogue_id, size, cursor
        )
        if len(messages) == 0:
            print("No messages found for dialogue_id:", dialogue_id)
            return [], False
        # reverse messages to chronological order
        messages.reverse()
        return messages, has_more

message_service = MessageService()
