from typing import Any

from core.abilities import ability_routers
from core.domain.request.query_request import QueryRequest
from core.service import memory_service


class ThinkingUsecase:

    @classmethod
    async def chat(cls, query: QueryRequest, chat_type: str, default=True, **kwargs: Any):
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
        is_change_title = kwargs.get("is_change_title", False)
        user_message_id = kwargs.get("user_message_id")
        if user_message_id is not None:
            query.user_message_id = str(user_message_id)

        print(f"Chat Type: {chat_type}, Query: {query.query}")
        tool_selection, use_chat_history_prompt = await ability_routers.select_ability(
            label_value=chat_type, 
            query=query)

        if use_chat_history_prompt:
            query = await memory_service.recall_history_info(query=query, default=default)

        print(f"Tool Selection: {tool_selection}")
        response = await ability_routers.call_router_function(
            label_value=chat_type, 
            query=query, 
            guided_route=tool_selection)

        print(f"Response: {response}")

        await memory_service.memorize_info(query=query, is_change_title=is_change_title)

        return response
