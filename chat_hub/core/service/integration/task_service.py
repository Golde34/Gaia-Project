import json

from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.domain.response.model_output_schema import CreateTaskResponseSchema, CreateTaskResultSchema, CreateTaskSchema
from core.prompts.task_prompt import CREATE_TASK_PROMPT, PARSING_DATE_PROMPT, TASK_RESULT_PROMPT, TASK_RESULT_PROMPT_2
from infrastructure.client.task_manager_client import task_manager_client
from infrastructure.repository.task_status_repo import task_status_repo
from kernel.config import llm_models
from kernel.utils.parse_json import parse_json_string


class PersonalTaskService:
    """
    MCP to connect with Task Manager Service
    1. Create Personal Task (line 17-39)
    2. Create Personal Task Result (line 96-113)
    3. Optimize Calendar (line 115-129)
    """

    async def create_personal_task(self, query: QueryRequest):
        """
        Create task pipeline
        Args:
            query (QueryRequest): The user's query containing task information.
        Returns:
            str: Short response to the request
        """
        try:
            task_data = await self._create_personal_task_llm(query)
            created_task = task_manager_client.create_personal_task(task_data)
            task_result_response = await self.create_personal_task_result(task=created_task, query=query) 
            response: CreateTaskResponseSchema = json.loads(task_result_response)
            responses = [
                response.response,
                response.task
            ]
            return responses, response.operationStatus 
        except Exception as e:
            raise e

    async def _create_personal_task_llm(self, query: QueryRequest) -> dict:
        """
        Create task information extraction prompt for Gemini API.
        Args:
            query (QueryRequest): The user's query containing task information.
        Returns:
            dict: A structured JSON object with the extracted and optionally optimized task information.
        """
        try:
            datetime_parse_col = ['startDate', 'deadline']
            prompt = CREATE_TASK_PROMPT.format(query=query.query)

            function = await llm_models.get_model_generate_content(query.model, query.user_id)
            response = function(
                prompt=prompt, model=query.model, dto=CreateTaskSchema)

            task_data = json.loads(response)

            datetime_values = {
                key: value for key, value in task_data.items()
                if key in datetime_parse_col and value
            }

            if datetime_values:
                optimized = await self._optimize_datetime(
                    datetime_object=datetime_values, query=query
                )

                for key in list(optimized.keys()):
                    if key not in datetime_values:
                        del optimized[key]

                for key, expr in optimized.items():
                    try:
                        task_data[key] = eval(expr)
                    except Exception:
                        print("Exception while parsing", expr)
                        task_data[key] = datetime_values[key]

            return task_data

        except Exception as e:
            raise e

    async def _optimize_datetime(self, datetime_object: dict, query: QueryRequest) -> dict:
        try:
            prompt = PARSING_DATE_PROMPT.format(input=datetime_object)
            function = await llm_models.get_model_generate_content(query.model, query.user_id)
            response = function(prompt=prompt, model=query.model)
            return parse_json_string(response)
        except Exception as e:
            raise e

    async def create_personal_task_result(self, task: dict, query: QueryRequest) -> str:
        """
        Task result pipeline
        Args:
            query (str): The user's query containing task information.
        Returns:
            str: Short response to the request
        """

        try:
            prompt = TASK_RESULT_PROMPT_2.format(task=task)
            function = await llm_models.get_model_generate_content(query.model, query.user_id)
            response = function(prompt=prompt, model=query.model,
                                dto=CreateTaskResponseSchema)
            return json.loads(response)
        except Exception as e:
            raise e

    def optimize_calendar(self, query: QueryRequest) -> str:
        """
        Optimize calendar entries based on user query.
        Args:
            query (QueryRequest): The user's query containing calendar information.
        Returns:
            str: Optimized calendar entries.
        """
        try:
            # call LLM api to confirm this response
            # call API to get optimized calendar
            # make this task PENDING, so consumer will handle it later
            pass
        except Exception as e:
            raise e


personal_task_service = PersonalTaskService()


def handle_task_service_response(matched_type: str, result: any) -> str:
    if matched_type == enum.GaiaAbilities.CHITCHAT.value:
        data = {
            'type': matched_type,
            'response': result
        }
    elif matched_type == enum.GaiaAbilities.SEARCH.value:
        payload = result if isinstance(result, dict) else {
            'response': str(result)}
        data = {
            'type': matched_type,
            'response': payload.get('response', ''),
            'search': payload
        }
    else:
        data = {
            'type': matched_type,
            'response': result.get('response'),
            'task': result
        }

    return data
