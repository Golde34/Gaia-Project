import asyncio
import uuid
from typing import Any, Dict, Tuple


from core.domain.enums.enum import SenderTypeEnum, TaskStatus, ChatType, GaiaAbilities
from core.domain.enums.kafka_enum import KafkaCommand, KafkaTopic
from core.domain.request.query_request import QueryRequest
from core.service.abilities import chitchat
from core.service.integration.dialogue_service import dialogue_service
from core.service.integration.message_service import message_service
from core.service.integration.task_service import handle_task_service_response
from core.usecase.llm_router.ability_routers import llm_route
from core.usecase.llm_router.function_handlers import FUNCTIONS
from infrastructure.client.recommendation_service_client import recommendation_service_client
from infrastructure.kafka.producer import publish_message
from infrastructure.repository.task_status_repo import task_status_repo
from kernel.utils.background_loop import background_loop_pool, log_background_task_error
from kernel.utils.sse_connection_registry import broadcast_to_user


@llm_route(label=ChatType.ABILITIES.value, 
           description='Gaia\'s abilities.')
async def orchestrate(query: QueryRequest, guided_route: str) -> list[str]:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        response (any): The response content to determine service type.
    Returns:
        list[str]: The response from the appropriate service handler.
    """
    print("Abilities Handler called with query:", query)
    try:
        task = orchestrator_service.resolve_tasks(guided_route)
        if not task:
            return await chitchat.chitchat_with_history(query)

        orchestration_result = await orchestrator_service.execute(query=query, task=task)
        type = orchestration_result.get("type")
        if not type:
            return handle_task_service_response(GaiaAbilities.CHITCHAT.value, "")
        
        responses = chitchat.extract_task_response(orchestration_result)
        
        print(f"Orchestration result type: {type}, response: {responses}") 
        return responses, orchestration_result.get("operationStatus", TaskStatus.SUCCESS.value)
    except Exception as e:
        raise e


class OrchestratorService:
    """Coordinate ability handlers and dispatch gaia task."""

    def resolve_tasks(self, guided_route: str) -> Dict[str, Any]:
        if not guided_route:
            return None

        return {
            "ability": guided_route,
            "handler": FUNCTIONS.get(guided_route, {}).get("handler"),
            "is_sequential": FUNCTIONS.get(guided_route, {}).get("is_sequential", False),
        }

    async def execute(
        self,
        query: QueryRequest,
        task: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not task:
            return {"primary": None, "task": [], "recommend": ""}

        if task.get("is_sequential"):
            response, recommendation, recommend_handled = await self._run_sequential_flow(task, query)
            return {
                "type": task.get("ability"),
                "response": response,
                "recommendation": recommendation,
                "recommend_handled": recommend_handled,
            }

        pending_task, recommendation, recommend_handled = await self._run_parallel_flow(
            task, query
        )
        return {
            "type": task.get("ability"),
            "response": pending_task,
            "recommend": recommendation,
            "recommend_handled": recommend_handled,
        }

    async def _run_sequential_flow(
        self,
        task: Dict[str, Any],
        query: QueryRequest
    ) -> Tuple[Dict[str, Any], str, bool]:
        response, status_value = await task.get("handler")(query=query)
        status = self._normalize_status(status_value)

        if status == TaskStatus.PENDING:
            await self._persist_pending_command(task, query, response)
            return response, "", False

        recommendation = await self._handle_recommendation(query)

        # stored_task = await task_status_repo.save_task(
        #     user_id=query.user_id,
        #     payload=response,
        #     task_type=task.get("ability")
        # )
        # print("Stored task: ", stored_task)
        return response, recommendation, True

    def _normalize_status(self, status_value: Any) -> TaskStatus:
        if isinstance(status_value, TaskStatus):
            return status_value

        status_text = str(status_value).upper()
        if status_text in TaskStatus._value2member_map_:
            return TaskStatus(status_text)
        return TaskStatus.FAILED

    async def _fetch_recommendation(self, query: QueryRequest) -> str:
        return await recommendation_service_client.recommend(
            query=query.query,
            user_id=query.user_id,
            dialogue_id=query.dialogue_id,
        )

    async def _handle_recommendation(self, query: QueryRequest) -> str:
        recommendation = await self._fetch_recommendation(query)
        if not recommendation:
            return ""

        await self._persist_recommendation_message(query, recommendation)
        await self._broadcast_recommendation(query, recommendation)
        return recommendation

    async def _deliver_sequential_notifications(
        self, query: QueryRequest, result: Dict[str, Any], recommendation: str
    ) -> None:
        """Notify client GUI about sequential responses via SSE or Kafka."""

        user_id = query.user_id
        dialogue_id = query.dialogue_id

        if user_id is None:
            return

        formatted_response = self.format_task_payload(result)
        response_text = formatted_response.get("response", "")

        await broadcast_to_user(
            str(user_id),
            "sequential_response",
            {
                "response": response_text,
                "type": formatted_response.get("type"),
                "dialogueId": dialogue_id,
                "isSequential": True,
            },
        )

        await broadcast_to_user(
            str(user_id),
            "sequential_recommendation",
            {
                "recommend": recommendation,
                "dialogueId": dialogue_id,
                "isSequential": True,
            },
        )

        try:
            await publish_message(
                KafkaTopic.PUSH_MESSAGE.value,
                "sequentialResponse",
                {
                    "userId": user_id,
                    "dialogueId": dialogue_id,
                    "response": response_text,
                    "type": formatted_response.get("type"),
                    "isSequential": True,
                },
            )

            await publish_message(
                KafkaTopic.PUSH_MESSAGE.value,
                "sequentialRecommendation",
                {
                    "userId": user_id,
                    "dialogueId": dialogue_id,
                    "recommend": recommendation,
                    "isSequential": True,
                },
            )
        except Exception as exc:
            print(f"Failed to push sequential messages: {exc}")

    async def _persist_recommendation_message(
        self, query: QueryRequest, recommend_message: str
    ) -> None:
        if not recommend_message:
            return
        if not query.dialogue_id or not query.user_message_id:
            return

        dialogue, _ = await dialogue_service.get_dialogue_by_id(
            user_id=query.user_id, dialogue_id=query.dialogue_id
        )
        if not dialogue:
            return

        await message_service.create_message(
            dialogue=dialogue,
            user_id=query.user_id,
            message=recommend_message,
            message_type=query.type,
            sender_type=SenderTypeEnum.BOT.value,
            user_message_id=query.user_message_id,
        )

    async def _broadcast_recommendation(
        self, query: QueryRequest, recommend_message: str
    ) -> None:
        if not recommend_message:
            return
        await broadcast_to_user(
            str(query.user_id),
            "sequential_recommendation",
            {
                "recommend": recommend_message,
                "dialogueId": query.dialogue_id,
                "isSequential": True,
            },
        )

    async def _run_parallel_task(
        self, task: Dict[str, Any], query: QueryRequest, pending_record: Dict[str, Any]
    ) -> None:
        handler = task.get("handler")
        status = TaskStatus.SUCCESS
        result: Any

        try:
            if not handler:
                raise ValueError(
                    f"No handler found for task {task.get('ability')}")
            result = await handler(query=query)
        except Exception as exc:
            status = TaskStatus.FAILED
            result = {"response": str(exc)}

        await self._publish_task_result(pending_record, result, status)

    async def _publish_task_result(
        self, pending_record: Dict[str, Any], result: Any, status: TaskStatus
    ) -> None:
        normalized_result = result if isinstance(result, dict) else {
            "response": str(result)}
        task_status_repo.update_status(
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

    def format_task_payload(self, task_result: Dict[str, Any]) -> Dict[str, Any]:
        payload = task_result.get("result")
        if isinstance(payload, dict):
            response_text = payload.get("response", "")
        else:
            response_text = str(payload)

        return {
            "type": task_result.get("type"),
            "isSequential": task_result.get("is_sequential", False),
            "response": response_text,
            "data": payload,
        }

    async def _run_parallel_flow(
        self, task: Dict[str, Any], query: QueryRequest
    ) -> Tuple[Dict[str, Any], str, bool]:
        pending_task, recommendation = await asyncio.gather(
            self._dispatch_parallel_task(task, query),
            self._fetch_recommendation(query),
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
        task_status_repo.save_task(query.user_id, task_id, pending_record)

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

    async def _persist_pending_command(
        self, task: Dict[str, Any], query: QueryRequest, result: Dict[str, Any]
    ) -> None:
        result_payload = result.get("result") or {}
        task_id = result_payload.get("taskId") or uuid.uuid4().hex
        pending_record = {
            "task_id": task_id,
            "user_id": query.user_id,
            "ability": task.get("ability"),
            "query": query.query,
            "dialogue_id": query.dialogue_id,
            "status": TaskStatus.PENDING.value,
            "result": result_payload,
        }
        task_status_repo.save_task(query.user_id, task_id, pending_record)
        await self._persist_pending_message(query, result)

    async def _persist_pending_message(
        self, query: QueryRequest, task_result: Dict[str, Any]
    ) -> None:
        if not query.dialogue_id or not query.user_message_id:
            return

        dialogue, _ = await dialogue_service.get_dialogue_by_id(
            user_id=query.user_id, dialogue_id=query.dialogue_id
        )
        if not dialogue:
            return

        formatted = self.format_task_payload(task_result)
        response_text = formatted.get("response")
        if not response_text:
            return

        await message_service.create_message(
            dialogue=dialogue,
            user_id=query.user_id,
            message=response_text,
            message_type=query.type,
            sender_type=SenderTypeEnum.BOT.value,
            user_message_id=query.user_message_id,
        )


orchestrator_service = OrchestratorService()
