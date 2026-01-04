import asyncio
import uuid
from typing import Any, Dict, List, Tuple


from core.domain.entities.database.recommendation_history import RecommendationHistory
from core.domain.enums.enum import TaskStatus, ChatType
from core.domain.enums.kafka_enum import KafkaCommand, KafkaTopic
from core.domain.request.query_request import QueryRequest
from core.service.abilities import chitchat
from core.service.abilities.function_handlers import FUNCTIONS
from core.service.chat_service import push_and_save_bot_message
from core.service.integration.recommendation_history_service import recommendation_history_service
from core.usecase.llm_router.chat_routers import llm_route
from infrastructure.client.recommendation_service_client import recommendation_service_client
from infrastructure.kafka.producer import publish_message
from infrastructure.repository.agent_execution_repository import agent_execution_repo
from kernel.utils.background_loop import background_loop_pool, log_background_task_error


@llm_route(label=ChatType.ABILITIES.value,
           description='Gaia\'s abilities.')
async def orchestrate(query: QueryRequest, guided_route: str) -> str:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        response (any): The response content to determine service type.
    Returns:
        str: The response from the appropriate service handler.
    """
    print("Abilities Handler called with query:", query)
    try:
        task = orchestrator_service.resolve_tasks(guided_route)
        print("Resolved task:", task)
        if not task:
            return await chitchat.chitchat_with_history(query)

        return await orchestrator_service.execute(query=query, task=task)

    except Exception as e:
        raise e


class OrchestratorService:
    """Coordinate ability handlers and dispatch gaia task."""

    def resolve_tasks(self, guided_route: str) -> Dict[str, Any]:
        if not guided_route:
            return None

        return {
            "ability": guided_route,
            "executor": FUNCTIONS.get(guided_route, {}).get("executor"),
            "is_sequential": FUNCTIONS.get(guided_route, {}).get("is_sequential", False),
        }

    async def execute(
        self,
        query: QueryRequest,
        task: Dict[str, Any]
    ) -> Dict[str, Any]:
        if task.get("is_sequential"):
            return await self._run_sequential_flow(task, query)
            
        # pending_task, recommendation, recommend_handled = await self._run_parallel_flow(
        #     task, query
        # )
        # return {
        #     "type": task.get("ability"),
        #     "response": pending_task,
        #     "recommend": recommendation,
        #     "recommend_handled": recommend_handled,
        # }

    async def _run_sequential_flow(
        self,
        task: Dict[str, Any],
        query: QueryRequest
    ) -> str:
        result = await task.get("executor")(query=query)
        response = result[0]
        status: str = result[1]
        is_need_recommendation: bool = result[2]

        if is_need_recommendation and status == TaskStatus.SUCCESS.value:
            waiting_recommendations = await self._validate_recommendation_history(query)
            recommendation = await self._handle_recommendation(query, waiting_recommendations)
            response = {
                "response": response,
                "recommendation": recommendation
            }

        return response

    async def _validate_recommendation_history(self, query: QueryRequest):
        waiting_recommendations = await recommendation_history_service.find_waiting_recommendations(
            user_id=query.user_id,
            tool=query.type
        )
        return waiting_recommendations if waiting_recommendations else None


    async def _handle_recommendation(self, query: QueryRequest, waiting_recommendations: List[RecommendationHistory]) -> str:
        recommendation = await recommendation_service_client.recommend(
            query=query.query,
            user_id=query.user_id,
            dialogue_id=query.dialogue_id,
            waiting_recommendations=waiting_recommendations
        ) 

        await push_and_save_bot_message(
            message=recommendation,
            query=query
        )

        return recommendation

    async def _run_parallel_flow(
        self, task: Dict[str, Any], query: QueryRequest
    ) -> Tuple[Dict[str, Any], str, bool]:
        pending_task, recommendation = await asyncio.gather(
            self._dispatch_parallel_task(task, query),
        )
        return pending_task, recommendation, False

    async def _dispatch_parallel_task(
        self, task: Dict[str, Any], query: QueryRequest
    ) -> Dict[str, Any]:
        task_id = uuid.uuid4().hex
        pending_record = {
            "task_id": task_id,
            "user_id": query.user_id,
            "ability": task.get("ability"),
            "query": query.query,
            "dialogue_id": query.dialogue_id,
            "status": TaskStatus.PENDING.value,
        }
        # agent_execution_repo.save_task(query.user_id, task_id, pending_record)

        background_loop_pool.schedule(
            lambda: self._run_parallel_task(task, query, pending_record),
            callback=log_background_task_error,
        )

        return {
            "type": task.get("ability"),
            "result": {
                "taskId": task_id,
                "status": TaskStatus.PENDING.value,
                "response": "",
                "query": query.query,
            },
            "is_sequential": False,
        }

    async def _run_parallel_task(
        self, task: Dict[str, Any], query: QueryRequest, pending_record: Dict[str, Any]
    ) -> None:
        executor = task.get("executor")
        status = TaskStatus.SUCCESS
        result: Any

        try:
            if not executor:
                raise ValueError(
                    f"No handler found for task {task.get('ability')}")
            result = await executor(query=query)
        except Exception as exc:
            status = TaskStatus.FAILED
            result = {"response": str(exc)}

        await self._publish_task_result(pending_record, result, status)

    async def _publish_task_result(
        self, pending_record: Dict[str, Any], result: Any, status: TaskStatus
    ) -> None:
        normalized_result = result if isinstance(result, dict) else {
            "response": str(result)}
        agent_execution_repo.update_status(
            pending_record.get("user_id"),
            pending_record.get("task_id"),
            status.value,
            normalized_result,
        )

        payload = {
            "taskId": pending_record.get("task_id"),
            "userId": pending_record.get("user_id"),
            "ability": pending_record.get("ability"),
            "query": pending_record.get("query"),
            "status": status.value,
            "result": normalized_result,
        }

        try:
            await publish_message(
                KafkaTopic.ABILITY_TASK_RESULT.value,
                KafkaCommand.ABILITIES_TASK_RESULT.value,
                payload,
            )
        except Exception as exc:
            print(f"Failed to publish task result: {exc}")


orchestrator_service = OrchestratorService()
