from google import genai
from fastapi import HTTPException
from dotenv import load_dotenv

from kernel.config.config import Config as config


load_dotenv()
client = genai.Client(api_key=config.SYSTEM_API_KEY)

def generate_content(prompt: str, model_name: str = None, dto: any = None) -> str:
    """
    Generate content using the Gemini API.
    Args:
        query (str): The user's query.
    Returns:
        str: The generated content.
    """
    try:
        if model_name is None:
            model_name = "gemini-2.5-flash"
        if dto:
            response = client.models.generate_content(
                model=model_name, 
                contents=[prompt],
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': dto,
                },
            )
        else:
            response = client.models.generate_content(
                model=model_name, 
                contents=[prompt],
            )

        # print(response)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

