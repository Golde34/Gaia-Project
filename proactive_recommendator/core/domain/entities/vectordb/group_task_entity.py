from typing import List

from pymilvus import CollectionSchema, DataType, MilvusClient


class GroupTask():
    def __init__(self, label: str, name: str, keywords: List[str], example: List[str], description: str):
        self.connection_name = "group_task"
        self.label = label
        self.name = name
        self.keywords = keywords
        self.example = example
        self.description = description

    def schema_fields(self) -> CollectionSchema:
        schema = MilvusClient.create_schema(
            auto_id=True, enable_dynamic_field=True)
        schema.add_field(field_name="id", 
                         datatype=DataType.VARCHAR, 
                         is_primary=True, max_length=100)
        schema.add_field(field_name="vector",
                         datatype=DataType.FLOAT_VECTOR, dim=1024)
        schema.add_field(field_name="user_id",
                         datatype=DataType.INT64, is_partition_key=True)
        schema.add_field(field_name="project_id",
                         datatype=DataType.VARCHAR, max_length=100)
        schema.add_field(field_name="status",
                         datatype=DataType.VARCHAR, max_length=20)
        schema.add_field(field_name="summary",
                         datatype=DataType.VARCHAR, max_length=5000) 
        schema.add_field(field_name="metadata",
                         datatype=DataType.JSON)
        return schema

    def __repr__(self):
        return f"GroupTask(connection_name={self.connection_name}, label={self.label}, name={self.name}, keywords={self.keywords}, example={self.example}, description={self.description})"
