import asyncio
import time
import json
from html import unescape
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlencode

import aiohttp

from core.domain.enums import enum
from core.domain.request.query_request import LLMModel
from kernel.config import config
from kernel.config import llm_models


_CACHE: Dict[str, Dict[str, Any]] = {}


async def run_search(
    user_query: str,
    *,
    user_id: Optional[int] = None,
    model: Optional[LLMModel] = None,
    top_k: Optional[int] = None,
    summarize: bool = False,
    depth: str = "shallow",
    lang: str = "vi",
    safe_search: str = "off",
) -> Dict[str, Any]:
    """
    Clean pipeline: search -> optional summarize -> package response.
    This keeps the call site simple while helpers handle caching, guardrails, and fallbacks.
    """
    resolved_top_k = top_k or config.SEARCH_DEFAULT_TOP_K
    depth = depth if depth in {"shallow", "deep"} else "shallow"
    summarize = summarize and _should_summarize(user_query)

    started = time.time()
    links, provider = await _cached_search(
        query=user_query,
        top_k=resolved_top_k,
        lang=lang,
        safe_search=safe_search,
    )

    summary = ""
    used_summary = False
    if summarize and links:
        content_blob = await _collect_content(links, depth)
        if content_blob:
            summary = await _summarize(
                query=user_query,
                content=content_blob,
                model=model,
                user_id=user_id,
            )
            used_summary = bool(summary)

    took_ms = int((time.time() - started) * 1000)
    response_text = summary or "Here are the top results I found."
    return {
        "response": response_text,
        "links": links,
        "summary": summary,
        "debug": {
            "provider": provider,
            "used_summary": used_summary,
            "depth": depth,
            "took_ms": took_ms,
        },
    }


async def _cached_search(query: str, top_k: int, lang: str, safe_search: str) -> Tuple[List[Dict[str, str]], str]:
    cache_key = json.dumps([query, top_k, lang, safe_search])
    cached = _CACHE.get(cache_key)
    now = time.time()
    if cached and cached.get("expires_at", 0) > now:
        return cached["payload"], cached["provider"]

    links, provider = await _google_custom_search(
        query=query,
        top_k=top_k,
        lang=lang,
        safe_search=safe_search,
    )
    _CACHE[cache_key] = {
        "payload": links,
        "provider": provider,
        "expires_at": now + config.SEARCH_CACHE_TTL,
    }
    return links, provider


async def _google_custom_search(query: str, top_k: int, lang: str, safe_search: str) -> Tuple[List[Dict[str, str]], str]:
    if not config.GOOGLE_SEARCH_API_KEY or not config.GOOGLE_SEARCH_ENGINE_ID:
        print("Search: missing GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID.")
        return [], "google"

    params = {
        "key": config.GOOGLE_SEARCH_API_KEY,
        "cx": config.GOOGLE_SEARCH_ENGINE_ID,
        "q": query,
        "num": max(1, min(top_k, 10)),
        "lr": f"lang_{lang}" if lang else None,
        "safe": safe_search,
    }
    params = {k: v for k, v in params.items() if v is not None}
    url = f"https://www.googleapis.com/customsearch/v1?{urlencode(params)}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=config.SEARCH_HTTP_TIMEOUT, headers={"User-Agent": "gaia-search/1.0"}) as resp:
                if resp.status >= 300:
                    print(f"Search provider error {resp.status}: {await resp.text()}")
                    return [], "google"
                payload = await resp.json()
    except Exception as exc:
        print(f"Search provider call failed: {exc}")
        return [], "google"

    items = payload.get("items") or []
    links: List[Dict[str, str]] = []
    for idx, item in enumerate(items):
        links.append({
            "title": item.get("title", ""),
            "link": item.get("link", ""),
            "snippet": item.get("snippet", ""),
            "rank": idx + 1,
        })
    return links, "google"


def _should_summarize(query: str) -> bool:
    tokens = query.lower().split()
    if not tokens:
        return False
    if len(tokens) <= 3:
        return False
    navigational_markers = {"trang", "chủ", "homepage", "facebook", "youtube"}
    if any(marker in tokens for marker in navigational_markers):
        return False
    return True


async def _collect_content(links: List[Dict[str, str]], depth: str) -> str:
    if depth == "shallow":
        snippets = [item.get("snippet", "") for item in links[:5]]
        return "\n".join(filter(None, snippets))

    targets = [item.get("link") for item in links[:3] if item.get("link")]
    if not targets:
        return ""

    texts = await asyncio.gather(*[_fetch_page_text(url) for url in targets])
    merged = "\n".join(filter(None, texts))
    return merged or ""


async def _fetch_page_text(url: str) -> str:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=config.SEARCH_HTTP_TIMEOUT, headers={"User-Agent": "gaia-search/1.0"}) as resp:
                if resp.status >= 300:
                    return ""
                html = await resp.text()
                return _strip_html(html)[:config.SEARCH_MAX_EXTRACT_CHARS]
    except Exception as exc:
        print(f"Failed to fetch {url}: {exc}")
        return ""


def _strip_html(raw_html: str) -> str:
    # Lightweight HTML text extraction without adding dependencies.
    text = raw_html.replace("\r", " ").replace("\n", " ")
    while "<script" in text or "<style" in text:
        text = _drop_segment(text, "<script", "</script>")
        text = _drop_segment(text, "<style", "</style>")
    cleaned = []
    skip = False
    for ch in text:
        if ch == "<":
            skip = True
            cleaned.append(" ")
        elif ch == ">":
            skip = False
        elif not skip:
            cleaned.append(ch)
    merged = "".join(cleaned)
    merged = unescape(merged)
    return " ".join(merged.split())


def _drop_segment(text: str, start_tag: str, end_tag: str) -> str:
    start = text.lower().find(start_tag)
    if start == -1:
        return text
    end = text.lower().find(end_tag, start)
    if end == -1:
        return text
    return text[:start] + text[end + len(end_tag):]


async def _summarize(query: str, content: str, model: Optional[LLMModel], user_id: Optional[int]) -> str:
    prompt = (
        "You are summarizing web search results. "
        "Answer briefly (max 5 bullets). "
        f"User question: {query}\n\n"
        f"Sources:\n{content[:config.SEARCH_MAX_PROMPT_CHARS]}"
    )
    try:
        model_to_use = model or LLMModel(
            model_name=config.LLM_DEFAULT_MODEL, 
            model_key=config.SYSTEM_API_KEY,
            memory_model=enum.MemoryModel.DEFAULT.value,
            organization=config.SYSTEM_ORGANIZATION    
        )
        llm_fn = await llm_models.get_model_generate_content(
            model=model_to_use,
            user_id=str(user_id or ""),
            prompt=prompt,
        )
        return llm_fn(prompt=prompt, model=model_to_use)
    except Exception as exc:
        print(f"Summarize failed: {exc}")
        return ""
