import json
from typing import List, Dict, Any

from core.domain import constant
from core.domain.entities.database.tool import Tool
from core.domain.entities.vectordb.tool import tool_vector_entity
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.prompts.system_prompt import CLASSIFY_PROMPT
from core.semantic_router import router_registry
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.repository.tool_repository import tool_repository
from infrastructure.reranking.base_reranking import reranking_model
from kernel.config import llm_models


async def select_tool_by_router(label_value: str, query: QueryRequest) -> tuple[str, bool]:
    """
    Select the appropriate ability based on the label value.

    Args:
        label_value (str): The label to identify the ability.
        query (QueryRequest): The user's query containing task information.
    Returns:
        str: The response from the selected ability handler.
    """
    if label_value == enum.ChatType.GAIA_INTRODUCTION.value:
        guided_route = await router_registry.gaia_introduction_route(query.query)
        return guided_route, False
    elif label_value == enum.ChatType.REGISTER_SCHEDULE_CALENDAR.value:
        return label_value, False
    elif label_value == enum.ChatType.ABILITIES.value:
        return await select_ability_tool(query)


async def select_ability_tool(query: QueryRequest) -> tuple[str, bool]:
    """
    Select the appropriate ability based on the label value.
    + First semantic search to shortlist top5 tools
    + Then try to reranking among top5 tools using LLM
    + If the relevant scores between top1 and top2 is smaller than threshold, return list tools
    + Secondary, when we have the list of tools, we can use another LLM to select among them

    Args:
        label_value (str): The label to identify the ability.
        query (QueryRequest): The user's query containing task information.
    Returns:
        str: The response from the selected ability handler.
    """
    embedding_tools = await _semantic_shortlist_tools(query.query)
    tools = await _rerank_tools(
        query.query,
        embedding_tools,
        top_n=constant.SemanticSearch.DEFAULT_TOP_N)

    if not _should_use_llm_selection(tools):
        top_tool = tools[0] if tools else None
        if top_tool:
            tool = await tool_repository.query_tool_by_name(top_tool["tool"]) 
            return tool.tool, tool.need_history
        else:
            return enum.GaiaAbilities.CHITCHAT.value, True
    else:
        tools_name = [tool["tool"] for tool in tools]
        tools_name.append(enum.GaiaAbilities.CHITCHAT.value)  # always add chitchat as fallback
        tools = tool_repository.query_tools_by_names(tools_name)
        tools_string = json.dumps(tools, indent=2)

        prompt = CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)

        function = await llm_models.get_model_generate_content(
            query.model, query.user_id, prompt=prompt)
        tool: Tool = function(prompt=prompt, model=query.model, dto=Tool)

        return tool.tool, tool.need_history


async def _semantic_shortlist_tools(query_text: str):
    query_embedding = await embedding_model.get_embeddings([query_text])
    return tool_vector_entity.search_top_n(
        query_embeddings=query_embedding,
        top_k=constant.SemanticSearch.DEFAULT_TOP_K,
    )

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


def _should_use_llm_selection(tools: List[Dict[str, Any]], threshold: float = 0.1) -> bool:
    if len(tools) < 2:
        return False

    score_diff = abs(tools[0]["score"] - tools[1]["score"])
    return score_diff < threshold
