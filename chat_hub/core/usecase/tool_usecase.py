from typing import List, Optional

from core.service.integration.tool_service import tool_service
from core.validation import milvus_validation
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db


class ToolUsecase:
    """
    Usecase class for managing tool operations including persistence and vector database indexing.
    
    This class handles:
    - Tool validation and database persistence
    - Vector database indexing for semantic search
    - Tool retrieval with optional filtering
    """

    @classmethod
    async def add_tool_to_vectordb(cls, tool: str, description: str, sample_queries: List[str]):
        """
        Add a tool to the vector database for semantic search capabilities.
        
        Creates embeddings from the tool's description and sample queries, then stores
        them in the vector database for similarity-based retrieval.
        
        Args:
            tool: The name of the tool
            description: Tool description for context
            sample_queries: List of sample queries demonstrating tool usage
            
        Returns:
            str: Result of the vector database insertion
            
        Raises:
            ValueError: If both description and sample_queries are empty
            ValueError: If tool name or description is invalid
        """
        cls._validate_tool_data(tool, description)
        
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

    @staticmethod
    def _validate_tool_data(tool: str, description: str) -> None:
        """
        Validate tool name and description are not empty.
        
        Args:
            tool: Tool name to validate
            description: Tool description to validate
            
        Raises:
            ValueError: If tool name or description is empty or contains only whitespace
        """
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
        """
        Add a new tool with database persistence and vector indexing.
        
        This method performs two operations:
        1. Persists the tool to the database
        2. Indexes the tool in the vector database for semantic search
        
        Note: These operations are not atomic. If vector database insertion fails,
        the tool will exist in the database but won't be searchable via vector similarity.
        
        Args:
            tool: Unique name for the tool
            description: Detailed description of the tool's functionality
            json_schema: Optional JSON schema defining tool parameters
            sample_queries: Optional list of example queries for the tool
            need_history: Whether the tool requires conversation history
            is_active: Whether the tool is active and available
            
        Returns:
            Tool: The created tool entity with all metadata
            
        Raises:
            ValueError: If tool name or description is invalid
        """
        cls._validate_tool_data(tool, description)

        sample_queries = sample_queries or []
        return await tool_service.add(
            tool=tool,
            description=description,
            json_schema=json_schema,
            sample_queries=sample_queries,
            need_history=need_history,
            is_active=is_active,
        )

    @classmethod
    async def get_tools(
        cls,
        *,
        tool: Optional[str] = None,
        need_history: Optional[bool] = None,
    ):
        """
        Retrieve tools with optional filtering.
        
        Args:
            tool: Optional tool name to filter by
            need_history: Optional flag to filter by history requirement
            
        Returns:
            List[Tool]: List of tools matching the filter criteria
        """
        return await tool_service.get(tool=tool, need_history=need_history)


tool_usecase = ToolUsecase()
