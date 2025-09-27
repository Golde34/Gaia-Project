from re import I
from typing import List
from core.domain.entities.vectordb.command_label_entity import CommandLabel
from infrastructure.embedding.base_embedding import embedding_model
from infrastructure.vector_db.milvus import milvus_db


async def insert_command_label():
    entity = CommandLabel(
        label="list_task",
        name="List Task",
        keywords=["list task", "show tasks", "view tasks", "display tasks", "get tasks", "fetch tasks", "retrieve tasks"],
        example=[
            "list all tasks",
            "show me my tasks",
            "display tasks for today",
            "get tasks assigned to me",
            "fetch tasks due this week",
            "retrieve all pending tasks",
            "list tasks with high priority",
            "show tasks created by John",
            "display completed tasks",
            "get tasks in project Gaia"
        ],
        description="This command is used to list all tasks assigned to the user or within a specific project."
    )
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
        collection_name=CommandLabel(label="", name="", keywords=[], example=[], description="").connection_name,
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
    
async def get_command_label(command_label: CommandLabel) -> List[CommandLabel] | None:
    query_parts = []
    if command_label.label:
        query_parts.append(f'label == "{command_label.label}"')
    if command_label.name:
        query_parts.append(f'name == "{command_label.name}"')
    if command_label.description:
        query_parts.append(f'description == "{command_label.description}"')
    if command_label.keywords:
        for kw in command_label.keywords:
            query_parts.append(f'keywords == "{kw}"')
    if command_label.example:
        for ex in command_label.example:
            query_parts.append(f'example == "{ex}"')

    filter_query = " and ".join(query_parts) if query_parts else None

    results = milvus_db.search_by_fields(
        collection_name=command_label.connection_name,
        filter_query=filter_query,
        output_fields=["label", "name", "keywords", "description", "example"])

    if not results:
        return None

    return results 