from core.domain.request.memory_request import MemoryDto
from core.domain.enums import enum
from core.domain.request.query_request import LLMModel, QueryRequest
from core.prompts.abilities_prompt import CHITCHAT_PROMPT, CHITCHAT_WITH_HISTORY_PROMPT
from core.service.abilities.function_handlers import function_handler
from core.service import memory_service
from kernel.config import config, llm_models


@function_handler(label=enum.GaiaAbilities.CHITCHAT.value, is_sequential=True, is_executable=False)
async def chitchat_with_history(query: QueryRequest) -> tuple[str, bool]:
    """
    Chitchat with history pipeline
    Args:
        query (QueryRequest): The user's query containing task information.
        memory (MemoryDto): The user's memory data. 
    Returns:
        tuple[str, bool]: Short response to the request and a flag indicating if it needs a recommendation.
    """
    try:
        memory: MemoryDto = await memory_service.query_chat_history(query)

        prompt = CHITCHAT_WITH_HISTORY_PROMPT.format(
            query=query.query,
            recent_history=memory.recent_history,
            recursive_summary=memory.recursive_summary,
            long_term_memory=memory.longterm_memory
        )

        function = await llm_models.get_model_generate_content(
            model=query.model, user_id=query.user_id
        )
        return function(prompt=prompt, model=query.model), False
    except Exception as e:
        raise e


async def chitchat(query: QueryRequest) -> str:
    """
    Chitchat pipeline
    Args:
        query (QueryRequest): The user's query containing task information.
    Returns:
        tuple[str, bool]: Short response to the request and a flag indicating if it needs a recommendation.
    """
    try:
        prompt = CHITCHAT_PROMPT.format(query=query.query)
        if not query.model:
            model: LLMModel = llm_models.build_system_model(
                memory_model=enum.MemoryModel.DEFAULT
            )
        else:
            model = query.model
        function = await llm_models.get_model_generate_content(
            model=model, user_id=query.user_id
        )

        return function(prompt=prompt, model=model), False
    except Exception as e:
        raise e
