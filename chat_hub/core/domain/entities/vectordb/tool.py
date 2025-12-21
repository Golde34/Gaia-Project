from typing import List
from pymilvus import CollectionSchema, DataType, MilvusClient

from infrastructure.vector_db.milvus import milvus_db


class ToolVector():
    def __init__(self):
        self.connection_name = "tool_vector"

    def schema_fields(self) -> CollectionSchema:
        schema = MilvusClient.create_schema(
            auto_id=True, enable_dynamic_field=True)
        schema.add_field(field_name="id",
                         datatype=DataType.INT64, is_primary=True)
        schema.add_field(field_name="vector",
                         datatype=DataType.FLOAT_VECTOR, dim=1024)
        schema.add_field(field_name="tool",
                         datatype=DataType.VARCHAR, max_length=255)
        schema.add_field(field_name="description",
                         datatype=DataType.VARCHAR, max_length=65535)
        schema.add_field(field_name="sample_query",
                         datatype=DataType.VARCHAR, max_length=65535)
        return schema

    def insert_data(self, vectors: list, tool: str, description: str, sample_queries: list, partition_name: str = None):
        if not (len(vectors) == len(sample_queries)):
            raise ValueError(
                "Vectors and sample queries must have the same length.")

        data = [
            {
                "vector": vector,
                "tool": tool,
                "description": description,
                "sample_query": sample_query
            }
            for vector, sample_query in zip(vectors, sample_queries)
        ]

        return milvus_db.insert_data(
            collection_name=self.connection_name,
            entities=data,
            partition_name=partition_name
        )

    def search_top_n(self, query_embeddings: List[List[float]], top_k: int = 5, partition_name: str = None) -> List[dict]:
        return milvus_db.search_top_n(
            collection_name=self.connection_name,
            query_embeddings=query_embeddings,
            output_fields=["tool", "description", "sample_query"],
            top_k=top_k,
            partition_name=partition_name
        )


tool_vector_entity = ToolVector()
