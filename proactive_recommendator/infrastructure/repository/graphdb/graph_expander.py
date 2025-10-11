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
                    WHERE l.name = $seed or (l.aliases is not null and $seed in l.aliases)
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
        if not canonical:
            return []

        async for session in get_db_session():
            rec = await session.run("""
                MATCH (l:Label) WHERE l.name IN $seeds RETURN l.name as name, id(l) as nodeId
            """, seeds=canonical)
            nodes = await rec.data()

            node_ids = {r["name"]: r["nodeId"] for r in nodes}
            source_nodes = [[node_ids[name], 1.0]
                            for name in canonical if name in node_ids]
            if not source_nodes:
                return []

            label_graph = await self.find_and_create_projection('LabelGraph')

            rec = await session.run("""
                CALL gds.pageRank.stream($graph, {
                    maxIterations: 20,
                    dampingFactor: 0.85,
                    sourceNodes: $sourceNodes
                })
                YIELD nodeId, score
                RETURN gds.util.asNode(nodeId).name AS label, score
                ORDER BY score DESC
                LIMIT $limit
            """, graph=label_graph, sourceNodes=source_nodes, limit=limit)
            result = await rec.data()
            return result
        return []

    async def find_and_create_projection(self, projection_name: str) -> str:
        async for session in get_db_session():
            result = await session.run("""
                CALL gds.graph.list()
                YIELD graphName
                WHERE graphName = $projection_name
                RETURN graphName
            """, projection_name=projection_name)
            rows = await result.data()
            if rows is None or len(rows) == 0:
                result = await session.run("""
                    CALL gds.graph.project(
                        $projection_name, 'Label', ['REQUIRES', 'CO_OCCUR', 'SIMILAR_TO'])
                    YIELD graphName, nodeCount, relationshipCount
                    RETURN graphName, nodeCount, relationshipCount;
            """, projection_name=projection_name)
                data = await result.data()
                return data[0]["graphName"]
            else:
                return rows[0]["graphName"]

    async def get_providers_for_labels(self, labels: List[str]) -> List[Dict[str, Any]]:
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
                {"name": row["name"], "label": row["label"],
                    "priority": row["priority"]}
                for row in rows
            ]
        return []

    async def close(self) -> None:
        await close_neo4j_driver()


async def expand_labels(seed_labels: List[str], limit: int = 5) -> List[Tuple[str, float, Dict[str, Any]]]:
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
            print("GDS")
            expanded = await lg.expand_ppr(canonical, limit=limit)
        else:
            print("NONE GDS")
            expanded = await lg.expand_neighbors(canonical, limit=limit)

        merged: Dict[str, Dict[str, Any]] = {}
        for seed in canonical:
            merged[seed] = {"score": 0.0, "meta": {"src": "seed"}}

        for element in expanded:
            label, score, meta = element['label'], element['score'], element.get('meta', {})
            previous = merged.get(label, {"score": 0.0, "meta": {}})
            merged[label] = {
                "score": max(previous["score"], float(score)),
                "meta": {**previous["meta"], **meta},
            }

        return sorted(
            [(name, data["score"], data["meta"])
             for name, data in merged.items()],
            key=lambda item: item[1],
            reverse=True,
        )
    finally:
        await lg.close()


async def providers_for_labels(labels: List[str]) -> List[Dict[str, Any]]:
    lg = LabelGraph()
    try:
        return await lg.get_providers_for_labels(labels)
    finally:
        await lg.close()
