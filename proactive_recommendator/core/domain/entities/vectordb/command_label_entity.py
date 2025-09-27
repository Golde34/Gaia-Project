from typing import List

from pymilvus import CollectionSchema, DataType, MilvusClient


class CommandLabel:
    def __init__(self, label: str, name: str, keywords: List[str], example: List[str], description: str):
        self.connection_name = "commandlabel" 
        self.label = label
        self.name = name
        self.keywords = keywords
        self.example = example
        self.description = description

    def to_dict(self):
        return {
            "label": self.label,
            "name": self.name,
            "keywords": ", ".join(self.keywords),
            "example": ", ".join(self.example),
            "description": self.description
        }

    def schema_fields(self) -> CollectionSchema:
        schema = MilvusClient.create_schema(
                    auto_id=True, enable_dynamic_field=True) 
        schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
        schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=1024)
        schema.add_field(field_name="spare_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)
        schema.add_field(field_name="label", datatype=DataType.VARCHAR, max_length=65535)
        schema.add_field(field_name="name", datatype=DataType.VARCHAR, max_length=65535)
        schema.add_field(field_name="keywords", datatype=DataType.VARCHAR, max_length=65535)
        schema.add_field(field_name="description", datatype=DataType.VARCHAR, max_length=65535)
        schema.add_field(field_name="example", datatype=DataType.VARCHAR, max_length=65535)
        return schema 

    def __repr__(self):
        return f"CommandLabel(connection_name={self.connection_name}, label={self.label}, name={self.name}, keywords={self.keywords}, example={self.example}, description={self.description})"
