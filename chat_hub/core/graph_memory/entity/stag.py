from typing import List
from pymilvus import CollectionSchema, DataType, MilvusClient

from infrastructure.vector_db.milvus import milvus_db


class STAGEngity():
    def __init__(self):
        self.connection_name = "stag_entity"
        self.dim = 1024

    def schema_fields(self) -> CollectionSchema:
        schema = MilvusClient.create_schema(
            auto_id=False, enable_dynamic_field=True)
        schema.add_field(field_name="user_id",
                         datatype=DataType.VARCHAR,
                         max_length=64, is_partition_key=True)
        schema.add_field(field_name="vector",
                         datatype=DataType.FLOAT_VECTOR, dim=self.dim)
        schema.add_field(field_name="topic",
                         datatype=DataType.VARCHAR)
        schema.add_field(field_name="wbos_mask",
                         datatype=DataType.INT16)
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

stag_entity = STAGEngity()
