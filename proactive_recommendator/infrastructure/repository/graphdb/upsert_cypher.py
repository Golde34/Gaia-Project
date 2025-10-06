from neo4j import AsyncGraphDatabase

from core.domain.entities.graphdb.label_node_entity import CoOccurEdge, ExcludesEdge, HandlesEdge, LabelNode, ProviderNode, RequiresEdge, SimilarEdge

async def upsert_label(session, l: LabelNode):
    await session.run(
        """
        MERGE (x:Label {name:$name})
        ON CREATE SET x.type=$type, x.aliases=$aliases, x.description=$description,
                      x.version=$version, x.active=$active, x.metadata=$metadata
        ON MATCH  SET x.type=$type, x.aliases=$aliases, x.description=$description,
                      x.version=$version, x.active=$active, x.metadata=$metadata
        """,
        name=l.name, type=l.type, aliases=l.aliases, description=l.description,
        version=l.version, active=l.active, metadata=l.metadata
    )

async def upsert_provider(session, p: ProviderNode):
    await session.run(
        """
        MERGE (x:Provider {name:$name})
        ON CREATE SET x.description=$description, x.active=$active, x.metadata=$metadata
        ON MATCH  SET x.description=$description, x.active=$active, x.metadata=$metadata
        """,
        **p.model_dump()
    )

async def upsert_requires(session, e: RequiresEdge):
    await session.run(
        """
        MATCH (a:Label {name:$src}), (b:Label {name:$dst})
        MERGE (a)-[r:REQUIRES]->(b)
        SET r.w=$w, r.source=$source, r.version=$version, r.updatedAt=datetime()
        """, **e.model_dump()
    )

async def upsert_excludes(session, e: ExcludesEdge):
    # ensure a<b to avoid duplicates (vô hướng)
    a, b = sorted([e.a, e.b])
    await session.run(
        """
        MATCH (x:Label {name:$a}), (y:Label {name:$b})
        MERGE (x)-[r:EXCLUDES]-(y)
        SET r.w=$w, r.source=$source, r.version=$version, r.updatedAt=datetime()
        """, a=a, b=b, w=e.w, source=e.source, version=e.version
    )

async def upsert_cooccur(session, e: CoOccurEdge):
    await session.run(
        """
        MATCH (a:Label {name:$src}), (b:Label {name:$dst})
        MERGE (a)-[r:CO_OCCUR]->(b)
        SET r.w=$w, r.pmi=$pmi, r.count12=$count12, r.source=$source, r.updatedAt=datetime()
        """, **e.model_dump()
    )

async def upsert_similar(session, e: SimilarEdge):
    await session.run(
        """
        MATCH (a:Label {name:$src}), (b:Label {name:$dst})
        MERGE (a)-[r:SIMILAR_TO]->(b)
        SET r.sim=$sim, r.w=coalesce($w,$sim), r.source=$source, r.updatedAt=datetime()
        """, **e.model_dump()
    )

async def upsert_handles(session, e: HandlesEdge):
    await session.run(
        """
        MATCH (p:Provider {name:$provider}), (l:Label {name:$label})
        MERGE (p)-[r:HANDLES]->(l)
        SET r.priority=$priority
        """, **e.model_dump()
    )
