import asyncio
from typing import Any, Dict


from core.domain.enums.enum import TaskStatus, ChatType
from core.domain.request.query_request import QueryRequest
from core.service.abilities import chitchat
from core.service.abilities.function_handlers import FUNCTIONS
from core.service.chat_service import push_and_save_bot_message
from core.service.integration.recommendation_history_service import recommendation_history_service
from core.usecase.llm_router.chat_routers import llm_route
from infrastructure.client.recommendation_service_client import recommendation_service_client
from kernel.utils.background_loop import background_loop_pool, log_background_task_error


@llm_route(label=ChatType.ABILITIES.value,
           description='Gaia\'s abilities.')
async def orchestrate(query: QueryRequest, guided_route: str) -> str:
    """
    Handle the service request based on the query type dynamically.
    Args:
        query (QueryRequest): The user's query containing task information.
        guided_route (any): The response content to determine service type.
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

        return await self._run_parallel_flow(task, query)
        
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
            recommendation = await self._handle_recommendation(query)
            response = {
                "response": response,
                "recommendation": recommendation
            }

        return response

    async def _handle_recommendation(self, query: QueryRequest) -> str:
        waiting_recommendations = await recommendation_history_service.pre_handle_recommendations(
                user_id=query.user_id,
                tool=query.type
            )
        waiting_recommendation_tools = [rec.tool for rec in waiting_recommendations] if waiting_recommendations else []

        recommendation_response = await recommendation_service_client.recommend(
            query=query.query,
            user_id=query.user_id,
            dialogue_id=query.dialogue_id,
            waiting_recommendations=waiting_recommendation_tools
        )
        message = recommendation_response.get("message", "")
        await recommendation_history_service.update_waiting_recommendations(
            query=query,
            recommendations_response=recommendation_response
        )

        await push_and_save_bot_message(
            message=message,
            query=query
        )

        return recommendation_response

    async def _run_parallel_flow(
        self, task: Dict[str, Any], query: QueryRequest
    ) -> str:
        """User's task and recommendation are processed at the same time.

        Args:
            task (Dict[str, Any]): _description_
            query (QueryRequest): _description_

        Returns:
            str: _description_
        """
        user_task = background_loop_pool.schedule(
            task.get("executor")(query=query),
            log_exception=True,
            exception_callback=log_background_task_error
        )
        
        recommendation_task = background_loop_pool.schedule(
            self._handle_recommendation(query),
            log_exception=True,
            exception_callback=log_background_task_error
        )
        
        await asyncio.gather(
            asyncio.wrap_future(user_task),
            asyncio.wrap_future(recommendation_task)
        )
        
        user_response = user_task.result()
        recommendation_response = recommendation_task.result()
        
        return {
            "response": user_response,
            "recommendation": recommendation_response
        } 

orchestrator_service = OrchestratorService()
