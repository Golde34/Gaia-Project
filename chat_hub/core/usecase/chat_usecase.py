from typing import Any, Optional

from core.domain.enums.enum import ChatType, MemoryModel, MessageType
from core.domain.enums.graph_memory_enum import GraphRoutingDecision
from core.domain.request.query_request import QueryRequest
from core.service import memory_service
from core.graph_memory import GraphMemory
from core.graph_memory.switching_engine import SwitchingEngine
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
        """
        try:
            is_change_title = kwargs.get("is_change_title", False)
            user_message_id = kwargs.get("user_message_id")
            if user_message_id is not None:
                query.user_message_id = str(user_message_id)

            recalled_memory = await memory_service.recall_history_info(query=query, default=default)

            print(f"Chat Type: {chat_type}, Query: {query.query}")
            tool = await tool_selection.select_tool_by_router(
                label_value=chat_type, 
                recalled_memory=recalled_memory
            )
            print(f"Selected tool: {tool}")

            query.query = recalled_memory.reflected_query
            responses = await chat_routers.call_router_function(
                label_value=chat_type, 
                query=query, 
                guided_route=tool)
            print(f"Response(s): {responses}")

            await memory_service.memorize(query=query, is_change_title=is_change_title)

            return MessageType.SUCCESS_MESSAGE
        except Exception as e:
            print(f"Error in chat_with_normal_flow: {e}")
            return MessageType.FAILURE_MESSAGE

    @classmethod
    async def chat_with_graph_flow(cls, query: QueryRequest, chat_type: str, **kwargs: Any):
        """
        Gaia handles chat interactions using a graph-based approach.
        It retrieves the chat history, generates a new query based on the context,
        and processes the request using graph-based methods
        """
        engine, extracted_info = await SwitchingEngine(query=query).choose_engine()
        print(f"Graph Memory Extracted Info: {extracted_info}, engine: {engine}")
        if engine == GraphRoutingDecision.SLM.value:
            return extracted_info.response
        else:
            return await SwitchingEngine(query=query).switch_engine(
                engine=engine,
                extracted_info=extracted_info
            )
