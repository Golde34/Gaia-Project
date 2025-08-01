import asyncio
import json
import traceback

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
    dialogue_id: str = "",
    message: str = "",
    model_name: str = "gemini-2.0-flash",
    chat_type: str = "abilities",
    user_id: str = None
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
            user_id=user_id,
            query=message,
            dialogue_id=dialogue_id,
            model_name=model_name,
            type=chat_type
        )
        
        # Create SSE stream generator
        async def generate_sse_stream():
            try:
                # Get the chat response
                response = await chatUsecase.chat(
                    query=query_request, 
                    chat_type=chat_type
                )
                
                print("SSE chat response:", response)
                
                # Extract response text safely
                if isinstance(response, dict):
                    if 'data' in response and 'response' in response['data']:
                        response_text = response['data']['response']
                    elif 'response' in response:
                        response_text = response['response']
                    else:
                        response_text = json.dumps(response, ensure_ascii=False)
                else:
                    response_text = str(response)
                
                # Clean the response text to remove problematic characters
                response_text = response_text.replace('\n\n', ' ').replace('\r\n', ' ').strip()
                
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
                
                print("SSE POST chat response:", response)
                
                # Extract response text safely
                if isinstance(response, dict):
                    if 'data' in response and 'response' in response['data']:
                        response_text = response['data']['response']
                    elif 'response' in response:
                        response_text = response['response']
                    else:
                        response_text = json.dumps(response, ensure_ascii=False)
                else:
                    response_text = str(response)
                
                # Clean the response text to remove problematic characters
                response_text = response_text.replace('\n\n', ' ').replace('\r\n', ' ').strip()
                
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


@SSEChatRouter.get("/onboarding/introduce-gaia")
async def sse_onboarding_stream(
    dialogue_id: str = "",
    message: str = "",
    model_name: str = "gemini-2.0-flash",
    user_id: str = None
):
    """
    SSE streaming endpoint for onboarding introduction.
    """
    if not message:
        raise HTTPException(status_code=400, detail="message parameter is required")
    
    try:
        # Create QueryRequest object
        query_request = QueryRequest(
            user_id=user_id,
            query=message,
            dialogue_id=dialogue_id,
            model_name=model_name,
            type=enum.ChatType.GAIA_INTRODUCTION.value
        )
        
        # Create SSE stream generator
        async def generate_sse_stream():
            try:
                # Get the chat response
                response = await chatUsecase.chat(
                    query=query_request, 
                    chat_type=enum.ChatType.GAIA_INTRODUCTION.value
                )

                print("SSE onboarding response:", response)
                
                # Extract response text safely
                if isinstance(response, dict):
                    if 'data' in response and 'response' in response['data']:
                        response_text = response['data']['response']
                    elif 'response' in response:
                        response_text = response['response']
                    else:
                        response_text = json.dumps(response, ensure_ascii=False)
                else:
                    response_text = str(response)
                
                # Clean the response text to remove problematic characters
                response_text = response_text.replace('\n\n', ' ').replace('\r\n', ' ').strip()
                
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
                    "type": response.get('type', 'onboarding') if isinstance(response, dict) else 'onboarding',
                    "full_response": response_text
                })
                yield f"event: message_complete\ndata: {completion_data}\n\n"
                
            except Exception as e:
                error_message = str(e)
                stack_trace = traceback.format_exc()
                print("ERROR in onboarding SSE stream:", stack_trace)
                
                error_data = json.dumps({
                    "error": error_message,
                    "type": "onboarding_error"
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
        print("ERROR in onboarding SSE endpoint:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))


@SSEChatRouter.get("/onboarding/register-calendar")
async def sse_calendar_stream(
    dialogue_id: str = "",
    message: str = "",
    model_name: str = "gemini-2.0-flash",
    user_id: str = None
):
    """
    SSE streaming endpoint for calendar registration.
    """
    if not message:
        raise HTTPException(status_code=400, detail="message parameter is required")
    
    try:
        # Create QueryRequest object
        query_request = QueryRequest(
            user_id=user_id,
            query=message,
            dialogue_id=dialogue_id,
            model_name=model_name,
            type=enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value
        )
        
        # Create SSE stream generator
        async def generate_sse_stream():
            try:
                # Get the chat response
                response = await chatUsecase.chat(
                    query=query_request, 
                    chat_type=enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value
                )
                
                print("SSE calendar response:", response)
                
                # Extract response text safely
                if isinstance(response, dict):
                    if 'data' in response and 'response' in response['data']:
                        response_text = response['data']['response']
                    elif 'response' in response:
                        response_text = response['response']
                    else:
                        response_text = json.dumps(response, ensure_ascii=False)
                else:
                    response_text = str(response)
                
                # Clean the response text to remove problematic characters
                response_text = response_text.replace('\n\n', ' ').replace('\r\n', ' ').strip()
                
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
                print("ERROR in calendar SSE stream:", stack_trace)
                
                error_data = json.dumps({
                    "error": error_message,
                    "type": "calendar_error"
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
        print("ERROR in calendar SSE endpoint:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
