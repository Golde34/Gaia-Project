from core.domain.request.query_request import QueryRequest
from infrastructure.search.google_search import run_search
from kernel.config import config


async def search(query: QueryRequest) -> dict:
    """
    Ability handler for web search. Defaults to link-first (no LLM) mode.
    """
    return await run_search(
        user_query=query.query,
        user_id=query.user_id,
        model=query.model,
        top_k=config.SEARCH_DEFAULT_TOP_K,
        summarize=False,
        depth="shallow",
        lang="vi",
        safe_search="active",
    )