import asyncio
import copy
import hashlib
import json
from typing import Any, Dict, List, Optional

from core.abilities.function_handlers import FUNCTIONS
from core.domain.request.query_request import QueryRequest
from infrastructure.client.recommendation_service_client import (
    recommendation_service_client,
)
from infrastructure.repository.recommendation_history_repo import (
    recommendation_history_repo,
)


class OrchestratorService:
    """Coordinate ability handlers and recommendation requests."""

    def resolve_tasks(self, guided_route: str) -> List[Dict[str, Any]]:
        """Return ability metadata that matches the guided route."""

        if not guided_route:
            return []

        tasks: List[Dict[str, Any]] = []
        for ability, metadata in FUNCTIONS.items():
            if ability in guided_route:
                tasks.append({
                    "ability": ability,
                    "handler": metadata.get("handler"),
                    "is_sequential": metadata.get("is_sequential", False),
                })
        return tasks

    async def execute(self, query: QueryRequest, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute ability handlers and fetch recommendation messages."""

        if not tasks:
            return {"primary": None, "tasks": [], "recommend": ""}

        results: List[Dict[str, Any]] = []
        sequential_tasks = [task for task in tasks if task.get("is_sequential")]
        parallel_tasks = [task for task in tasks if not task.get("is_sequential")]

        for task in sequential_tasks:
            result = await self._execute_task(task, query)
            results.append(self._build_task_result(task, result))

        recommendation_snapshot = [copy.deepcopy(item) for item in results]
        fingerprint = self._compose_fingerprint(query, recommendation_snapshot)
        recommendation_future: Optional[asyncio.Task[str]] = None
        if await recommendation_history_repo.should_recommend(
            user_id=query.user_id,
            fingerprint=fingerprint,
        ):
            recommendation_future = asyncio.create_task(
                self._call_recommendation(
                    query,
                    recommendation_snapshot,
                    fingerprint,
                )
            )

        if parallel_tasks:
            parallel_futures = [
                asyncio.create_task(self._execute_task(task, query))
                for task in parallel_tasks
            ]
            parallel_results = await asyncio.gather(
                *parallel_futures, return_exceptions=True
            )
            for task, result in zip(parallel_tasks, parallel_results):
                if isinstance(result, Exception):
                    print(
                        f"Orchestrator: task {task.get('ability')} failed: {result}"
                    )
                    continue
                results.append(self._build_task_result(task, result))

        recommend_message = ""
        if recommendation_future:
            recommend_message = await recommendation_future
        primary = results[0] if results else None
        return {"primary": primary, "tasks": results, "recommend": recommend_message}

    async def _execute_task(self, task: Dict[str, Any], query: QueryRequest) -> Any:
        handler = task.get("handler")
        if not handler:
            raise ValueError(f"No handler found for task {task.get('ability')}")
        return await handler(query=query)

    async def _call_recommendation(
        self,
        query: QueryRequest,
        task_results: List[Dict[str, Any]],
        fingerprint: str,
    ) -> str:
        try:
            context = self._compose_recommendation_context(query, task_results)
            recommendation = await recommendation_service_client.recommend(
                query=context,
                user_id=query.user_id,
                dialogue_id=query.dialogue_id,
                fingerprint=fingerprint,
            )
            if recommendation:
                await recommendation_history_repo.register(
                    user_id=query.user_id,
                    fingerprint=fingerprint,
                    recommendation=recommendation,
                )
            return recommendation
        except Exception as exc:
            print(f"Recommendation call failed: {exc}")
            return ""

    def _compose_fingerprint(
        self, query: QueryRequest, task_results: List[Dict[str, Any]]
    ) -> str:
        context = self._compose_recommendation_context(query, task_results)
        digest = hashlib.sha256(context.encode("utf-8")).hexdigest()
        return digest

    def _compose_recommendation_context(
        self, query: QueryRequest, task_results: List[Dict[str, Any]]
    ) -> str:
        if not task_results:
            return query.query

        formatted_results = [
            self._stringify_task_result(result) for result in task_results
        ]
        joined_results = "\n".join(formatted_results)
        return f"{query.query}\n\nTask results:\n{joined_results}"

    def _stringify_task_result(self, task_result: Dict[str, Any]) -> str:
        ability = task_result.get("ability") or task_result.get("type")
        payload = task_result.get("result")
        if isinstance(payload, dict):
            try:
                serialized = json.dumps(payload, ensure_ascii=False)
            except TypeError:
                serialized = str(payload)
        else:
            serialized = str(payload)
        return f"{ability}: {serialized}"

    def _build_task_result(
        self, task: Dict[str, Any], result: Any
    ) -> Dict[str, Any]:
        return {
            "type": task.get("ability"),
            "result": result,
            "is_sequential": task.get("is_sequential", False),
        }

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
