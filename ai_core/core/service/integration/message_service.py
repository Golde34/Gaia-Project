import uuid
import time

from core.domain.entities.user_dialogue import UserDialogue
from core.domain.entities.message import Message
from core.domain.request.chat_hub_request import RecentHistoryRequest
from core.domain.response.message_response import MessageResponseDTO, RecentHistory
from core.service.integration.dialogue_service import dialogue_service
from infrastructure.repository.message_repository import message_repository


class MessageService:
    """Service layer for messages, interfacing with the MessageRepository."""

    async def create_message(self, dialogue: UserDialogue, user_id: int, message: str, user_message_id: str, sender_type: str, message_type: str) -> str:
        message_request = self._build_message(
            dialogue, user_id, message, user_message_id, sender_type, message_type)
        message_id = await message_repository.create_message(message_request)
        print(f"Created message with ID: {message_id}")
        return message_id

    def _build_message(self, dialogue: UserDialogue, user_id: int, message: str, user_message_id: str, sender_type: str, message_type: str) -> Message:
        new_message = Message(
            id=uuid.uuid4(),
            user_id=user_id,
            dialogue_id=dialogue.id,
            user_message_id=str(user_message_id),
            message_type=message_type,
            content=message,
            sender_type=sender_type,
            metadata="",
        )
        return new_message

    async def get_message_by_dialogue_id(self, dialogue_id: str, number_of_messages: int) -> Message:
        print("Dialogue ID in get_message_by_dialogue_id:", dialogue_id)
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

    async def get_recent_history(self, request: RecentHistoryRequest) -> str:
        try:
            dialogue = await dialogue_service.get_dialogue_by_id(request.user_id, request.dialogue_id)
            if dialogue is None:
                print("Dialogue not found for dialogue_id:", request.dialogue_id)
                return ''
            result = await self.get_message_by_dialogue_id(dialogue.id, request.number_of_messages)
            if not result:
                print("No recent history found.")
                return ''
            if not self._validate_recent_history_response(request, result):
                print("Recent history response validation failed.")
                return ''

            return self._format_history(result.get('messages'))
        except Exception as e:
            print(f"Error in ChatHubServiceClient.get_recent_history: {e}")
            return ''

    def _validate_recent_history_response(self, request: RecentHistoryRequest, response: dict) -> bool:
        if int(request.user_id) != int(response.get('userId')):
            print(f"User ID mismatch: {request.user_id} != {response.get('userId')}")
            return False
        if request.dialogue_id != response.get('dialogueId'):
            print(f"Dialogue ID mismatch: {request.dialogue_id} != {response.get('dialogueId')}")
            return False
        return True

    def _format_history(self, history_list):
        lines = []
        for msg in history_list:
            if msg["message"].startswith("<user>"):
                lines.append("User: " + msg["message"].replace("<user>", "").strip())
            elif msg["message"].startswith("<bot>"):
                lines.append("GAIA: " + msg["message"].replace("<bot>", "").strip())
        return "\n".join(lines)

message_service = MessageService()
