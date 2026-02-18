from typing import List
from pymilvus import CollectionSchema, DataType, MilvusClient

from infrastructure.vector_db.milvus import milvus_db


class STAGEngity():
    def __init__(self):
        self.connection_name = "stag_entity"
        self.dim = 1024

    def schema_fields(self) -> CollectionSchema:
        schema = MilvusClient.create_schema(
            auto_id=True, enable_dynamic_field=True)
        schema.add_field(field_name="id",
                         datatype=DataType.INT64, is_primary=True)
        schema.add_field(field_name="user_id",
                         datatype=DataType.VARCHAR,
                         max_length=64, is_partition_key=True)
        schema.add_field(field_name="node_id",
                         datatype=DataType.VARCHAR,
                         max_length=64)
        schema.add_field(field_name="topic",
                         datatype=DataType.VARCHAR)
        schema.add_field(field_name="wbos_mask",
                         datatype=DataType.INT16)
        schema.add_field(field_name="wbos_type",
                         datatype=DataType.VARCHAR)
        schema.add_field(field_name="vector",
                         datatype=DataType.FLOAT_VECTOR, dim=self.dim)
        schema.add_field(field_name="content",
                         datatype=DataType.VARCHAR)
        schema.add_field(field_name="timestamp",
                         datatype=DataType.INT64)
        return schema

    def create_collection(self):
        schema = self.schema_fields()
        index_params = MilvusClient.prepare_index_params()

        index_params.add_index(
            field_name="topic",
            index_name="topic_index"
        )
        milvus_db.create_collection_if_not_exists(
            collection_name=self.connection_name,
            schema=schema,
            index_params=index_params
        )

    def insert_data(
        self, 
        user_id: str, 
        node_id: str, 
        topic: str, 
        wbos_mask: int, 
        wbos_type: str, 
        vector: List[float], 
        content: str, 
        timestamp: int):
        data = [{
            "user_id": user_id,
            "node_id": node_id,
            "topic": topic,
            "wbos_mask": wbos_mask,
            "wbos_type": wbos_type,
            "vector": vector,
            "content": content,
            "timestamp": timestamp
        }]
        return milvus_db.insert_data(
            collection_name=self.connection_name,
            entities=data
        ) 

    def search_top_n(self, query_embeddings: List[List[float]], top_k: int = 5, topic: str = None) -> List[dict]:
        output_fields = ["user_id", "node_id", "topic", "wbos_mask", "wbos_type", "content", "timestamp"]
        filter_expression = f'topic == "{topic}"' if topic else None

        return milvus_db.search_top_n(
            collection_name=self.connection_name,
            query_embeddings=query_embeddings,
            output_fields=output_fields,
            top_k=top_k,
            filter_expression=filter_expression
        )

stag_entity = STAGEngity()
