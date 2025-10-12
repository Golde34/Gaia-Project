from fastapi import HTTPException

from core.domain.entities.graphdb.label_node_entity import RequiresEdge, ExcludesEdge, CoOccurEdge, SimilarEdge
from core.domain.enums.enum import SearchMode, NodeBundleKind
from core.domain.request.command_label_request import CommandLabelRequest
from core.domain.request.node_bundle_request import NodeBundle, LabelConnections, ProviderConnections
from infrastructure.repository.graphdb import upsert_cypher
from infrastructure.repository.vectordb import command_label_repo


# VECTORDB
def insert_command_label(request: CommandLabelRequest):
    return command_label_repo.insert_command_label(request=request)


def search_command_label(query: str, type: str):
    if type == SearchMode.VECTOR.value:
        return command_label_repo.search_top_n(query)
    elif type == SearchMode.HYBRID.value:
        return command_label_repo.hybrid_search(query)
    else:
        raise ValueError(f"Unsupported search type: {type}")


async def rank_labels_by_relevance(query: str):
    return await command_label_repo.rank_labels_by_relevance(query, None)


# GRAPHDB
async def upsert_label_node(label_node: NodeBundle):
    node = label_node.node
    connections = label_node.connections
    if node.kind == NodeBundleKind.LABEL.value:
        await upsert_cypher.upsert_label(node.label)
        label_name = node.label.name

        if isinstance(connections, LabelConnections):
            for e in connections.requires:
                await upsert_cypher.upsert_requires(
                    RequiresEdge(src=label_name, dst=e.to, w=e.w, source=e.source, version=e.version))
            for e in connections.excludes:
                await upsert_cypher.upsert_excludes(
                    ExcludesEdge(a=label_name, b=e.with_label, w=e.w, source=e.source, version=e.version))
            for e in connections.co_occur:
                await upsert_cypher.upsert_cooccur(
                    CoOccurEdge(src=label_name, dst=e.with_label, pmi=e.pmi, w=e.w, count12=e.count12, source=e.source))
            for e in connections.similar_to:
                await upsert_cypher.upsert_similar(
                    SimilarEdge(src=label_name, dst=e.with_label, sim=e.sim, w=e.w, source=e.source))
            for p in connections.handled_by:
                await upsert_cypher.upsert_handles(label=label_name, provider=p)
        return {"ok": True, "node": {"kind": node.kind, "name": label_name}}

    elif node.kind == NodeBundleKind.PROVIDER.value:
        await upsert_cypher.upsert_provider(node.provider)
        provider_name = node.provider.name
        
        if isinstance(connections, ProviderConnections):
            for l in connections.handles:
                await upsert_cypher.upsert_handles(label=l, provider=provider_name)
        return {"ok": True, "node": {"kind": node.kind, "name": provider_name}}
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported node kind: {node.kind}")
