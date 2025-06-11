import json

from core.dictionary.tree_function import FUNCTIONS
from kernel.config import llm_models
import core.domain.request.query_request as QueryRequest
from core.prompts.classify_prompt import CLASSIFY_PROMPT
from core.service.base.service_handler import handle_service 


def handle_user_prompt(query: QueryRequest) -> str:
    """
     Classify type of task using for the query
     Args:
         query (str): The user's query containing task information.
     Returns:
         Task service function
     """
    try:
        print("Start task service")
        tools_string = json.dumps(FUNCTIONS, indent=2)

        prompt = CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)

        classify_response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)

        print("Classify Response:", classify_response)
        return handle_service(query=query, classify=classify_response) 
        
    except Exception as e:
        raise e
