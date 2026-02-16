from pymilvus import MilvusClient, DataType
from pymilvus.milvus_client.index import IndexParams
from typing import Any, Dict, List
import traceback

from infrastructure.vector_db.milvus_config import MilvusConfig


class MilvusDB:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MilvusDB, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.config = MilvusConfig()
        self.dim = self.config.index_config.index_params.nlist
        self.index_params = {
            "index_type": self.config.index_config.index_type,
            "metric_type": self.config.index_config.metric_type,
            "params": {
                "nlist": self.config.index_config.index_params.nlist
            }
        }

        self.partition_actors = ["user", 'assistant']

        self.client = self._connect()
        self._create_default_connection()

        self.client.load_collection(
            collection_name=self.config.root_memory_collection)
        self._initialized = True

    def _connect(self) -> MilvusClient:
        try:
            print(
                f"Connecting to Milvus at {self.config.host}:{self.config.port} with user {self.config.user}")
            # First connect to default database
            client = MilvusClient(
                uri=f'http://{self.config.host}:{self.config.port}',
                token=f"{self.config.user}:{self.config.password}",
                db_name="default"
            )

            databases = client.list_databases()
            if self.config.database not in databases:
                client.create_database(self.config.database)
                print(f"Database {self.config.database} created successfully.")

            client = MilvusClient(
                uri=f'http://{self.config.host}:{self.config.port}',
                token=f"{self.config.user}:{self.config.password}",
                db_name=self.config.database
            )

            print(f"Connected to Milvus database: {self.config.database}")
            return client
        except Exception as e:
            raise e

    def _create_default_connection(self) -> MilvusClient:
        schema = MilvusClient.create_schema(
            auto_id=True, enable_dynamic_field=True)
        schema.add_field(
            field_name="id", datatype=DataType.INT64, is_primary=True)
        schema.add_field(field_name="vector",
                         datatype=DataType.FLOAT_VECTOR, dim=self.dim)
        schema.add_field(field_name="content",
                         datatype=DataType.VARCHAR, max_length=65535)
        schema.add_field(field_name="metadata", datatype=DataType.JSON)

        return self.create_collection_if_not_exists(self.config.root_memory_collection, schema)

    def create_collection_if_not_exists(
        self, 
        collection_name: str, 
        schema: any, 
        index_params: IndexParams = None):
        """
        Create collection if it does not exist.
        """
        try:
            if not self.client.has_collection(collection_name=collection_name):
                self.client.create_collection(
                    collection_name=collection_name,
                    schema=schema,
                    consistency_level="Strong",
                )

                # Create index
                if index_params is None:
                    index_params = self.client.prepare_index_params()

                index_params.add_index(
                    field_name="vector",
                    index_type=self.config.index_config.index_type,
                    metric_type=self.config.index_config.metric_type,
                    params={"nlist": self.index_params["params"]["nlist"]}
                )

                self.client.create_index(
                    collection_name=collection_name,
                    index_params=index_params
                )
                print(
                    f"Collection {collection_name} created successfully.")

                self.client.load_collection(collection_name=collection_name)
            else:
                print(
                    f"Collection {collection_name} already exists.")
        except Exception as e:
            print(f"Collection '{collection_name}' error.")

    def _create_partition(self, partition_name: str):
        try:
            if not self.client.has_partition(
                collection_name=self.config.root_memory_collection,
                partition_name=partition_name
            ):
                self.client.create_partition(
                    collection_name=self.config.root_memory_collection,
                    partition_name=partition_name
                )
                print(f"Partition {partition_name} created successfully.")
            else:
                pass
        except Exception as e:
            print(f"Error creating partition {partition_name}: {e}")
            traceback.print_exc()
            raise e

    def insert_data(self, collection_name: str, entities: List[Dict[str, Any]], partition_name: str = None):
        """
        Insert data into the collection
        """
        try:
            if partition_name:
                self._create_partition(partition_name)

            result = self.client.insert(
                collection_name=collection_name, 
                data=entities, 
                partition_name=partition_name
            )
            print(
                f"Data inserted into collection '{collection_name}' with result: {result}.")
        except Exception as e:
            print(f"Error inserting data: {e}")

    def search_top_n(self, collection_name: str,
                     query_embeddings: List[List[float]],
                     output_fields: List[str],
                     top_k: int = 5,
                     partition_name: str = None) -> List[dict]:
        """
        Search top N similar vectors in the collection
        """
        try:
            search_params = {
                "metric_type": self.index_params["metric_type"],
                "params": {
                    "nprobe": self.index_params["params"]["nlist"] // 4
                }
            }

            search_results = self.client.search(
                collection_name=collection_name,
                data=query_embeddings,
                output_fields=output_fields,
                field_name="vector",
                search_params=search_params,
                limit=top_k,
                partition_names=[partition_name] if partition_name else None
            )

            formatted_results = []
            for hits in search_results:
                matches = []
                for hit in hits:
                    matches.append(hit)
                formatted_results.append(matches)

            return formatted_results
        except Exception as e:
            print(f"Error in search_top_n: {e}")
            traceback.print_exc()
            raise e

    def delete_by_ids(self, ids: List[int], partition_name: str, collection_name: str = None):
        print(f"Deleting id: {ids}")
        if ids:
            if collection_name is None:
                collection_name = self.config.root_memory_collection
            try:
                if not self.client.has_partition(
                    collection_name=collection_name,
                    partition_name=partition_name
                ):
                    raise ValueError(
                        f"Partition {partition_name} does not exist in collection {collection_name}.")

                self.client.delete(
                    collection_name=collection_name,
                    partition_name=partition_name,
                    ids=ids
                )

                print(
                    f"Deleted {len(ids)} records from partition {partition_name} in collection {collection_name}.")
            except Exception as e:
                print(f"Error in delete_by_ids: {e}")
                traceback.print_exc()
                raise e

    def close(self):
        try:
            self.client.close()
            print("Connection to Milvus closed.")
        except Exception as e:
            print(f"Error closing connection: {e}")
            traceback.print_exc()
            raise e


# Global instance for easy access across modules
milvus_db = MilvusDB()
