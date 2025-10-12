from core.domain.entities.graphdb.label_node_entity import CoOccurEdge, ExcludesEdge, HandlesEdge, LabelNode, ProviderNode, RequiresEdge, SimilarEdge
from infrastructure.repository.graphdb import base as graphdb_base


async def upsert_label(l: LabelNode):
    query = """
    MERGE (x:Label {name:$name})
    ON CREATE SET x.type=$type, x.aliases=$aliases, x.description=$description
                    x.version=$version, x.active=$active, x.metadata=$metadata
    ON MATCH  SET x.type=$type, x.aliases=$aliases, x.description=$description
                    x.version=$version, x.active=$active, x.metadata=$metadata
    """
    parameters = {
        "name": l.name,
        "type": l.type,
        "aliases": l.aliases,
        "description": l.description,
        "version": l.version,
        "active": l.active,
        "metadata": l.metadata
    }
    await graphdb_base.run_session(query=query, parameters=parameters)


async def upsert_provider(p: ProviderNode):
    query = """
    MERGE (x:Provider {name:$name})
    ON CREATE SET x.description=$description, x.active=$active, x.metadata=$metadata
    ON MATCH  SET x.description=$description, x.active=$active, x.metadata=$metadata
        """
    parameters = {**p.model_dump()}
    await graphdb_base.run_session(query=query, parameters=parameters)


async def upsert_requires(e: RequiresEdge):
    query = """
    MATCH (a:Label {name:$src}), (b:Label {name:$dst})
    MERGE (a)-[r:REQUIRES]->(b)
    SET r.w=$w, r.source=$source, r.version=$version, r.updated
    """
    parameters = {**e.model_dump()}
    await graphdb_base.run_session(query=query, parameters=parameters)


async def upsert_excludes(e: ExcludesEdge):
    # ensure a<b to avoid duplicates (vô hướng)
    a, b = sorted([e.a, e.b])
    query = """
    MATCH (x:Label {name:$a}), (y:Label {name:$b})
    MERGE (x)-[r:EXCLUDES]-(y)
    SET r.w=$w, r.source=$source, r.version=$version, r.updated
    """
    parameters = {**e.model_dump(), "a": a, "b": b}
    await graphdb_base.run_session(query=query, parameters=parameters)


async def upsert_cooccur(e: CoOccurEdge):
    query = """
    MATCH (a:Label {name:$src}), (b:Label {name:$dst})
    MERGE (a)-[r:CO_OCCUR]->(b)
    SET r.w=$w, r.pmi=$pmi, r.count12=$count, r.source=$source, r.updatedAt=datetime()
    """
    paramaters = {**e.model_dump()}
    await graphdb_base.run_session(query=query, parameters=paramaters)


async def upsert_similar(e: SimilarEdge):
    query = """
    MATCH (a:Label {name:$src}), (b:Label {name:$dst})
    MERGE (a)-[r:SIMILAR_TO]->(b)
    SET r.sim=$sim, r.w=coalesce($w,$sim), r.source=$source, r.updatedAt=datetime()
    """
    parameters = {**e.model_dump()}
    await graphdb_base.run_session(query=query, parameters=parameters)


async def upsert_handles(e: HandlesEdge):
    query = """
    MATCH (p:Provider {name:$provider}), (l:Label {name:$label})
    MERGE (p)-[r:HANDLES]->(l)
    SET r.priority=$priority
    """
    parameters = {**e.model_dump()}
    await graphdb_base.run_session(query=query, parameters=parameters)
