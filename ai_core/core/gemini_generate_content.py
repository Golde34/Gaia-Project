import os
import json
from google import genai
from fastapi import HTTPException
from dotenv import load_dotenv

from core.domain.response.create_task_dto import CreateTaskDto
from infrastucture.prompt import create_task_prompt 


load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

def create_task(query: str) -> str:
    """
    Create task information extraction prompt for Gemini API.
    Args:
        query (str): The user's query containing task information.
    Returns:
        CreateTaskDto: A structured JSON object with the extracted task information.
        {
        "Project": str,
        "GroupTask": str,
        "Title": str,
        "Priority": str,
        "Status": str,
        "StartDate": Optional[str],
        "Deadline": Optional[str],
        "Duration": Optional[str]
        }
    """
    try:
        prompt = create_task_prompt(query)
        
        response = client.models.generate_content(
            model="gemini-2.0-flash", 
            contents=[prompt],
            config={
                'response_mime_type': 'application/json',
                'response_schema': CreateTaskDto,
            },
        )
        
        print(response)
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
