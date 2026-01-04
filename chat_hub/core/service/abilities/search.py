from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.service.abilities.function_handlers import function_handler
from infrastructure.search.google_search import run_search
from kernel.config import config


@function_handler(label=enum.GaiaAbilities.SEARCH.value, is_sequential=False)
async def search(query: QueryRequest) -> tuple[str, bool]:
    """
    Ability handler for web search. Defaults to link-first (no LLM) mode.

    Args:
        query (QueryRequest): The user's query containing search information.
    Returns:
        tuple[str, bool]: The search results by strings and a flag indicating if recommendation is needed.
    """
    result = await run_search(
        user_query=query.query,
        user_id=query.user_id,
        model=query.model,
        top_k=config.SEARCH_DEFAULT_TOP_K,
        summarize=False,
        depth="shallow",
        lang="vi",
        safe_search="active",
    )
    
    # Format kết quả thành text với các nguồn link
    response_text = result.get("response", "Here are the top results I found:")
    links = result.get("links", [])
    
    if links:
        response_text += "\n\n**References:**\n"
        for idx, link_item in enumerate(links, 1):
            title = link_item.get("title", "No title")
            url = link_item.get("link", "")
            snippet = link_item.get("snippet", "")
            response_text += f"\n{idx}. **{title}**\n"
            response_text += f"   {url}\n"
            if snippet:
                response_text += f"   _{snippet}_\n"
    
    return response_text, False
