import datetime
import uuid
from typing import List, Tuple

from core.domain.entities.message import Message
from kernel.database.base import BaseRepository
from kernel.database.postgres import postgres_db


class MessageRepository(BaseRepository[Message]):
    def __init__(self):
        super().__init__(
            table_name="messages",
            model_cls=Message,
            pk="id",
            default_order_by="created_at DESC",
        )

    async def create_message(self, message: Message) -> str:
        """
        Create a new message and return its ID.
        """
        message.id = uuid.uuid4()
        ret = await self.insert(
            message,
            returning=("id", "user_id", "dialogue_id", "user_message_id", "message_type", 
                       "sender_type", "content", "metadata", "created_at", "updated_at"),
            auto_timestamps=True,
        )
        return ret["id"]

    # --- GetRecentChatMessagesByDialogueId ---
    async def get_recent_chat_messages_by_dialogue_id(
        self, dialogue_id: str, number_of_messages: int
    ) -> List[Message]:
        """
        Retrieve recent messages in a dialogue starting from the N-th latest user message.
        """
        # Perform a subquery to get the N-th latest user message
        query = """
            SELECT user_id, dialogue_id, sender_type, content, metadata
            FROM messages
            WHERE dialogue_id = $1
            AND created_at >= COALESCE((
                SELECT created_at
                FROM messages
                WHERE dialogue_id = $1 AND sender_type = 'user'
                ORDER BY created_at DESC
                OFFSET $2 LIMIT 1
            ), to_timestamp(0))
            ORDER BY created_at DESC
            LIMIT $3
        """
        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, dialogue_id, number_of_messages - 1, number_of_messages)

        return [self._row_to_model(self.model_cls, row) for row in rows]

    # --- GetMessagesByDialogueIdWithCursorPagination ---
    async def get_messages_by_dialogue_id_with_cursor_pagination(
        self, dialogue_id: str, size: int, cursor: str
    ) -> Tuple[List[Message], bool]:
        """
        Get messages by dialogue with cursor pagination.
        """
        size = max(1, min(size, 100))  # Pagination validation
        query_limit = size + 1  # For checking if more items exist

        # Basic query for message retrieval
        base_query = """
            SELECT id, user_id, dialogue_id, sender_type, message_type, content, metadata, created_at
            FROM messages
            WHERE dialogue_id = $1
        """

        query = base_query
        params = [dialogue_id]

        if cursor:
            query += " AND created_at < $2::timestamp"
            query += " ORDER BY created_at DESC LIMIT $3"
            params.append(datetime.datetime.fromisoformat(cursor))
            params.append(query_limit)
        else:
            query += " ORDER BY created_at DESC LIMIT $2"
            params.append(query_limit)

        pool = await postgres_db.connect()
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)

        # Transform rows into message models
        messages = []
        for row in rows:
            message = self._row_to_model(self.model_cls, row)
            messages.append(message)

        has_more = len(messages) > size
        if has_more:
            messages = messages[:size]

        return messages, has_more

message_repository = MessageRepository() 
