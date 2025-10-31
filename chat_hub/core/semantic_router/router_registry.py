from core.domain.enums import enum
from core.semantic_router import introduction_samples, chat_history_samples
from infrastructure.semantic_router import route, router
from kernel.config import config


introduction_route = route.Route(
    name=enum.SemanticRoute.GAIA_INTRODUCTION, samples=introduction_samples.gaia_introduction_sample)
chitchat_route = route.Route(
    name=enum.SemanticRoute.CHITCHAT, samples=introduction_samples.chitchat_sample)
onboarding_router = router.SemanticRouter(routes=[introduction_route, chitchat_route],
                                          model_name=config.EMBEDDING_MODEL)

async def gaia_introduction_route(query: str) -> route.Route:
    """
    Get the GAIA introduction route.

    Returns:
        route.Route: The GAIA introduction route.
    """
    await onboarding_router.initialize()
    guided_route, _ = await onboarding_router.guide(query)
    print(f"Semantic router of gaia introduction: {guided_route.name}")
    if guided_route is None:
        raise ValueError("No route found for the query.")
    return guided_route.name


register_calendar_example_route = route.Route(
    name=enum.SemanticRoute.REGISTER_SCHEDULE_CALENDAR_EXAMPLE, 
    samples=introduction_samples.register_calendar_example_sample)
register_calendar_router = router.SemanticRouter(routes=[register_calendar_example_route],
                                          model_name=config.EMBEDDING_MODEL)

async def register_calendar_config_route(query: str) -> route.Route:
    await register_calendar_router.initialize()
    guided_route, similarity = await onboarding_router.guide(query)
    if (similarity < config.REGISTER_CALENDAR_SEMANTIC_THRESHOLD): 
        return enum.SemanticRoute.REGISTER_SCHEDULE_CALENDAR
    print(f"Semantic router of gaia introduction: {guided_route.name}")
    if guided_route is None:
        raise ValueError("No route found for the query.")
    return guided_route.name


recent_history = route.Route(
    name=enum.SemanticRoute.RECENT_HISTORY, samples=chat_history_samples.recent_history_sample)
recursive_summary = route.Route(
    name=enum.SemanticRoute.RECURSIVE_SUMMARY, samples=chat_history_samples.recursive_summary_sample)
long_term_memory = route.Route(
    name=enum.SemanticRoute.LONG_TERM_MEMORY, samples=chat_history_samples.long_term_memory_sample)
chat_history_router = router.SemanticRouter(routes=[recent_history, recursive_summary, long_term_memory, chitchat_route],
                                          model_name=config.EMBEDDING_MODEL)

async def chat_history_route(query: str) -> route.Route:
    """
    Get the chat history route.

    Returns:
        route.Route: The chat history route.
    """
    await chat_history_router.initialize()
    guide_routes = await chat_history_router.guide_with_many_routes(query)
    response = {
        'recent_history': False,
        'recursive_summary': False,
        'long_term_memory': False,
    }

    if guide_routes is None or len(guide_routes) == 0:
        guide_routes = [('chitchat', None)]

    for route_name, _ in guide_routes:
        if route_name == enum.SemanticRoute.RECENT_HISTORY:
            response['recent_history'] = True
        elif route_name == enum.SemanticRoute.RECURSIVE_SUMMARY:
            response['recursive_summary'] = True
        elif route_name == enum.SemanticRoute.LONG_TERM_MEMORY:
            response['long_term_memory'] = True 

    print(f"Chat history routes: {response}")
    return response
