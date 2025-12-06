import uuid
from typing import Any, Dict, List

from core.abilities.function_handlers import FUNCTIONS
from core.domain.enums.enum import TaskStatus
from core.domain.enums.kafka_enum import KafkaTopic
from core.domain.request.query_request import QueryRequest
from infrastructure.kafka.producer import publish_message
from infrastructure.repository.task_status_repo import task_status_repo
from kernel.utils.background_loop import background_loop_pool, log_background_task_error


class OrchestratorService:
    """Coordinate ability handlers and dispatch parallel tasks."""

    def resolve_tasks(self, guided_route: str) -> List[Dict[str, Any]]:
        """Return ability metadata that matches the guided route."""

        if not guided_route:
            return []

        tasks: List[Dict[str, Any]] = []
        for ability, metadata in FUNCTIONS.items():
            if ability in guided_route:
                tasks.append(
                    {
                        "ability": ability,
                        "handler": metadata.get("handler"),
                        "is_sequential": metadata.get("is_sequential", False),
                    }
                )
        return tasks

    async def execute(self, query: QueryRequest, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Dispatch only parallel tasks and mark them as pending."""

        if not tasks:
            return {"primary": None, "tasks": [], "recommend": ""}

        results: List[Dict[str, Any]] = []

        for task in tasks:
            if task.get("is_sequential"):
                print("Sequential tasks are not handled in the parallel dispatcher yet.")
                continue

            pending_result = await self._dispatch_parallel_task(task, query)
            results.append(pending_result)

        primary = results[0] if results else None
        return {"primary": primary, "tasks": results, "recommend": ""}

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

    async def _run_parallel_task(
        self, task: Dict[str, Any], query: QueryRequest, pending_record: Dict[str, Any]
    ) -> None:
        handler = task.get("handler")
        status = TaskStatus.SUCCESS
        result: Any

        try:
            if not handler:
                raise ValueError(f"No handler found for task {task.get('ability')}")
            result = await handler(query=query)
        except Exception as exc:
            status = TaskStatus.FAILED
            result = {"response": str(exc)}

        await self._publish_task_result(pending_record, result, status)

    async def _publish_task_result(
        self, pending_record: Dict[str, Any], result: Any, status: TaskStatus
    ) -> None:
        normalized_result = result if isinstance(result, dict) else {"response": str(result)}
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
                pending_record.get("ability") or "",
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


orchestrator_service = OrchestratorService()
