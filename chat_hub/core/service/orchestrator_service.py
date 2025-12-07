import asyncio
import uuid
from typing import Any, Dict, Tuple

from core.abilities.function_handlers import FUNCTIONS
from core.domain.enums.enum import TaskStatus
from core.domain.enums.kafka_enum import KafkaCommand, KafkaTopic
from core.domain.request.query_request import QueryRequest
from infrastructure.client.recommendation_service_client import (
    recommendation_service_client,
)
from infrastructure.kafka.producer import publish_message
from infrastructure.repository.task_status_repo import task_status_repo
from kernel.utils.background_loop import background_loop_pool, log_background_task_error
from kernel.utils.sse_connection_registry import broadcast_to_user


class OrchestratorService:
    """Coordinate ability handlers and dispatch parallel tasks."""

    def resolve_tasks(self, guided_route: str) -> Dict[str, Any]:
        """Return ability metadata that matches the guided route."""

        if not guided_route:
            return None

        return {
            "ability": guided_route,
            "handler": FUNCTIONS.get(guided_route, {}).get("handler"),
            "is_sequential": FUNCTIONS.get(guided_route, {}).get("is_sequential", False),
        }

    async def execute(self, query: QueryRequest, task: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatch only parallel tasks and mark them as pending."""

        if not task:
            return {"primary": None, "task": [], "recommend": ""}

        if task.get("is_sequential"):
            completed, recommendation = await self._run_sequential_flow(task, query)
            return {"primary": completed, "task": [completed], "recommend": recommendation}

        pending_task, recommendation = await self._run_parallel_flow(task, query)
        return {"primary": pending_task, "task": [pending_task], "recommend": recommendation}

    async def _run_sequential_flow(
        self, task: Dict[str, Any], query: QueryRequest
    ) -> Tuple[Dict[str, Any], str]:
        result = await self._run_sequential_task(task, query)
        # If result status is PENDING, return response
        # If result statis is SUCCESS or FAILED, fetch recommendation and deliver notifications
        # recommendation = await self._fetch_recommendation(query)
        # await self._deliver_sequential_notifications(query, result, recommendation)
        return result

    async def _run_sequential_task(
        self, task: Dict[str, Any], query: QueryRequest
    ) -> Dict[str, Any]:
        handler = task.get("handler")
        result: Any

        try:
            if not handler:
                raise ValueError(
                    f"No handler found for task {task.get('ability')}")
            result = await handler(query=query)
        except Exception as exc:
            result = {"response": str(exc)}

        normalized = result if isinstance(result, dict) else {
            "response": str(result)}
        return {
            "type": task.get("ability"),
            "result": normalized,
            "is_sequential": True,
        }

    async def _fetch_recommendation(self, query: QueryRequest) -> str:
        return await recommendation_service_client.recommend(
            query=query.query,
            user_id=query.user_id,
            dialogue_id=query.dialogue_id,
        )

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
    ) -> Tuple[Dict[str, Any], str]:
        pending_task, recommendation = await asyncio.gather(
            self._dispatch_parallel_task(task, query),
            self._fetch_recommendation(query),
        )
        return pending_task, recommendation

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


orchestrator_service = OrchestratorService()
