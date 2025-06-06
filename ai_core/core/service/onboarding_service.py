import json
import re

from core.prompts.classify_prompt import ONBOARDING_PROMPT
from core.prompts.task_prompt import CHITCHAT_PROMPT
from core.domain.request.query_request import SystemRequest
from core.domain.response.model_output_schema import DailyRoutineSchema
from kernel.config import llm_models


default_model = "gemini-2.0-flash"

def register_task(query: SystemRequest) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        prompt = ONBOARDING_PROMPT.format(query=query.query)
        print("Onboarding Prompt:", prompt)
        response = llm_models.get_model_generate_content(
            default_model)(prompt=prompt,
                                model_name=default_model,
                                )
        json_str = clean_json_string(response)
        data_dict = json.loads(json_str)
        schedule_dto = DailyRoutineSchema.parse_obj(data_dict)
        result = {
            "response": schedule_dto 
        }
        return result
    except Exception as e:
        raise e

def clean_json_string(raw_str: str) -> str:
    cleaned = re.sub(r"^```json\s*|\s*```$", "",
                    raw_str, flags=re.MULTILINE).strip()
    return cleaned

def gaia_introduction(query: SystemRequest) -> dict:
    """
    Register task via an user's daily life summary

    Args:
        query (str): onboarding user's daily summary 

    Returns:
        user_daily_entries (dict):  
    """
    try:
        prompt = CHITCHAT_PROMPT.format(query=query.query)
        print("Onboarding Prompt:", prompt)
        response = llm_models.get_model_generate_content(
            default_model)(prompt=prompt,
                                model_name=default_model,
                                )
        return {
            "response": response 
        }
    except Exception as e:
        raise e