import asyncio
import json
import traceback
import inspect
from typing import Optional, Callable, Any
from fastapi.responses import StreamingResponse

from typing import Dict
from kernel.utils.sse_connection_registry import format_sse_event, register_client, unregister_client


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
                # The wrapper will call the provided callable without adding or
                # inferring any parameters. Callers should pass a zero-argument
                # callable (use functools.partial or a bound method to capture
                # required params). The callable can be async (returns a
                # coroutine) or sync. If it returns an awaitable, we'll await it.
                result = func()
                # If the callable returned a coroutine/awaitable, await it.
                if inspect.isawaitable(result):
                    response = await result
                else:
                    response = result
            response_payload, response_text = _extract_response_payload(response)

            # Extract dialogue_id FIRST before any potential errors
            dialogue_id = None
            if isinstance(response_payload, dict):
                dialogue_id = response_payload.get("dialogue_id", None)
                
            if not dialogue_id and meta:
                dialogue_id = meta.get("dialogue_id", None)
            
            # Now stream the chunks
            chunks, normalized_response = _chunk_response(response_text)
            for index, chunk in enumerate(chunks):
                await enqueue_event(
                    "message_chunk",
                    {
                        "chunk": chunk,
                        "chunk_index": index,
                        "total_chunks": len(chunks),
                        "is_final": index == len(chunks) - 1,
                    },
                )
                await asyncio.sleep(0.1)

            # Send message_complete with dialogue_id
            response_type = response_payload.get("type") if isinstance(response_payload, dict) else None
            await enqueue_event(
                "message_complete",
                {
                    "message": "Stream completed",
                    "type": response_type,
                    "full_response": normalized_response,
                    "response": response_payload.get("response") if isinstance(response_payload, dict) else None,
                    "responses": response_payload.get("responses") if isinstance(response_payload, dict) else None,
                    "dialogue_id": dialogue_id,
                },
            )
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            stack_trace = traceback.format_exc()
            print(f"ERROR in SSE stream initial response: {stack_trace}")
            await enqueue_event(
                "error",
                {
                    "error": str(exc),
                    "type": "chat_error",
                },
            )

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
    print("Extracting response payload from:", response)
    if isinstance(response, dict):
        if "responses" in response:
            responses_payload = response["responses"]
            if isinstance(responses_payload, list):
                response_text = "\n\n".join(str(item) for item in responses_payload if item is not None)
            else:
                response_text = str(responses_payload)
            return response, str(response_text)
        # Check if response has "response" field directly (new format)
        if "response" in response:
            response_text = response["response"] if isinstance(response["response"], str) else json.dumps(response["response"], ensure_ascii=False)
            return response, str(response_text)
        # Check if response has nested data structure (old format)
        elif "data" in response and isinstance(response["data"], dict):
            data_payload = response["data"]
            if "response" in data_payload:
                inner_response = data_payload["response"]
                if isinstance(inner_response, str):
                    response_text = inner_response
                else:
                    response_text = json.dumps(inner_response, ensure_ascii=False)
            else:
                response_text = json.dumps(data_payload, ensure_ascii=False)
        else:
            response_text = json.dumps(response, ensure_ascii=False)
        return response if isinstance(response, dict) else {}, str(response_text)

    response_text = str(response)
    return {"data": response_text}, response_text


def _chunk_response(response_text: str, chunk_size: int = 50) -> tuple[list[str], str]:
    sanitized = response_text.replace("\n\n", " ").replace("\r\n", " ").strip()
    if not sanitized:
        return [""], ""
    chunks = [sanitized[i : i + chunk_size] for i in range(0, len(sanitized), chunk_size)]
    return chunks, sanitized
