from typing import List, Optional

from core.domain.entities.database.tool import Tool
from kernel.database.base import BaseRepository


class ToolRepository(BaseRepository[Tool]):
    def __init__(self):
        super().__init__(
            table_name="tools",
            model_cls=Tool,
            pk="tool",
            default_order_by="created_at DESC",
        )

    async def create_tool(self, tool: Tool) -> Tool:
        result = await self.insert(
            tool,
            returning=(
                "tool",
                "description",
                "json_schema",
                "sample_queries",
                "need_history",
                "is_active",
                "created_at",
                "updated_at",
            ),
            auto_timestamps=True,
        )
        return Tool(**result)

    async def get_tools(
        self,
        tool_name: Optional[str] = None,
        need_history: Optional[bool] = None,
    ) -> List[Tool]:
        where = {}
        if tool_name:
            where["tool"] = tool_name
        if need_history is not None:
            where["need_history"] = need_history

        return await self.list(
            where=where or None,
            order_by=self.default_order_by,
            to_models=True,
        )
    
    async def update_sample_queries(
        self,
        tool_id: str,
        sample_queries: List[str],
    ) -> Tool:
        result = await self.update(
            where={"tool": tool_id},
            updates={"sample_queries": sample_queries},
            returning=(
                "tool",
                "description",
                "json_schema",
                "sample_queries",
                "need_history",
                "is_active",
                "created_at",
                "updated_at",
            ),
            auto_timestamps=True,
        )
        return Tool(**result) 

    async def query_tool_by_name(self, tool_name: str) -> List[Tool]:
        results = await self.list(
            where={"tool": tool_name},
            to_models=True,
        )
        return results

tool_repository = ToolRepository()
