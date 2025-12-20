from typing import List, Optional

from core.domain.request.tool_request import ToolRequest, ToolVectorRequest
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
        
        contexts: List[str] = []
        metadata_list: List[dict] = []

        if tool_request.description:
            contexts.append(f"{tool_request.tool}: {tool_request.description}")
            metadata_list.append({
                "tool": tool_request.tool,
                "description": tool_request.description,
                "type": "description",
            })

        for query in tool_request.sample_queries:
            contexts.append(f"{tool_request.tool} - Sample query: {query}")
            metadata_list.append({
                "tool": tool_request.tool,
                "description": tool_request.description,
                "sample_query": query,
                "type": "sample_query",
            })

        if not contexts:
            raise ValueError(
                "Cannot add tool to vector database: both description and sample_queries are empty. "
                "At least one must be provided."
            )

        embeddings = await embedding_model.get_embeddings(texts=contexts)
        vectors = milvus_validation.validate_milvus_insert(embeddings)

        result = milvus_db.insert_data(
            vectors=vectors,
            contents=contexts,
            metadata_list=metadata_list,
            partition_name="tools",
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
