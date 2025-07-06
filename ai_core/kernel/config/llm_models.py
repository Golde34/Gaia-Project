import contextvars

from core.domain.enums import kafka_enum
from infrastructure.llm import gemini_generate_content 
from infrastructure.kafka.producer import send_kafka_message


MODELS_INTERFACE = {
    "gemini-2.0-flash": gemini_generate_content.generate_content,
    "unsloth": "UNSLOTH" 
}

async def get_model_generate_content(model_name: str, user_id: str):
    """
    Get the generate content function for the specified model.
    
    Args:
        model_name (str): The name of the model.
        
    Returns:
        str: The generate content function for the model.
    """
    if model_name not in MODELS_INTERFACE:
        raise ValueError(f"Model {model_name} is not supported.")
    session_id = contextvars.ContextVar("session_id").get() 
    try:
        await push_calling_llm_api_times_message(
            user_id=user_id,
            session_id=session_id
        )
    except Exception as e:
        print(f"Error pushing calling LLM API times message: {e}")
    return MODELS_INTERFACE.get(model_name, "unsloth")

async def push_calling_llm_api_times_message(user_id: str, session_id: str):
    payload = {
        "user_id": user_id,
        "session_id": session_id
    } 
    await send_kafka_message(kafka_enum.KafkaTopic.CALLING_LLM_API_TIMES.value, payload)