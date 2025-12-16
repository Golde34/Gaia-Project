from typing import List, Optional

from core.service.integration.tool_service import tool_service
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db


class ToolUsecase:
    @classmethod
    async def add_tool_to_vectordb(cls, tool: str, description: str, sample_queries: List[str]):
        contexts: List[str] = []
        metadata_list: List[dict] = []

        if description:
            contexts.append(f"{tool}: {description}")
            metadata_list.append({
                "tool": tool,
                "description": description,
                "type": "description",
            })

        for query in sample_queries:
            contexts.append(f"{tool} - Sample query: {query}")
            metadata_list.append({
                "tool": tool,
                "description": description,
                "sample_query": query,
                "type": "sample_query",
            })

        if not contexts:
            raise ValueError("No content available to add to vector database")

        embeddings = await embedding_model.get_embeddings(texts=contexts)
        vectors = milvus_validation.validate_milvus_insert(embeddings)

        result = milvus_db.insert_data(
            vectors=vectors,
            contents=contexts,
            metadata_list=metadata_list,
            partition_name="tools",
        )
        return str(result)

    @staticmethod
    def _validate_tool_data(tool: str, description: str) -> None:
        if not tool or not tool.strip():
            raise ValueError("Tool name must not be empty")
        if not description or not description.strip():
            raise ValueError("Tool description must not be empty")

    @classmethod
    async def add_tool(
        cls,
        tool: str,
        description: str,
        *,
        json_schema: Optional[dict] = None,
        sample_queries: Optional[List[str]] = None,
        need_history: bool = False,
        is_active: bool = True,
    ):
        cls._validate_tool_data(tool, description)

        sample_queries = sample_queries or []
        tool_data = await tool_service.add(
            tool=tool,
            description=description,
            json_schema=json_schema,
            sample_queries=sample_queries,
            need_history=need_history,
            is_active=is_active,
        )

        await cls.add_tool_to_vectordb(tool_data.tool, tool_data.description, tool_data.sample_queries)
        return tool_data

    @classmethod
    async def get_tools(
        cls,
        *,
        tool: Optional[str] = None,
        need_history: Optional[bool] = None,
    ):
        return await tool_service.get(tool=tool, need_history=need_history)


tool_usecase = ToolUsecase()
