from typing import List
from core.domain.entities.vectordb.command_label_entity import CommandLabel
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db


empty_command_label = CommandLabel(label="", name="", keywords=[], example=[], description="")

async def insert_command_label(entity: CommandLabel = None) -> CommandLabel: 
    command_label_schema = entity.schema_fields()

    milvus_db.create_collection_if_not_exists(
        entity.connection_name, schema=command_label_schema)

    texts_to_embed = entity.keywords + entity.example
    embeddings = await embedding_model.get_embeddings(texts_to_embed)

    data_to_insert = []
    for i, text in enumerate(texts_to_embed):
        data_to_insert.append({
            "vector": embeddings[i],
            "label": entity.label,
            "name": entity.name,
            "keywords": ", ".join(entity.keywords),
            "example": text,
            "description": entity.description,
        })

    milvus_db.insert_data(entity.connection_name, data_to_insert)

    return entity


async def query(query: str) -> CommandLabel:
    dense_vec_list = await embedding_model.get_embeddings([query])
    dense_vec = dense_vec_list[0] if isinstance(
        dense_vec_list, list) else dense_vec_list

    results = milvus_db.hybrid_search(
        collection_name=empty_command_label.connection_name,
        query_vector=dense_vec,
        query_text=query,
        top_k=5,
        candidate_k=50,
        anns_field="vector",
        output_fields=["label", "name", "keywords", "description", "example"],
        alpha=0.6,
    )

    chosen = results[0][0]
    return CommandLabel(
        label=chosen.get("label", ""),
        name=chosen.get("name", ""),
        keywords=(chosen.get("keywords", "") or "").split(", "),
        example=[chosen.get("example", "")],
        description=chosen.get("description", "")
    )
    
async def get_command_label(label: str) -> List[CommandLabel] | None:
    query_parts = []
    query_parts.append(f'label == "{label}"')
    filter_query = " and ".join(query_parts) if query_parts else None

    results = milvus_db.search_by_fields(
        collection_name=empty_command_label.connection_name,
        filter_query=filter_query,
        output_fields=["label", "name", "keywords", "description", "example"])

    if not results:
        return None

    return results 