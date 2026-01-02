import asyncio
import json
import traceback
import inspect
import uuid
from typing import Optional, Callable, Any
from fastapi.responses import StreamingResponse

from typing import Dict
from kernel.utils.sse_connection_registry import format_sse_event, register_client, unregister_client
from kernel.utils.sse_message_broadcaster import (
    broadcast_message_start,
    broadcast_message_chunk,
    broadcast_message_end,
    broadcast_message_complete,
    broadcast_error,
    MessageType
)


KEEP_ALIVE_INTERVAL = 15


async def handle_sse_stream(
    user_id: int,
    func: Optional[Callable[..., Any]] = None,
    *,
    meta: Optional[Dict[str, Any]] = None,
) -> StreamingResponse:
    """
    Shared SSE stream handler that wraps a callable producing a message/response.

    The SSE wrapper is intentionally thin: it does not attempt to construct or
    inspect parameters for the provided callable. Callers should provide a
    zero-argument callable (for example `functools.partial(cls.store_message, user_id, request)`)
    which captures any required arguments. The callable may be async or sync.

    Args:
        user_id: id of the user for connection registration.
        func: zero-argument callable producing the response (dict or str).
        meta: optional metadata that will be ignored by the wrapper but can be
              used by callers for bookkeeping (not used internally).

    Returns:
        StreamingResponse streamed back to the client.
    """

    connection_queue: asyncio.Queue[str] = asyncio.Queue()
    connection_closed = asyncio.Event()

    await register_client(user_id, connection_queue)

    async def enqueue_event(event: str, payload: dict) -> None:
        if connection_closed.is_set():
            return
        await connection_queue.put(format_sse_event(event, payload))

    async def stream_initial_response() -> None:
        try:
            response = None
            if func:
                result = func()
                if inspect.isawaitable(result):
                    response = await result
                else:
                    response = result
            
            response_payload, response_text = _extract_response_payload(response)

            # Extract dialogue_id
            dialogue_id = None
            if isinstance(response_payload, dict):
                dialogue_id = response_payload.get("dialogue_id")
            if not dialogue_id and meta:
                dialogue_id = meta.get("dialogue_id")
            
            # Get responses list
            responses_list = []
            if isinstance(response_payload, dict) and "responses" in response_payload:
                responses = response_payload.get("responses")
                responses_list = responses if isinstance(responses, list) else [responses] if responses else []
            elif response_text:
                responses_list = [response_text]
            
            # Stream each response as a separate message
            for response_item in responses_list:
                message_id = await broadcast_message_start(str(user_id), dialogue_id=dialogue_id)
                
                item_text = str(response_item) if response_item else ""
                chunks = _chunk_response(item_text)
                
                for index, chunk in enumerate(chunks):
                    await broadcast_message_chunk(str(user_id), message_id, chunk, index)
                    await asyncio.sleep(0.1)
                
                await broadcast_message_end(str(user_id), message_id)

            # Send completion
            await broadcast_message_complete(str(user_id), dialogue_id)
            
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            print(f"ERROR in SSE stream: {traceback.format_exc()}")
            await broadcast_error(str(user_id), str(exc))

    async def keep_alive() -> None:
        try:
            while not connection_closed.is_set():
                await asyncio.sleep(KEEP_ALIVE_INTERVAL)
                if connection_closed.is_set():
                    break
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
            await unregister_client(user_id, connection_queue)

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


def _extract_response_payload(response: Optional[dict]) -> tuple[dict, str]:
    if isinstance(response, dict):
        if "responses" in response:
            responses = response["responses"]
            text = "\n\n".join(str(item) for item in responses if item) if isinstance(responses, list) else str(responses)
            return response, text
        if "response" in response:
            return response, str(response["response"])
    return {"data": str(response)}, str(response)


def _chunk_response(text: str, size: int = 50) -> list[str]:
    text = text.replace("\n\n", " ").replace("\r\n", " ").strip()
    return [text[i:i + size] for i in range(0, len(text), size)] if text else [""]


async def push_response_to_client(user_id: str, response_text: str, dialogue_id: Optional[str] = None) -> None:
    message_id = await broadcast_message_start(user_id, dialogue_id=dialogue_id)
    
    chunks = _chunk_response(response_text)
    
    for index, chunk in enumerate(chunks):
        await broadcast_message_chunk(user_id, message_id, chunk, index)
        await asyncio.sleep(0.05)
    
    await broadcast_message_end(user_id, message_id )