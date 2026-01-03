import asyncio
import json
from typing import Dict, Optional, Set
import uuid

from core.domain.enums.enum import MessageType


_connections: Dict[str, Set[asyncio.Queue]] = {}
_lock = asyncio.Lock()


def _format_event(event: str, payload: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def register_client(user_id: str, queue: asyncio.Queue) -> None:
    """Register a queue to receive SSE events for a user."""
    if not user_id:
        return
    async with _lock:
        queues = _connections.setdefault(user_id, set())
        queues.add(queue)


async def unregister_client(user_id: str, queue: asyncio.Queue) -> None:
    """Remove a queue from the registry for a user."""
    if not user_id:
        return
    async with _lock:
        queues = _connections.get(user_id)
        if not queues:
            return
        queues.discard(queue)
        if not queues:
            _connections.pop(user_id, None)


async def broadcast_to_user(user_id: str, event: str, payload: dict) -> None:
    """Send an SSE event to all active connections for a user."""
    if not user_id:
        return
    message = _format_event(event, payload)
    async with _lock:
        queues = list(_connections.get(user_id, set()))
    await asyncio.gather(
        *(_safe_put(queue, message) for queue in queues),
        return_exceptions=True,
    )


async def _safe_put(queue: asyncio.Queue, message: str) -> None:
    try:
        await queue.put(message)
    except asyncio.CancelledError:
        raise
    except Exception:
        # Drop the message if the queue is no longer available.
        pass


def format_sse_event(event: str, payload: dict) -> str:
    """Expose formatter for modules that need to craft event messages."""
    return _format_event(event, payload)


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


async def broadcast_success(user_id: str) -> None:
    """Broadcast SUCCESS event - client should close connection after receiving this."""
    await broadcast_to_user(user_id, MessageType.SUCCESS, {
        "status": "success",
        "message": "Request completed successfully"
    })


async def broadcast_failure(user_id: str, error: str = "Request failed") -> None:
    """Broadcast FAILURE event - client should close connection after receiving this."""
    await broadcast_to_user(user_id, MessageType.FAILURE, {
        "status": "failure",
        "error": error
    })
