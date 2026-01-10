import json

from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.domain.response.model_output_schema import CreateTaskResponseSchema, CreateTaskSchema
from core.prompts.task_prompt import CREATE_TASK_PROMPT, PARSING_DATE_PROMPT, TASK_RESULT_PROMPT_2
from core.service.abilities.function_handlers import function_handler
from core.service.chat_service import push_and_save_bot_message
from infrastructure.client.task_manager_client import task_manager_client
from kernel.config import llm_models
from kernel.utils.parse_json import parse_json_string


class PersonalTaskService:
    """
    MCP to connect with Task Manager Service
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
            task_data, valid = await self._generate_personal_task_llm(query)
            await push_and_save_bot_message(
                message=task_data["response"], query=query
            )

            if not valid:
                is_valid_group_task = valid.get("groupTask") is None
                is_valid_project = valid.get("project") is None
                if not is_valid_group_task:
                    self.group_task_list(query)
                if not is_valid_project:
                    self.project_list(query)
                return task_data["response"], True

            # created_task = await task_manager_client.create_personal_task(task_data)
            created_task = {
                "id": "68b085c93abd0bb364036682",
                "title": task_data.get("title"),
                "description": task_data.get("description"),
                "priority": task_data.get("priority", []),
                "status": "TODO",
                "startDate": task_data.get("startDate"),
                "deadline": task_data.get("deadline"),
                "duration": task_data.get("duration"),
                "createdAt": "2025-08-28T16:37:29.156Z",
                "updatedAt": "2025-08-28T16:37:29.156Z",
                "activeStatus": "ACTIVE",
                "groupTaskId": None,
                "userId": query.user_id,
                "__v": 0,
                "tag": task_data.get("tag", "general"),
            }
            
            task_result = await self._handle_task_result(task=created_task, query=query)
            
            task_card_data = task_result.get("task")
            if isinstance(task_card_data, dict) and "response" in task_card_data:
                task_card_data = {k: v for k, v in task_card_data.items() if k != "response"}
            await push_and_save_bot_message(
                message=task_card_data, 
                query=query,
                message_type="task_result"
            )

            return task_result.get("response"), True # Last message

        except Exception as e:
            raise e

    async def _generate_personal_task_llm(self, query: QueryRequest) -> dict:
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

            # validate create task schema, if non null fields are missing, 
            # return response.response to tell user that 
            # what null fields they need to provide
            validation = True
            if not validation:
                return task_data, False

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

            return task_data, True

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

    async def _handle_task_result(self, task: dict, query: QueryRequest) -> dict:
        task_result_response = await self._create_personal_task_result(task=task, query=query)
        response: CreateTaskResponseSchema = task_result_response
        print("Final response object:", response)
        return {
            "response": response["response"],
            "task": response["task"],
            "operationStatus": response["operationStatus"],
            "dialogueId": query.dialogue_id
        }

    async def _create_personal_task_result(self, task: dict, query: QueryRequest) -> str:
        """
        Task result pipeline
        Args:
            query (str): The user's query containing task information.
        Returns:
            str: Short response to the request
        """
        try:
            task_str = json.dumps(task)
            prompt = TASK_RESULT_PROMPT_2.format(task=task_str)
            function = await llm_models.get_model_generate_content(
                query.model, query.user_id, prompt=prompt
            )
            response = function(prompt=prompt, model=query.model,
                                dto=CreateTaskResponseSchema)
            return json.loads(response)
        except Exception as e:
            raise e

    async def project_list(self, query: QueryRequest) -> str:
        """
        Fetch and return the list of projects for the user.
        Args:
            query (QueryRequest): The user's query containing user information.
        Returns:
            str: List of projects in string format.
        """
        try:
            return await task_manager_client.project_list(query.user_id)
        except Exception as e:
            raise e 

    async def group_task_list(self, query: QueryRequest) -> str:
        """
        Fetch and return the list of group tasks for the specified group.
        Args:
            query (QueryRequest): The user's query containing group information.
        Returns:
            str: List of group tasks in string format.
        """
        try:
            group_id = query.additional_info.get("groupId")
            return await task_manager_client.group_task_list(group_id)
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

# Register bound method to function handler registry
function_handler(label=enum.GaiaAbilities.CREATE_TASK.value, is_sequential=True, is_executable=True)(
    personal_task_service.create_personal_task
)

function_handler(label=enum.GaiaAbilities.PROJECT_LIST.value, is_sequential=False, is_executable=True)(
    personal_task_service.project_list
)

function_handler(label=enum.GaiaAbilities.GROUP_TASK_LIST.value, is_sequential=False, is_executable=True)(
    personal_task_service.group_task_list
)
