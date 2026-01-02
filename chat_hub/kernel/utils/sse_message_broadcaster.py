"""SSE Message Broadcasting - Standardized message types for SSE streams"""
import uuid
from typing import Optional
from kernel.utils.sse_connection_registry import broadcast_to_user


class MessageType:
    MESSAGE_START = "message_start"
    MESSAGE_CHUNK = "message_chunk"
    MESSAGE_END = "message_end"
    MESSAGE_COMPLETE = "message_complete"
    ERROR = "error"


async def broadcast_message_start(user_id: str, message_id: Optional[str] = None, dialogue_id: Optional[str] = None) -> str:
    message_id = message_id or f"msg-{uuid.uuid4()}"
    await broadcast_to_user(user_id, MessageType.MESSAGE_START, {
        "message_id": message_id,
        "dialogue_id": dialogue_id
    })
    return message_id


async def broadcast_message_chunk(user_id: str, message_id: str, content: str, chunk_index: int) -> None:
    await broadcast_to_user(user_id, MessageType.MESSAGE_CHUNK, {
        "message_id": message_id,
        "content": content,
        "chunk_index": chunk_index
    })


async def broadcast_message_end(user_id: str, message_id: str) -> None:
    await broadcast_to_user(user_id, MessageType.MESSAGE_END, {
        "message_id": message_id
    })


async def broadcast_message_complete(user_id: str, dialogue_id: Optional[str] = None) -> None:
    await broadcast_to_user(user_id, MessageType.MESSAGE_COMPLETE, {
        "dialogue_id": dialogue_id
    })


async def broadcast_error(user_id: str, error: str) -> None:
    await broadcast_to_user(user_id, MessageType.ERROR, {
        "error": error
    })
