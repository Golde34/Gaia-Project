import json
from typing import List, Dict, Any

from core.domain import constant
from core.domain.entities.database.tool import Tool
from core.domain.entities.vectordb.tool import tool_vector_entity
from core.domain.enums import enum
from core.domain.request.query_request import QueryRequest
from core.prompts.system_prompt import CLASSIFY_PROMPT
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.repository.tool_repository import tool_repository
from infrastructure.reranking.base_reranking import reranking_model
from kernel.config import llm_models


class SwitchingEngine:
    """
    SwitchingEngine is responsible for determining the appropriate memory model will be used based on incoming requests.
    Call LLM to analyze the request, and response 2 thing:
    - tool: str: the tool user want to use, e.g., create task, daily routine, long term memory
    - memory_model: str: the memory model to use, e.g., STAG, SLTM, EMG

    query: QueryRequest

    Response:
    tool: str
    memory_model: str
    query: QueryRequest
    """
    def __init__(self, query: QueryRequest):
        self.query = query

    async def switch(self) -> dict:
        embedding_tools = await self._semantic_search(self.query.query)
        tools = await self._rerank_tools(
            self.query.query,
            embedding_tools,
            top_n=constant.SemanticSearch.DEFAULT_TOP_N)

        if not self._should_use_llm_selection(tools):
            top_tool = tools[0] if tools else None
            if top_tool:
                tool = await tool_repository.query_tool_by_name(top_tool["tool"]) 
                return tool.tool
            else:
                return enum.GaiaAbilities.CHITCHAT.value
        else:
            tools_name = [tool["tool"] for tool in tools]
            tools_name.append(enum.GaiaAbilities.CHITCHAT.value)  # always add chitchat as fallback
            tools = tool_repository.query_tools_by_names(tools_name)
            tools_string = json.dumps(tools, indent=2)

            tool: Tool = await self._call_llm(tools_string)
            
            return tool.tool

    async def _semantic_search(self, query_text: str) -> dict:
        query_embedding = await embedding_model.get_embeddings([query_text])
        return tool_vector_entity.search_top_n(
            query_embeddings=query_embedding,
            top_k=constant.SemanticSearch.DEFAULT_TOP_K,
        )
    
    async def _rerank_tools(self, query_text: str, search_results: List[List[Dict[str, Any]]], top_n: int = 3) -> List[Dict[str, Any]]:
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

            # Use sample_query as reranking text (since it's most relevant to user queries)
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

    def _should_use_llm_selection(self, tools: List[Dict[str, Any]], threshold: float = 0.1) -> bool:
        if len(tools) < 2:
            return False

        top_score = tools[0].get("score", 0.0)
        second_score = tools[1].get("score", 0.0)

        score_diff = top_score - second_score
        print(f"Top score: {top_score}, Second score: {second_score}, Difference: {score_diff}")

        return score_diff < threshold

    async def _call_llm(self, tools_string: str) -> dict:
        prompt = CLASSIFY_PROMPT.format(
            query=self.query.query, tools=tools_string)

        function = await llm_models.get_model_generate_content(
            self.query.model, self.query.user_id, prompt=prompt)
        tool: Tool = function(prompt=prompt, model=self.query.model, dto=Tool)
        return tool
