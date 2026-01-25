from typing import List, Dict, Any

from core.domain import constant
from core.domain.entities.database.tool import Tool
from core.domain.entities.vectordb.tool import tool_vector_entity
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.domain.request.memory_request import MemoryQueryDto
from core.prompts.system_prompt import CLASSIFY_PROMPT
from core.semantic_router import router_registry
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.repository.tool_repository import tool_repository
from infrastructure.reranking.base_reranking import reranking_model
from kernel.config import llm_models


async def select_tool_by_router(
    label_value: str,
    memory: MemoryQueryDto
) -> str:
    """
    Select the appropriate ability based on the label value.

    Args:
        label_value (str): The label to identify the ability.
        query (QueryRequest): The user's query containing task information.
    Returns:
        str: The response from the selected ability handler.
    """
    if label_value == enum.ChatType.GAIA_INTRODUCTION.value:
        guided_route = await router_registry.gaia_introduction_route(memory.reflected_query)
        return guided_route
    elif label_value == enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value:
        return label_value
    elif label_value == enum.ChatType.ABILITIES.value:
        return await select_ability_tool(memory)


async def select_ability_tool(memory: MemoryQueryDto) -> str:
    """
    Select the appropriate ability tool based on the user's query using semantic search and LLM classification. 
    """
    tools = await _query_tools(memory)
    if not tools:
        return enum.GaiaAbilities.CHITCHAT.value

    ranked_tools = await _rerank_tools(
        query_text=f"Context: {memory.last_bot_message}\nUser: {memory.query}",
        search_results=tools,
        top_n=constant.SemanticSearch.DEFAULT_TOP_N
    )
    if not ranked_tools:
        return enum.GaiaAbilities.CHITCHAT.value

    selected_tool = _validate_ambiguity(ranked_tools)
    if not selected_tool:
        selected_tool = await _llm_reasoning_selection(tools=tools, query=memory.reflected_query)
    return selected_tool


async def _query_tools(memory: MemoryQueryDto) -> List[str]:
    query_embedding = await embedding_model.get_embeddings([memory.reflected_query])
    embedding_tools = tool_vector_entity.search_top_n(
        query_embeddings=query_embedding,
        top_k=constant.SemanticSearch.DEFAULT_TOP_K,
    )

    tools = embedding_tools + memory.used_tools

    selected_tools = await tool_repository.query_tools_by_names(tools)

    return [f"Tool: {tool.tool}, Description: {tool.description}"
            for tool in selected_tools]


MIN_RELEVANCE_THRESHOLD = 0.15
HIGH_CONFIDENCE_SCORE = 0.7
MIN_DECISIVE_DELTA = 0.15
DOMINANT_RATIO_THRESHOLD = 2.0
SINGLE_TOOL_TRUST_THRESHOLD = 0.5
AMBIGUITY_CANDIDATE_LIMIT = 3


def _validate_ambiguity(ranked_tools: List[Dict[str, Any]]) -> bool:
    top_1 = ranked_tools[0]
    top_2 = ranked_tools[1] if len(ranked_tools) > 1 else None
    print(f"Top 1 tool: {top_1}, Top 2 tool: {top_2}")

    if top_1["score"] < MIN_RELEVANCE_THRESHOLD:
        return enum.GaiaAbilities.CHITCHAT.value

    if not top_2:
        if top_1["score"] > SINGLE_TOOL_TRUST_THRESHOLD:
            return top_1["tool"]
    else:
        delta = top_1["score"] - top_2["score"]
        ratio = top_1["score"] / (top_2["score"] + 1e-9)

        if top_1["score"] > HIGH_CONFIDENCE_SCORE and delta > MIN_DECISIVE_DELTA:
            return top_1["tool"]

        if ratio > DOMINANT_RATIO_THRESHOLD:
            return top_1["tool"]

    return None  # Indicate ambiguity


async def _llm_reasoning_selection(tools: str, query: QueryRequest) -> str:
    prompt = CLASSIFY_PROMPT.format(
        query=query, tools=tools)

    function = await llm_models.get_model_generate_content(
        query.model, query.user_id, prompt=prompt)
    return function(prompt=prompt, model=query.model)


async def _rerank_tools(query_text: str, search_results: List[List[Dict[str, Any]]], top_n: int = 3) -> List[Dict[str, Any]]:
    if not search_results or not search_results[0]:
        return []

    documents = []
    tool_map = {}

    for result in search_results[0]:
        entity = result.get("entity", {})
        tool_name = entity.get("tool")
        description = entity.get("description", "")
        sample_query = entity.get("sample_query", "")

        if not tool_name:
            continue

        doc_text = f"{description}\nExample: {sample_query}" if sample_query else description

        documents.append({
            "text": doc_text,
            "tool_name": tool_name
        })

        # Store tool info (avoid duplicates)
        if tool_name not in tool_map:
            tool_map[tool_name] = {
                "tool": tool_name,
                "description": description,
            }

    if not documents:
        return []

    reranked_result = await reranking_model.rerank(
        query=query_text,
        documents=documents,
        top_n=min(top_n, len(documents))
    )

    if "error" in reranked_result:
        print(f"Reranking error: {reranked_result['error']}")
        return []

    reranked_docs = reranked_result.get("documents", [])
    scores = reranked_result.get("scores", [])

    tools = []
    seen_tools = set()

    for i, doc in enumerate(reranked_docs):
        tool_name = doc.get("tool_name")
        if not tool_name or tool_name in seen_tools:
            continue

        seen_tools.add(tool_name)
        tool_info = tool_map.get(tool_name, {})

        tools.append({
            "tool": tool_name,
            "description": tool_info.get("description", ""),
            "score": scores[i] if i < len(scores) else 0.0,
        })

    return tools
