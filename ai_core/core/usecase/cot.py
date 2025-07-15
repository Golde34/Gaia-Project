from core.domain.request.query_request import QueryRequest
from core.service import chat_service
from core.abilities import ability_routers


class ChainOfThoughtUsecase:
    """
    Usecase for Chain of Thought (CoT) reasoning.
    This class is responsible for handling the CoT reasoning process.
    """

    @classmethod
    async def execute(cls, query: QueryRequest, chat_type: str):
        """
        Execute the Chain of Thought reasoning process.

        :param query: The query request containing the input data.
        :return: The result of the CoT reasoning process.
        """
        # Implement the CoT reasoning logic here
        language_detection = await cls._detect_language(query.query)

        recent_history, recursive_summary, long_term_memory = await chat_service.query_chat_history(query)

        response = await ability_routers.call_router_function(
            label_value=chat_type,
            query=query,
        ) ## response which have clarification needed        

        

    @classmethod
    async def _detect_language(cls, text: str) -> str:
        """
        Detect the language of the given text.

        :param text: The text to detect the language for.
        :return: The detected language code.
        """
        # Implement language detection logic here
        # For now, return a placeholder value
        return "en"
