from __future__ import annotations
from typing import List, Tuple, Dict, Any
from neo4j import AsyncGraphDatabase
import os

from kernel.config.config import Config as config

USE_GDS = os.getenv("USE_GDS", "true").lower() in ("1", "true", "yes")


class LabelGraph:
    def __init__(self, uri=config.NEO4J_URI, user=config.NEO4J_USER, password=config.NEO4J_PASSWORD):
        self._driver = AsyncGraphDatabase.driver(uri, auth=(user, password))

    async def close(self):
        await self._driver.close()

    async def canonicalize(self, seeds: List[str]) -> List[str]:
        """Map alias -> canonical name; nếu không tìm thấy thì giữ nguyên."""
        if not seeds:
            return []
        async with self._driver.session() as s:
            # chạy từng seed để tránh IN quá dài, vẫn đủ nhanh
            out: List[str] = []
            for x in seeds:
                rec = await s.run("""
                    MATCH (l:Label)
                    WHERE l.name = $x OR (exists(l.aliases) AND $x IN l.aliases)
                    RETURN l.name AS name
                    LIMIT 1
                """, x=x)
                r = await rec.single()
                out.append(r["name"] if r else x)
            return out

    async def expand_neighbors(self, canonical: List[str], limit: int = 30) -> List[Tuple[str, float, Dict[str, Any]]]:
        """
        Láng giềng 1 bậc với trọng số edge; loại trừ EXCLUDES với seeds.
        """
        if not canonical:
            return []
        async with self._driver.session() as s:
            rec = await s.run("""
                UNWIND $seeds AS sname
                MATCH (s:Label {name:sname})
                MATCH (s)-[r:REQUIRES|CO_OCCUR|SIMILAR_TO]->(n:Label)
                WHERE NOT (s)-[:EXCLUDES]-(n)
                WITH n,
                     max(
                        CASE type(r)
                          WHEN 'REQUIRES'   THEN coalesce(r.w,1.0)
                          WHEN 'CO_OCCUR'   THEN coalesce(r.w, coalesce(r.pmi,0.0))
                          WHEN 'SIMILAR_TO' THEN coalesce(r.w, coalesce(r.sim,0.0))
                          ELSE 0.0
                        END
                     ) AS score,
                     collect({rel:type(r), w: coalesce(r.w, coalesce(r.pmi, coalesce(r.sim, 0.0)))}) AS rels
                RETURN n.name AS label, score, rels
                ORDER BY score DESC
                LIMIT $limit
            """, seeds=canonical, limit=limit)
            rows = await rec.to_list()
            return [(r["label"], float(r["score"]), {"src": "NEIGHBOR", "rels": r["rels"]}) for r in rows]

    async def expand_ppr(self, canonical: List[str], limit: int = 30) -> List[Tuple[str, float, Dict[str, Any]]]:
        """
        Personalized PageRank bằng GDS (cần projection 'labelGraph').
        """
        if not canonical:
            return []
        async with self._driver.session() as s:
            # Dùng vector hóa personalization từ danh sách seeds
            rec = await s.run("""
                CALL gds.pageRank.stream($graph, {
                  maxIterations: 20,
                  dampingFactor: 0.85,
                  personalization: gds.alpha.similarity.asVector($seeds, 1.0)
                })
                YIELD nodeId, score
                WITH gds.util.asNode(nodeId) AS n, score
                WHERE NOT EXISTS {
                  MATCH (n)-[:EXCLUDES]-(m:Label)
                  WHERE m.name IN $seeds
                }
                RETURN n.name AS label, score
                ORDER BY score DESC
                LIMIT $limit
            """, graph="labelGraph", seeds=canonical, limit=limit)
            rows = await rec.to_list()
            return [(r["label"], float(r["score"]), {"src": "PPR"}) for r in rows]

# =============== public API ===============


async def expand_labels(seed_labels: List[str]) -> List[Tuple[str, float, Dict[str, Any]]]:
    """
    Input: seed labels from semantic router
    Output: [(label, score, meta)]
      - score: điểm mở rộng (PPR hoặc hàng xóm), đã merge multi-seed bằng max()
      - meta:  {src: "PPR" | "NEIGHBOR", ...}
    Ghi chú:
      - luôn include seed labels trong kết quả (score = 0 nếu graph không cho điểm)
      - tự động lọc EXCLUDES với seeds
    """
    lg = LabelGraph()
    try:
        # 1) alias → canonical
        canonical = await lg.canonicalize(seed_labels)

        # 2) query neighbors / PPR
        if USE_GDS:
            expanded = await lg.expand_ppr(canonical, limit=30)
        else:
            expanded = await lg.expand_neighbors(canonical, limit=30)

        # 3) merge + ensure seeds present
        merged: Dict[str, Dict[str, Any]] = {}
        # thêm seeds vào kết quả với score=0, src='seed'
        for s in canonical:
            merged[s] = {"score": 0.0, "meta": {"src": "seed"}}

        # gộp kết quả expansion (nhiều quan hệ/seeds -> lấy max)
        for label, score, meta in expanded:
            prev = merged.get(label, {"score": 0.0, "meta": {}})
            merged[label] = {
                "score": max(prev["score"], float(score)),
                "meta": {**prev["meta"], **meta}
            }

        # 4) sort desc, bỏ qua các seed nếu bạn muốn chỉ trả expanded (ở đây giữ cả seed)
        out = sorted(
            [(k, v["score"], v["meta"]) for k, v in merged.items()],
            key=lambda x: x[1],
            reverse=True
        )
        return out
    finally:
        await lg.close()


async def providers_for_labels(labels: List[str]) -> List[Dict[str, Any]]:
    """
    Trả về danh sách provider tương ứng với các label.
    Output: [{"name": "TaskStatsProvider", "label": "list task", "priority": 0}, ...]
    """
    if not labels:
        return []
    lg = LabelGraph()
    try:
        canon = await lg.canonicalize(labels)
        async with lg._driver.session() as s:
            rec = await s.run("""
                MATCH (p:Provider)-[r:HANDLES]->(l:Label)
                WHERE l.name IN $labels
                RETURN DISTINCT p.name AS name, l.name AS label, r.priority AS priority
                ORDER BY priority ASC, name ASC
            """, labels=canon)
            rows = await rec.to_list()
            return [{"name": r["name"], "label": r["label"], "priority": r["priority"]} for r in rows]
    finally:
        await lg.close()
