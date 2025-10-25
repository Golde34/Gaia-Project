
import asyncio
import json
import traceback
from typing import Optional

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from core.domain.request.query_request import QueryRequest
from core.usecase.chat import ChatUsecase as chatUsecase
from ui.sse.connection_registry import (
    format_sse_event,
    register_client,
    unregister_client,
)

KEEP_ALIVE_INTERVAL = 15


async def handle_sse_stream(
    dialogue_id: str,
    message: str,
    model_name: str,
    user_id: str,
    chat_type: str,
):
    """
    Shared SSE stream handler to reduce duplication.
    """
    if not message:
        raise HTTPException(status_code=400, detail="message parameter is required")

    query_request = QueryRequest(
        user_id=user_id,
        query=message,
        dialogue_id=dialogue_id,
        model_name=model_name,
        type=chat_type,
    )

    connection_queue: asyncio.Queue[str] = asyncio.Queue()
    connection_closed = asyncio.Event()

    await register_client(user_id, connection_queue)

    async def enqueue_event(event: str, payload: dict) -> None:
        if connection_closed.is_set():
            return
        await connection_queue.put(format_sse_event(event, payload))

    async def stream_initial_response() -> None:
        try:
            response = await chatUsecase.chat(query=query_request, chat_type=chat_type)
            response_payload, response_text = _extract_response_payload(response)

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

            await enqueue_event(
                "message_complete",
                {
                    "message": "Stream completed",
                    "type": response_payload.get("type"),
                    "full_response": normalized_response,
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
        print(f"ERROR in SSE endpoint [{chat_type}]:", traceback.format_exc())
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
        if "data" in response and isinstance(response["data"], dict):
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
