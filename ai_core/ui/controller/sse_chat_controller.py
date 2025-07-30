import asyncio
import json
import traceback
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.usecase.chat import ChatUsecase as chatUsecase 


SSEChatRouter = APIRouter(
    prefix="/chat",
    tags=["SSE Chat"],
)

@SSEChatRouter.get("/send-message")
async def sse_chat_stream(
    request: Request,
    dialogue_id: str = "",
    message: str = "",
    type: str = "abilities",
    sse_token: str = ""
):
    """
    SSE streaming endpoint for chat messages.
    Similar to chat_hub's implementation but for ai_core.
    """
    if not message:
        raise HTTPException(status_code=400, detail="message parameter is required")
    
    try:
        # Create QueryRequest object
        query_request = QueryRequest(
            query=message,
            dialogue_id=dialogue_id,
            model_name="default"  # You might want to make this configurable
        )
        
        # Determine chat type from type parameter
        chat_type = enum.ChatType.ABILITIES.value
        if type == "introduction":
            chat_type = enum.ChatType.INTRODUCTION.value
        elif type == "onboarding":
            chat_type = enum.ChatType.ONBOARDING.value
        elif type == "rag":
            chat_type = enum.ChatType.RAG.value
        
        # Create SSE stream generator
        async def generate_sse_stream():
            try:
                # Get the chat response
                response = await chatUsecase.chat(
                    query=query_request, 
                    chat_type=chat_type
                )
                
                # Convert response to string if it's not already
                if isinstance(response, dict):
                    response_text = json.dumps(response, ensure_ascii=False)
                elif isinstance(response, str):
                    response_text = response
                else:
                    response_text = str(response)
                
                # Stream the response in chunks for better user experience
                chunk_size = 50  # Characters per chunk
                chunks = [response_text[i:i+chunk_size] for i in range(0, len(response_text), chunk_size)]
                
                for i, chunk in enumerate(chunks):
                    # Send each chunk as an SSE event
                    sse_data = json.dumps({
                        "chunk": chunk,
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "is_final": i == len(chunks) - 1
                    })
                    yield f"event: message_chunk\ndata: {sse_data}\n\n"
                    
                    # Small delay to simulate streaming effect
                    await asyncio.sleep(0.1)
                
                # Send final completion event
                completion_data = json.dumps({
                    "message": "Stream completed",
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
        
        # Return SSE response
        return StreamingResponse(
            generate_sse_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control"
            }
        )
        
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR in SSE endpoint:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))


@SSEChatRouter.post("/send-message-post")
async def sse_chat_stream_post(request: Request, query: QueryRequest):
    """
    Alternative POST endpoint for SSE streaming.
    Accepts JSON payload instead of query parameters.
    """
    try:
        # Extract additional parameters from request if needed
        # For now, using default chat type
        chat_type = enum.ChatType.ABILITIES.value
        
        # Create SSE stream generator
        async def generate_sse_stream():
            try:
                # Get the chat response
                response = await chatUsecase.chat(
                    query=query, 
                    chat_type=chat_type
                )
                
                # Convert response to string if it's not already
                if isinstance(response, dict):
                    response_text = json.dumps(response, ensure_ascii=False)
                elif isinstance(response, str):
                    response_text = response
                else:
                    response_text = str(response)
                
                # Stream the response in chunks
                chunk_size = 50  # Characters per chunk
                chunks = [response_text[i:i+chunk_size] for i in range(0, len(response_text), chunk_size)]
                
                for i, chunk in enumerate(chunks):
                    sse_data = json.dumps({
                        "chunk": chunk,
                        "chunk_index": i,
                        "total_chunks": len(chunks),
                        "is_final": i == len(chunks) - 1
                    })
                    yield f"event: message_chunk\ndata: {sse_data}\n\n"
                    await asyncio.sleep(0.1)
                
                # Send completion event
                completion_data = json.dumps({
                    "message": "Stream completed",
                    "full_response": response_text
                })
                yield f"event: message_complete\ndata: {completion_data}\n\n"
                
            except Exception as e:
                error_message = str(e)
                stack_trace = traceback.format_exc()
                print("ERROR in SSE POST stream:", stack_trace)
                
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
                "Access-Control-Allow-Headers": "Cache-Control"
            }
        )
        
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR in SSE POST endpoint:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
