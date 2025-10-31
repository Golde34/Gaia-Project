import asyncio
from core.domain.enums import kafka_enum
from core.domain.request.query_request import QueryRequest
from infrastructure.llm import gemini_generate_content 
from infrastructure.kafka.producer import send_kafka_message
from kernel.config.config import session_id_var


MODELS_INTERFACE = {
    "gemini-2.0-flash": gemini_generate_content.generate_content,
    "unsloth": "UNSLOTH" 
}

async def get_model_generate_content(model_name: str, user_id: str, prompt: str = None):
    """
    Get the generate content function for the specified model.
    
    Args:
        model_name (str): The name of the model.
        
    Returns:
        str: The generate content function for the model.
    """
    if model_name not in MODELS_INTERFACE:
        raise ValueError(f"Model {model_name} is not supported.")
    session_id = session_id_var.get() 
    try:
        await push_calling_llm_api_times_message(
            user_id=user_id,
            session_id=session_id,
            prompt=prompt
        )
    except Exception as e:
        print(f"Error pushing calling LLM API times message: {e}")
    return MODELS_INTERFACE.get(model_name, "gemini-2.0-flash")

async def push_calling_llm_api_times_message(user_id: str, session_id: str, prompt: str = None):
    payload = {
        "user_id": user_id,
        "session_id": session_id,
        "prompt": prompt if prompt else "",
    } 
    await send_kafka_message(kafka_enum.KafkaTopic.CALLING_LLM_API_TIMES.value, payload)

async def handle_async_final_response(model_name: str, user_id: str, query: QueryRequest, **kwargs):
    """
    Handle the final response from the model asynchronously.
    
    Args:
        model_name (str): The name of the model.
        user_id (str): The ID of the user.
        response (str): The response from the model.
    """
    full_response = ""
    function = await get_model_generate_content(model_name, user_id)(query.model_name, query.user_id)
    async for token in function(prompt=query.query, model_name=model_name, **kwargs):
        full_response += token

    markers = [
        "actual response]",
        "actual response**",
        "actual response:",
    ] 

    text_lower = full_response.lower()

    text_to_process = ""
    for marker in markers:
        pos = text_lower.find(marker)
        if pos != -1:
            text_to_process = full_response[pos + len(marker):].lstrip()
            text_to_process = text_to_process.strip("**").strip(":").strip()
            break

    if not text_to_process:
        basic_marker = "actual response"
        basic_marker_pos = full_response.lower().find(basic_marker)
        
        if basic_marker_pos != -1:
            text_to_process = full_response[basic_marker_pos + len(basic_marker):].lstrip().strip("**").strip()
        else:
            text_to_process = full_response
    
    BREAK_LINE = "\n\n"
    responses = [resp.strip() for resp in text_to_process.split(BREAK_LINE)]

    for response in responses:
        if response:
            yield response
            await asyncio.sleep(0.4)
