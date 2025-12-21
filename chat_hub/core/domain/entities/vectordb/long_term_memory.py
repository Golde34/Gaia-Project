from typing import List
from pymilvus import CollectionSchema, DataType, MilvusClient

from infrastructure.vector_db.milvus import milvus_db


class LongTermMemory():
    def __init__(self):
        self.connection_name = "long_term_memory"

    def schema_fields(self) -> CollectionSchema:
        schema = MilvusClient.create_schema(
            auto_id=True, enable_dynamic_field=True)
        schema.add_field(field_name="id",
                         datatype=DataType.INT64, is_primary=True)
        schema.add_field(field_name="vector",
                         datatype=DataType.FLOAT_VECTOR, dim=1024)
        schema.add_field(field_name="semantic_memory",
                         datatype=DataType.VARCHAR, max_length=65535)
        schema.add_field(field_name="metadata",
                         datatype=DataType.JSON)
        return schema

    def insert_data(self, vectors: list, contents: list, metadata_list: list, partition_name: str = None):
        if not (len(vectors) == len(contents) == len(metadata_list)):
            raise ValueError(
                "Vectors, semantic memories, and metadata must have the same length.")

        data = [
            {
                "vector":  vector,
                "semantic_memory": semantic_memory,
                "metadata": metadata
            }
            for vector, semantic_memory, metadata in zip(vectors, contents, metadata_list)
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
            output_fields=["semantic_memory", "metadata"],
            top_k=top_k,
            partition_name=partition_name
        )


long_term_memory_entity = LongTermMemory()
