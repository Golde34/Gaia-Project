from __future__ import annotations

import os
from typing import Any, Dict, List, Tuple

from kernel.connection.graphdb_connection import close_neo4j_driver, get_db_session

USE_GDS = os.getenv("USE_GDS", "true").lower() in ("1", "true", "yes")


class LabelGraph:
    async def canonicalize(self, seeds: List[str]) -> List[str]:
        """Map alias -> canonical name; nếu không tìm thấy thì giữ nguyên."""
        if not seeds:
            return []

        async for session in get_db_session():
            out: List[str] = []
            for seed in seeds:
                result = await session.run(
                    """
                    MATCH (l:Label)
                    WHERE l.name = $seed OR (exists(l.aliases) AND $seed IN l.aliases)
                    RETURN l.name AS name
                    LIMIT 1
                    """,
                    {"seed": seed},
                )
                record = await result.single()
                out.append(record["name"] if record else seed)
            return out
        return []

    async def expand_neighbors(
        self, canonical: List[str], limit: int = 30
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """Láng giềng 1 bậc với trọng số edge; loại trừ EXCLUDES với seeds."""
        if not canonical:
            return []

        async for session in get_db_session():
            result = await session.run(
                """
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
                """,
                {"seeds": canonical, "limit": limit},
            )
            rows = await result.data()
            return [
                (
                    row["label"],
                    float(row["score"]),
                    {"src": "NEIGHBOR", "rels": row["rels"]},
                )
                for row in rows
            ]
        return []

    async def expand_ppr(
        self, canonical: List[str], limit: int = 30
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """Personalized PageRank bằng GDS (cần projection 'labelGraph')."""
        if not canonical:
            return []

        async for session in get_db_session():
            result = await session.run(
                """
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
                """,
                {"graph": "labelGraph", "seeds": canonical, "limit": limit},
            )
            rows = await result.data()
            return [
                (row["label"], float(row["score"]), {"src": "PPR"}) for row in rows
            ]
        return []

    async def get_providers_for_labels(self, labels: List[str]) -> List[Dict[str, Any]]:
        """Trả về danh sách provider tương ứng với các label."""
        if not labels:
            return []

        canonical = await self.canonicalize(labels)
        if not canonical:
            return []

        async for session in get_db_session():
            result = await session.run(
                """
                MATCH (p:Provider)-[r:HANDLES]->(l:Label)
                WHERE l.name IN $labels
                RETURN DISTINCT p.name AS name, l.name AS label, r.priority AS priority
                ORDER BY priority ASC, name ASC
                """,
                {"labels": canonical},
            )
            rows = await result.data()
            return [
                {"name": row["name"], "label": row["label"], "priority": row["priority"]}
                for row in rows
            ]
        return []

    async def close(self) -> None:
        await close_neo4j_driver()


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
        canonical = await lg.canonicalize(seed_labels)
        if not canonical:
            return []

        if USE_GDS:
            expanded = await lg.expand_ppr(canonical, limit=30)
        else:
            expanded = await lg.expand_neighbors(canonical, limit=30)

        merged: Dict[str, Dict[str, Any]] = {}
        for seed in canonical:
            merged[seed] = {"score": 0.0, "meta": {"src": "seed"}}

        for label, score, meta in expanded:
            previous = merged.get(label, {"score": 0.0, "meta": {}})
            merged[label] = {
                "score": max(previous["score"], float(score)),
                "meta": {**previous["meta"], **meta},
            }

        return sorted(
            [(name, data["score"], data["meta"]) for name, data in merged.items()],
            key=lambda item: item[1],
            reverse=True,
        )
    finally:
        await lg.close()


async def providers_for_labels(labels: List[str]) -> List[Dict[str, Any]]:
    """Trả về danh sách provider tương ứng với các label."""
    lg = LabelGraph()
    try:
        return await lg.get_providers_for_labels(labels)
    finally:
        await lg.close()
