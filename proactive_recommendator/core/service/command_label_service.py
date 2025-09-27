from core.domain.entities.vectordb.command_label_entity import CommandLabel
from infrastructure.embedding.base_embedding import embedding_model 
from infrastructure.vector_db.milvus import milvus_db


async def insert_command_label():
    entity = CommandLabel(
        label="create_task",
        name="Create Task",
        keywords=["create task", "generate task", "insert task", "task creation", "job creation", "add task", "todo", "add job", "create todo"],
        example=[
            "Create a task to complete the project report by next Monday.",
            "Generate a new task for the team to review the budget proposal.",
            "Insert a task in my to-do list to call the client tomorrow.",
            "Add a task to schedule a meeting with the marketing team.",
            "Create a task for the development team to fix the login bug.",
            "Generate a task to update the website content by the end of the week.",
            "Insert a task to prepare the presentation for the upcoming conference.",
            "Add a task to follow up with the supplier about the order status.",
        ],
        description="This command is used to create a new task in the task management system."
    )
    command_label_schema = entity.schema_fields()

    milvus_db.create_collection_if_not_exists(entity.connection_name, schema=command_label_schema)

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