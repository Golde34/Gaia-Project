from typing import List, Optional

from core.domain.request.tool_request import ToolRequest, ToolVectorRequest
from core.domain.entities.vectordb.tool import tool_vector_entity
from core.service.integration.tool_service import tool_service
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db


class ToolUsecase:

    @classmethod
    async def add_tool(cls, tool_request: ToolRequest):
        cls._validate_tool_data(tool_request.tool, tool_request.description)

        added_tool = await tool_service.add(
            tool=tool_request.tool,
            description=tool_request.description,
            json_schema=tool_request.json_schema,
            need_history=tool_request.need_history,
            is_active=tool_request.is_active,
        )

        sample_queries = await tool_service.generate_sample_queries(tool_request)

        return {
            "sample_queries_suggestion": sample_queries,
            "tool": added_tool,
        }

    @staticmethod
    def _validate_tool_data(tool: str, description: str) -> None:
        if not tool or not tool.strip():
            raise ValueError("Tool name must not be empty")
        if not description or not description.strip():
            raise ValueError("Tool description must not be empty")

    @classmethod
    async def add_tool_to_vectordb(cls, tool_request: ToolVectorRequest):
        cls._validate_tool_data(tool_request.tool, tool_request.description)
        
        embeddings = await embedding_model.get_embeddings(texts=tool_request.sample_queries)
        vectors = milvus_validation.validate_milvus_insert(embeddings)

        result = tool_vector_entity.insert_data(
            vectors=vectors,
            tool=tool_request.tool,
            description=tool_request.description,
            sample_queries=tool_request.sample_queries,
        )
        return str(result)

    @classmethod
    async def get_tools(
        cls,
        *,
        tool: Optional[str] = None,
        need_history: Optional[bool] = None,
    ):
        return await tool_service.get(tool=tool, need_history=need_history)

tool_usecase = ToolUsecase()
