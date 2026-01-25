from typing import Optional

from core.domain.entities.database.agent_execution import AgentExecution
from kernel.database.base import BaseRepository


class AgentExecutionRepository(BaseRepository[AgentExecution]):
    def __init__(self):
        super().__init__(
            table_name="agent_executions",
            model_cls=AgentExecution,
            pk="id",
            default_order_by="created_at DESC",
        )

    async def create_agent_execution(self, agent_execution: AgentExecution) -> AgentExecution:
        """
        INSERT and return the full entity (with generated/returned id).
        """
        ret = await self.insert(
            agent_execution,
            returning=("id", "user_id", "message_id", "selected_tool_id", "user_query",
                       "confidence_score", "tool_input", "tool_output", "status"),
            auto_timestamps=True,
        )
        return AgentExecution(**ret)

    async def get_agent_execution_by_id(self, user_id: int, execution_id: str) -> Optional[AgentExecution]:
        rows = await self.list(
            where={"user_id": user_id, "id": execution_id},
            to_models=True,
            limit=1,
        )
        return rows[0] if rows else None

    async def update_agent_execution_status(
        self,
        execution_id: str,
        status: str,
        tool_output: Optional[str] = None,
    ) -> None:
        try:
            update_data = {"status": status}
            if tool_output is not None:
                update_data["tool_output"] = tool_output

            await self.update_by_id(
                execution_id,
                update_data,
                returning=("id", "user_id", "message_id", "selected_tool_id", "user_query",
                        "confidence_score", "tool_input", "tool_output", "status"),
            )

        except Exception as e:
            print("Error updating agent execution status:", e)
            return None



agent_execution_repo = AgentExecutionRepository()
