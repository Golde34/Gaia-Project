import os
import json
from google import genai
from fastapi import HTTPException
from dotenv import load_dotenv


load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

def generate_content(prompt: str, model_name: str, dto: any = None) -> str:
    """
    Generate content using the Gemini API.
    Args:
        query (str): The user's query.
    Returns:
        str: The generated content.
    """
    try:
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
