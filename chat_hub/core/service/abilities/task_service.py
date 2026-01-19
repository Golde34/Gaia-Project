import json

from core.domain.enums import enum, kafka_enum, redis_enum
from core.domain.request.query_request import LLMModel, QueryRequest
from core.domain.response.model_output_schema import CreateTaskResponseSchema, CreateTaskSchema
from core.prompts.task_prompt import (
    PARSING_DATE_PROMPT, 
    TASK_RESULT_PROMPT_2, 
    UPGRADATION_CREATE_TASK_PROMPT,
    LIST_PROJECT_PROMPT,
    LIST_GROUP_TASK_PROMPT
)
from core.service.abilities.function_handlers import function_handler
from core.service.chat_service import push_and_save_bot_message
from infrastructure.client.recommendation_service_client import recommendation_service_client
from infrastructure.client.task_manager_client import task_manager_client
from infrastructure.kafka.producer import publish_message
from infrastructure.redis.redis import get_key
from kernel.config import config, llm_models
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
            bool: Whether further recommendation is needed
        """
        is_recommendation = False
        try:
            task_data, missing_fields = await self._generate_personal_task_llm(query)
            await push_and_save_bot_message(
                message=task_data["response"], query=query
            )

            if missing_fields:
                await self.question_missing_fields(missing_fields, query)
                return task_data["response"], is_recommendation 

            # created_task = await task_manager_client.create_personal_task(task_data)
            created_task = task_data  # MOCKED for now

            created_task, response = await self._create_personal_task_result(task=created_task, query=query)
            await push_and_save_bot_message(
                message=created_task,
                query=query,
                message_type="task_result"
            )

            is_recommendation = True

            return response, is_recommendation  # Last message

        except Exception as e:
            raise e

    async def question_missing_fields(self, missing_fields: dict, query: QueryRequest) -> None:
        """Call recomendation service to get project list and group task list, ready answer user

        Args:
            missing_fields (dict): missing fields from task generation
            query (QueryRequest): The user's query containing task information.
        Returns:
            str: response message to user
        """
        is_async = True
        if missing_fields.get("project"):
            await self._list_project(query=query, is_async=is_async) 
        if missing_fields.get("groupTask"):
            await self._list_group_task(query=query, is_async=is_async)
    
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
            prompt = UPGRADATION_CREATE_TASK_PROMPT.format(query=query.query)

            function = await llm_models.get_model_generate_content(query.model, query.user_id)
            response = function(
                prompt=prompt, model=query.model, dto=CreateTaskSchema)

            task_data = json.loads(response)

            missing_fields = await self._validate_generated_task(task_data)
            if missing_fields:
                return task_data, missing_fields

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

            return task_data, None

        except Exception as e:
            raise e  

    async def _validate_generated_task(self, task_data: dict) -> dict:
        """
        Validate the generated task data for required fields.
        Ask user again if group task or project is missing.
        Maybe ask user to choose optional fields if they are null
        Args:
            task_data (dict): The generated task data.
        Returns:
            dict: A dictionary indicating missing fields if any.
        """
        required_fields = ['project', 'groupTask']
        missing_fields = {
            field: True for field in required_fields
            if not getattr(task_data, field, None)
        }
        return missing_fields or None

    async def _optimize_datetime(self, datetime_object: dict, query: QueryRequest) -> dict:
        try:
            llm_model: LLMModel = LLMModel(
                model_name=config.LLM_SUB_MODEL,
                model_key=config.SYSTEM_API_KEY,
                memory_model=enum.MemoryModel.DEFAULT.value,
                organization=config.SYSTEM_ORGANIZATION
            )
            prompt = PARSING_DATE_PROMPT.format(input=datetime_object)
            function = await llm_models.get_model_generate_content(
                llm_model, 
                query.user_id
            )
            response = function(prompt=prompt, model=query.model)
            return parse_json_string(response)
        except Exception as e:
            raise e

    async def _create_personal_task_result(self, task: dict, query: QueryRequest) -> dict:
        prompt = TASK_RESULT_PROMPT_2.format(task=json.dumps(task))
        function = await llm_models.get_model_generate_content(
            query.model, query.user_id, prompt=prompt
        )
        llm_response = function(
            prompt=prompt,
            model=query.model,
            dto=CreateTaskResponseSchema
        )
        response = json.loads(llm_response)
        created_task: CreateTaskResponseSchema = response
        print("Created task result:", created_task)
        return created_task, response["response"]

    async def list_project_response(self, query: QueryRequest) -> str:
        projects = await self._list_project(query=query, is_async=False)
        prompt = LIST_PROJECT_PROMPT.format(task=json.dumps(projects))
        function = await llm_models.get_model_generate_content(
            query.model, query.user_id, prompt=prompt
        )
        llm_response = function(
            prompt=prompt,
            model=query.model
        )
        return llm_response 
        
    async def _list_project(self, query: QueryRequest, is_async: bool) -> str:
        try:
            redis_key = redis_enum.RedisEnum.USER_PROJECT_LIST.value + f":{query.user_id}"
            redis_project_list = get_key(redis_key)
            if redis_project_list:
                return json.loads(redis_project_list)

            if is_async:
                await publish_message(
                    kafka_enum.KafkaTopic.GET_RECOMMENDATIONS_INFO.value,
                    kafka_enum.KafkaCommand.PROJECT_LIST.value,
                    {"userId": query.user_id}
                ) 
            else:
                return await recommendation_service_client.project_list(query.user_id)
        except Exception as e:
            raise e

    async def list_group_task_response(self, query: QueryRequest) -> str:
        group_tasks = await self._list_group_task(query=query, is_async=False)
        prompt = LIST_GROUP_TASK_PROMPT.format(task=json.dumps(group_tasks))
        function = await llm_models.get_model_generate_content(
            query.model, query.user_id, prompt=prompt
        )
        llm_response = function(
            prompt=prompt,
            model=query.model
        )
        return llm_response

    async def _list_group_task(self, query: QueryRequest, is_async: bool) -> str:
        try:
            redis_key = redis_enum.RedisEnum.USER_GROUP_TASK_LIST.value + f":{query.user_id}"
            redis_group_task_list = get_key(redis_key)
            if redis_group_task_list:
                return json.loads(redis_group_task_list)

            if is_async:
                await publish_message(
                    kafka_enum.KafkaTopic.GET_RECOMMENDATIONS_INFO.value,
                    kafka_enum.KafkaCommand.GROUP_TASK_LIST.value,
                    {"userId": query.user_id}
                )
            else:
                return await recommendation_service_client.group_task_list(query.user_id)
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
function_handler(label=enum.GaiaAbilities.PROJECT_LIST.value, is_sequential=False, is_executable=False)(
    personal_task_service.list_project_response
)
function_handler(label=enum.GaiaAbilities.GROUP_TASK_LIST.value, is_sequential=False, is_executable=False)(
    personal_task_service.list_group_task_response
)
