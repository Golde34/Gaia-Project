import json
from typing import List, Dict, Any

from core.domain import constant
from core.domain.entities.tool import Tool
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.prompts.system_prompt import CLASSIFY_PROMPT
from core.semantic_router import router_registry
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.repository.tool_repository import tool_repository
from infrastructure.reranking.base_reranking import reranking_model
from infrastructure.vector_db.milvus import milvus_db
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
            return await tool_repository.query_tool_by_name(top_tool["tool"]) 
        else:
            raise Exception("No tools found after reranking.")
    else:
        tools_name = [tool["tool"] for tool in tools]
        tools = tool_repository.query_tool_by_name(tools_name)
        tools_string = json.dumps(tools, indent=2)

        prompt = CLASSIFY_PROMPT.format(
            query=query.query, tools=tools_string)

        function = await llm_models.get_model_generate_content(
            query.model, query.user_id, prompt=prompt)
        tool: Tool = function(prompt=prompt, model=query.model, dto=Tool)

        return tool.tool, tool.need_history


async def _semantic_shortlist_tools(query_text: str):
    query_embedding = await embedding_model.get_embeddings([query_text])
    search_results = milvus_db.search_top_n(
        query_embeddings=query_embedding,
        top_k=constant.SemanticSearch.DEFAULT_TOP_K,
        partition_name="tools",
    )
    return search_results


async def _rerank_tools(query_text: str, search_results: List[List[Dict[str, Any]]], top_n: int = 3) -> Dict[str, Any]:
    if not search_results or not search_results[0]:
        return {"tools": [], "error": "Empty search results"}

    documents = []
    tool_metadata_map = {}

    for result in search_results[0]:
        content = result.get("content", "")
        metadata = result.get("metadata", {})
        tool_name = metadata.get("tool")

        if not tool_name:
            continue

        documents.append({
            "text": content,
            "tool_name": tool_name
        })

        if tool_name not in tool_metadata_map:
            tool_metadata_map[tool_name] = metadata

    if not documents:
        return {"tools": [], "error": "No documents to rerank"}

    reranked_result = await reranking_model.rerank(
        query=query_text,
        documents=documents,
        top_n=min(top_n, len(documents))
    )

    if "error" in reranked_result:
        return {"tools": [], "error": reranked_result["error"]}

    reranked_docs = reranked_result.get("documents", [])
    scores = reranked_result.get("scores", [])

    tools = []
    for i, doc in enumerate(reranked_docs):
        tool_name = doc.get("tool_name")
        if not tool_name:
            continue

        metadata = tool_metadata_map.get(tool_name, {})

        tools.append({
            "tool": tool_name,
            "description": metadata.get("description", ""),
            "score": scores[i] if i < len(scores) else 0.0,
            "need_history": metadata.get("need_history", False)
        })

    return tools


def _should_use_llm_selection(tools: List[Dict[str, Any]], threshold: float = 0.1) -> bool:
    if len(tools) < 2:
        return False

    score_diff = abs(tools[0]["score"] - tools[1]["score"])
    return score_diff < threshold


# async def select_ability_tool_2(query: QueryRequest) -> str:
#     """
#     Select the appropriate ability based on the label value.

#     Args:
#         label_value (str): The label to identify the ability.
#         query (QueryRequest): The user's query containing task information.
#     Returns:
#         str: The response from the selected ability handler.
#     """
#     tools_string = json.dumps(ABILITIES, indent=2)

#     prompt = CLASSIFY_PROMPT.format(
#         query=query.query, tools=tools_string)

#     function = await llm_models.get_model_generate_content(
#         query.model, query.user_id, prompt=prompt)
#     classify_response = function(prompt=prompt, model=query.model)

#     print("Classify Response:", classify_response)
#     is_need_history = _need_history(classify_response)
#     return classify_response, is_need_history


# def _need_history(label_value: str) -> bool:
#     """
#     Check if the ability requires chat history.

#     Args:
#         label_value (str): The label to identify the ability.
#     Returns:
#         bool: True if the ability requires chat history, False otherwise.
#     """
#     for ability in ABILITIES:
#         if ability['label'] == label_value:
#             return ability.get('need_history', False)
#     return False
