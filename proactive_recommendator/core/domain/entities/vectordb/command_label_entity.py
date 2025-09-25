from typing import List

from pymilvus import DataType, MilvusClient


class CommandLabel:
    def __init__(self, connection_name: str, label: str, name: str, keywords: List[str], example: List[str], description: str):
        self.connection_name = connection_name
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

    def schema_fields(self):
        schema = MilvusClient.create_schema(
                    auto_id=True, enable_dynamic_field=True) 
        schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
        schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=1024)
        schema.add_field(field_name="label", datatype=DataType.STRING)
        schema.add_field(field_name="name", datatype=DataType.STRING)
        schema.add_field(field_name="keywords", datatype=DataType.STRING)
        schema.add_field(field_name="description", datatype=DataType.STRING)
        schema.add_field(field_name="example", datatype=DataType.STRING)
        return schema 

    def __repr__(self):
        return f"CommandLabel(connection_name={self.connection_name}, label={self.label}, name={self.name}, keywords={self.keywords}, example={self.example}, description={self.description})"
