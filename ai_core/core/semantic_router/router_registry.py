from core.domain.enums import enum
from core.semantic_router import introduction_samples, chat_history_samples
from infrastructure.semantic_router import route, router
from kernel.config import config


embedding_manager = router.EmbeddingManager()

introduction_route = route.Route(
    name=enum.SemanticRoute.GAIA_INTRODUCTION, samples=introduction_samples.gaia_introduction_sample)
chitchat_route = route.Route(
    name=enum.SemanticRoute.CHITCHAT, samples=introduction_samples.chitchat_sample)
onboarding_router = router.SemanticRouter(routes=[introduction_route, chitchat_route],
                                          model_name=config.EMBEDDING_MODEL, embedding_manager=embedding_manager)


async def gaia_introduction_route(query: str) -> route.Route:
    """
    Get the GAIA introduction route.

    Returns:
        route.Route: The GAIA introduction route.
    """
    await onboarding_router.initialize()
    guided_route = await onboarding_router.guide(query)
    print(f"Semnatic router: {guided_route.name}")
    if guided_route is None:
        raise ValueError("No route found for the query.")
    return guided_route.name


recent_history = route.Route(
    name=enum.SemanticRoute.RECENT_HISTORY, samples=chat_history_samples.recent_history_sample)
recursive_summary = route.Route(
    name=enum.SemanticRoute.CHITCHAT, samples=chat_history_samples.recursive_summary_sample)
long_term_memory = route.Route(
    name=enum.SemanticRoute.CHITCHAT, samples=chat_history_samples.long_term_memory_sample)
chat_history_router = router.SemanticRouter(routes=[recent_history, recursive_summary, long_term_memory, chitchat_route],
                                          model_name=config.EMBEDDING_MODEL, embedding_manager=embedding_manager)

async def chat_history_route(query: str) -> route.Route:
    """
    Get the chat history route.

    Returns:
        route.Route: The chat history route.
    """
    await chat_history_router.initialize()
    guided_route = await chat_history_router.guide(query)
    print(f"Semnatic router: {guided_route.name}")
    if guided_route is None:
        raise ValueError("No route found for the query.")
    return guided_route.name
