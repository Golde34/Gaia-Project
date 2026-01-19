from typing import Any, Optional

from core.domain.enums.enum import ChatType, MemoryModel, MessageType
from core.domain.request.query_request import QueryRequest
from core.service.graph_memory_model.consolidation import ConsolidationLayer
from core.service.graph_memory_model.context_builder import ContextBuilder
from core.service.graph_memory_model.episodic_memory_graph import EMG
from core.service.graph_memory_model.memory_store import MemoryStore
from core.service.graph_memory_model.semantic_long_term_graph import SLTG
from core.service.graph_memory_model.short_term_activation_graph import STAG
from core.service.graph_memory_model.switching_engine import SwitchingEngine
from core.service import memory_service
from core.usecase.llm_router import chat_routers, tool_selection


class ChatUsecase:

    @classmethod
    async def chat(
        cls,
        query: QueryRequest,
        chat_type: Optional[str] = None,
        **kwargs: Any,
    ):
        """
        Gaia categorizes the chat flow based on the user's query.
        It retrieves the chat history and generates a categorized response.

        Args:
            query (QueryRequest): The user's query containing user_id, dialogue_id, and model_name
            chat_type (str, optional): Chat type override; defaults to abilities.
            **kwargs: Additional optional arguments for downstream handlers.
        Returns:
            dict: The categorized response from Gaia.
        """
        memory_model = query.model.memory_model
        if memory_model is None:
            memory_model = MemoryModel.DEFAULT.value
        effective_chat_type = chat_type or kwargs.get("chat_type") or ChatType.ABILITIES.value

        if memory_model == MemoryModel.DEFAULT.value:
            return await cls.chat_with_normal_flow(query=query, chat_type=effective_chat_type, **kwargs)
        if memory_model == MemoryModel.GRAPH.value:
            return await cls.chat_with_graph_flow(query=query, chat_type=effective_chat_type, **kwargs)

        raise ValueError(f"Unsupported user_config: {memory_model}")

    @classmethod
    async def chat_with_normal_flow(cls, query: QueryRequest, chat_type: str, default=True, **kwargs: Any):
        """
        Gaia selects the appropriate ability based on the chat type and query.
        It retrieves the chat history, generates a new query based on the context,
        and calls the appropriate router function to handle the request.

        Args:
            query (QueryRequest): The user's query containing user_id, dialogue_id, and model_name
            chat_type (str): The type of chat to handle, e.g., abilities, introduction, etc.
            default (bool): Whether to use the default semantic response or a custom one.
            **kwargs: Additional optional arguments (e.g., user_message_id) for downstream handlers.
        Returns:
            dict: The response from the selected ability handler.

        """
        try:
            is_change_title = kwargs.get("is_change_title", False)
            user_message_id = kwargs.get("user_message_id")
            if user_message_id is not None:
                query.user_message_id = str(user_message_id)

            query = await memory_service.recall_history_info(query=query, default=default)

            print(f"Chat Type: {chat_type}, Query: {query.query}")
            tool = await tool_selection.select_tool_by_router(
                label_value=chat_type, 
                query=query
            )
            print(f"Selected tool: {tool}")

            responses = await chat_routers.call_router_function(
                label_value=chat_type, 
                query=query, 
                guided_route=tool)
            print(f"Response(s): {responses}")

            await memory_service.memorize_info(query=query, is_change_title=is_change_title)

            return MessageType.SUCCESS_MESSAGE
        except Exception as e:
            print(f"Error in chat_with_normal_flow: {e}")
            return MessageType.FAILURE_MESSAGE

    @classmethod
    async def chat_with_graph_flow(cls, query: QueryRequest, chat_type: str, **kwargs: Any):
        """
        Gaia handles chat interactions using a graph-based approach.
        It retrieves the chat history, generates a new query based on the context,
        and processes the request using graph-based methods.

        Args:
            query (QueryRequest): The user's query containing user_id, dialogue_id, and model_name
            chat_type (str): The type of chat to handle, e.g., abilities, introduction, etc.
            **kwargs: Additional optional arguments for downstream handlers.
        Returns:
            dict: The response from the graph-based handler.

        """
        switching_engine = SwitchingEngine().switch(query)
        stag = STAG(query).build_temporary_graph()
        sltg = SLTG(query).build_long_term_graph()
        emg = EMG(query).build_episodic_memory_graph()
        retrieval_memory = MemoryStore(query, stag, sltg, emg).get_memory()
        consolidation = ConsolidationLayer(query, retrieval_memory).consolidate()
        response = await ContextBuilder(query, consolidation).generate_response()
        return response
