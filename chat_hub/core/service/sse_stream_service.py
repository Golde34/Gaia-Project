import asyncio
import traceback
import inspect
from typing import Optional, Callable, Any, Dict
from fastapi.responses import StreamingResponse

from core.domain.enums.enum import DialogueEnum, MessageType
from kernel.utils.sse_connection_registry import (
    broadcast_message_start,
    broadcast_message_chunk,
    broadcast_message_end,
    broadcast_message_complete,
    broadcast_error,
    broadcast_success,
    broadcast_failure,
    format_sse_event, 
    register_client, 
    unregister_client
)

KEEP_ALIVE_INTERVAL = 15


async def handle_sse_stream(
    user_id: int,
    func: Optional[Callable[..., Any]] = None,
) -> StreamingResponse:
    """SSE handler with broadcast (chat) or legacy (onboarding) mode"""
    connection_queue: asyncio.Queue[str] = asyncio.Queue()
    connection_closed = asyncio.Event()

    await register_client(str(user_id), connection_queue)

    async def enqueue_event(event: str, payload: dict) -> None:
        if not connection_closed.is_set():
            await connection_queue.put(format_sse_event(event, payload))

    async def stream_initial_response() -> None:
        try:
            # Call the provided function to get the response
            result = func() if func else None

            response = await result if inspect.isawaitable(result) else result
            print("SSE stream initial response:", response)  # SUCCESS or FAILURE
            
            # Broadcast final status event for client to close connection
            if response == MessageType.SUCCESS_MESSAGE:
                await broadcast_success(str(user_id))
            elif response == MessageType.FAILURE_MESSAGE:
                await broadcast_failure(str(user_id), "Chat processing failed")
            else:
                # Default to success if response is not explicitly FAILURE
                await broadcast_success(str(user_id))

        except asyncio.CancelledError:
            raise
        except Exception as exc:
            print(f"ERROR in SSE stream: {traceback.format_exc()}")
            await broadcast_failure(str(user_id), str(exc))

    async def keep_alive() -> None:
        try:
            while not connection_closed.is_set():
                await asyncio.sleep(KEEP_ALIVE_INTERVAL)
                await connection_queue.put(": keep-alive\n\n")
        except asyncio.CancelledError:
            pass

    initial_task = asyncio.create_task(stream_initial_response())
    keep_alive_task = asyncio.create_task(keep_alive())

    async def event_generator():
        try:
            while True:
                message = await connection_queue.get()
                if message is None:
                    break
                yield message
        except asyncio.CancelledError:
            raise
        finally:
            connection_closed.set()
            initial_task.cancel()
            keep_alive_task.cancel()
            await asyncio.gather(
                initial_task,
                keep_alive_task,
                return_exceptions=True,
            )
            await unregister_client(str(user_id), connection_queue)

    try:
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control",
            },
        )
    except Exception:
        print("ERROR in SSE endpoint:", traceback.format_exc())
        initial_task.cancel()
        keep_alive_task.cancel()
        await asyncio.gather(
            initial_task,
            keep_alive_task,
            return_exceptions=True,
        )
        await unregister_client(user_id, connection_queue)
        raise


async def handle_broadcast_mode(response: Any, user_id: int, dialogue_id: Optional[Dict]) -> None:
    """
    Broadcast mode: push response to client using broadcast functions
    Abilities use this mode
    """
    responses_list = _extract_responses(response)

    for item in responses_list:
        msg_id = await broadcast_message_start(str(user_id), dialogue_id=dialogue_id)
        chunks = _chunk_text(str(item) if item else "")

        for idx, chunk in enumerate(chunks):
            await broadcast_message_chunk(str(user_id), msg_id, chunk, idx)
            await asyncio.sleep(0.05)

        await broadcast_message_end(str(user_id), msg_id)

    await broadcast_message_complete(str(user_id), dialogue_id)
    

def _extract_responses(response: Any) -> list:
    if isinstance(response, dict):
        if "responses" in response:
            r = response["responses"]
            return r if isinstance(r, list) else [r] if r else []
        if "response" in response:
            return [response["response"]]
    return [str(response)] if response else [""]


def _chunk_text(text: str, size: int = 50) -> list[str]:
    text = text.replace("\n\n", " ").replace("\r\n", " ").strip()
    return [text[i:i + size] for i in range(0, len(text), size)] if text else [""]