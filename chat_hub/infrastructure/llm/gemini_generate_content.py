from google import genai
from core.domain.request.query_request import LLMModel
from fastapi import HTTPException
from kernel.config import config


client = genai.Client(api_key=config.GEMINI_API_KEY)

def generate_content(prompt: str, model: LLMModel, dto: any = None) -> str:
    """
    Generate content using the Gemini API.
    Args:
        query (str): The user's query.
    Returns:
        str: The generated content.
    """
    try:
        if model is not None:
            user_client = genai.Client(api_key=model.model_key)
        else:
            user_client = client

        if dto:
            response = user_client.models.generate_content(
                model=model.model_name, 
                contents=[prompt],
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': dto,
                },
            )
        else:
            response = user_client.models.generate_content(
                model=model.model_name, 
                contents=[prompt],
            )

        # print(response)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
