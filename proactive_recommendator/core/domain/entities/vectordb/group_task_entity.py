from typing import List

from pymilvus import CollectionSchema, DataType, MilvusClient


class GroupTask():
    def __init__(self, keywords: List[str], example: List[str], metadata: dict):
        self.connection_name = "group_task"
        self.keywords = keywords
        self.example = example
        self.metadata = metadata

    def schema_fields(self) -> CollectionSchema:
        """
        Milvus schema for GroupTask collection.
        Vector embeddings are generated from keywords + example texts.
        """
        schema = MilvusClient.create_schema(
            auto_id=True, enable_dynamic_field=True)
        schema.add_field(field_name="id", 
                         datatype=DataType.VARCHAR, 
                         is_primary=True, max_length=100)
        schema.add_field(field_name="vector",  # Generated from keywords + example
                         datatype=DataType.FLOAT_VECTOR, dim=1024)
        schema.add_field(field_name="user_id",
                         datatype=DataType.INT64, is_partition_key=True)
        schema.add_field(field_name="project_id",
                         datatype=DataType.VARCHAR, max_length=100)
        schema.add_field(field_name="status",
                         datatype=DataType.VARCHAR, max_length=20)
        schema.add_field(field_name="summary",  # Searchable text for group task
                         datatype=DataType.VARCHAR, max_length=5000) 
        schema.add_field(field_name="metadata",
                         datatype=DataType.JSON)
        return schema

    def __repr__(self):
        return f"GroupTask(id={self.id}, user_id={self.user_id}, project_id={self.project_id}, status={self.status}, keywords={self.keywords})"
