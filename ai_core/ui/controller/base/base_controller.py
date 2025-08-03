
import asyncio
import json
import traceback

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.usecase.chat import ChatUsecase as chatUsecase


async def handle_sse_stream(
    dialogue_id: str,
    message: str,
    model_name: str,
    user_id: str,
    chat_type: str 
):
    """
    Shared SSE stream handler to reduce duplication.
    """
    if not message:
        raise HTTPException(
            status_code=400, detail="message parameter is required")

    try:
        query_request = QueryRequest(
            user_id=user_id,
            query=message,
            dialogue_id=dialogue_id,
            model_name=model_name,
            type=chat_type
        )

        async def generate_sse_stream():
            try:
                response = await chatUsecase.chat(
                    query=query_request,
                    chat_type=chat_type
                )

                if isinstance(response, dict):
                    if 'data' in response and 'response' in response['data']:
                        response_text = response['data']['response']
                    elif 'response' in response:
                        response_text = response['response']
                    else:
                        response_text = json.dumps(response, ensure_ascii=False)
                else:
                    response_text = str(response)

                response_text = response_text.replace(
                    '\n\n', ' ').replace('\r\n', ' ').strip()

                chunk_size = 50
                chunks = [response_text[i:i+chunk_size]
                        for i in range(0, len(response_text), chunk_size)]

                for i, chunk in enumerate(chunks):
                    sse_data = json.dumps({
                        "chunk": chunk,
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "is_final": i == len(chunks) - 1
                    })
                    yield f"event: message_chunk\ndata: {sse_data}\n\n"
                    await asyncio.sleep(0.1)

                completion_data = json.dumps({
                    "message": "Stream completed",
                    "type": response.get('type'),
                    "full_response": response_text
                })
                yield f"event: message_complete\ndata: {completion_data}\n\n" 
            except Exception as e:
                    # Send error event
                    error_message = str(e)
                    stack_trace = traceback.format_exc()
                    print("ERROR in SSE stream:", stack_trace)

                    error_data = json.dumps({
                        "error": error_message,
                        "type": "chat_error"
                    })
                    yield f"event: error\ndata: {error_data}\n\n"

        return StreamingResponse(
            generate_sse_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control",
            },
        )

    except Exception as e:
        print(
            f"ERROR in SSE endpoint [{chat_type.name}]:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
