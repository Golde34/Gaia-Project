import json
import traceback
from fastapi import APIRouter, HTTPException

from core.dictionary.tree_function import FUNCTIONS
from core.domain.request.query_request import QueryRequest
from core.prompts.classify_prompt import CLASSIFY_PROMPT
from core.service.base.service_handler import handle_service
from kernel.config import llm_models


ChatRouter = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

@ChatRouter.post("/")
async def chat(query: QueryRequest):
    try:
        print("Received request:", query)
        tools_string = json.dumps(FUNCTIONS, indent=2)

        prompt = CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)

        classify_response = llm_models.get_model_generate_content(
            query.model_name)(prompt=prompt, model_name=query.model_name)

        print("Classify Response:", classify_response)
        return handle_service(query=query, classify=classify_response)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))
