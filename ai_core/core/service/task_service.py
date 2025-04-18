import json
from fastapi import HTTPException

from core.domain.request.query_request import QueryRequest
from core.domain.response.create_task_dto import CreateTaskDto
from core.prompt import create_task_prompt
from kernel.configs import llm_models 


def create_task(query: QueryRequest) -> str:
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
        print("Query:", query.model_name)

        response = llm_models.get_model_generate_content(query.model_name)(prompt=prompt,dto=CreateTaskDto) 
        print("Response:", response)
        return json.loads(response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))