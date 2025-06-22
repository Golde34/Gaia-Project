from core.domain.enum import enum
from infrastructure.semantic_router import route, samples, router
from kernel.config import config



introduction_route = route.Route(name=enum.SemanticRoute.GAIA_INTRODUCTION, samples=samples
                                 .gaia_introduction_sample)
chitchat_route = route.Route(name=enum.SemanticRoute.CHITCHAT, samples=samples
                                .chitchat_sample)
semantic_router = router.SemanticRouter(routes=[introduction_route, chitchat_route],
                                         model_name=config.EMBEDDING_MODEL)

async def gaia_introduction_route(query: str) -> route.Route:
    """
    Get the GAIA introduction route.

    Returns:
        route.Route: The GAIA introduction route.
    """
    await semantic_router.initialize()
    guided_route = await semantic_router.guide(query)
    print(f"Semnatic router: {guided_route}")
    if guided_route is None:
        raise ValueError("No route found for the query.")
    return guided_route