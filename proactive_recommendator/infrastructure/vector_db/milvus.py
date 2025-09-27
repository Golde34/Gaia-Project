from pymilvus import CollectionSchema, MilvusClient, DataType
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
        # Create default collection for other information
        self._create_default_collection()

        self._initialized = True

    def _connect(self) -> MilvusClient:
        try:
            print(
                f"Connecting to Milvus at {self.config.host}:{self.config.port} with user {self.config.user}")
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

    def _create_default_collection(self):
        try:
            if not self.client.has_collection(self.config.root_memory_collection):
                schema = MilvusClient.create_schema(
                    auto_id=True, enable_dynamic_field=True)

                schema.add_field(
                    field_name="id", datatype=DataType.INT64, is_primary=True)
                schema.add_field(field_name="vector",
                                 datatype=DataType.FLOAT_VECTOR, dim=self.dim)
                schema.add_field(field_name="content",
                                 datatype=DataType.VARCHAR, max_length=65535)
                schema.add_field(field_name="metadata", datatype=DataType.JSON)

                self.client.create_collection(
                    collection_name=self.config.root_memory_collection,
                    schema=schema,
                    consistency_level="Strong",
                )

                # Create index
                index_params = self.client.prepare_index_params()

                index_params.add_index(
                    field_name="vector",
                    index_type=self.config.index_config.index_type,
                    metric_type=self.config.index_config.metric_type,
                    params={"nlist": self.index_params["params"]["nlist"]}
                )

                index_params.add_index(
                    field_name="sparse_vector",
                    index_type="SPARE_INVERTED_INDEX",
                )

                self.client.create_index(
                    collection_name=self.config.root_memory_collection,
                    index_params=index_params
                )
                print(
                    f"Collection {self.config.root_memory_collection} created successfully.")
            else:
                print(
                    f"Collection {self.config.root_memory_collection} already exists.")
        except Exception as e:
            print(f"Error creating collection: {e}")
            traceback.print_exc()
            raise e

    def _create_default_partition(self, partition_name: str):
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

    def insert_default_data(self, vectors: list, contents: list, metadata_list: list, partition_name: str = None):
        try:
            if not (len(vectors) == len(contents) == len(metadata_list)):
                raise ValueError(
                    "Vectors, contents, and metadata must have the same length.")

            data = [
                {
                    "vector":  vector,
                    "content": content,
                    "metadata": metadata
                }
                for vector, content, metadata in zip(vectors, contents, metadata_list)
            ]

            if partition_name:
                self._create_default_partition(partition_name)

            result = self.client.insert(
                collection_name=self.config.root_memory_collection,
                data=data,
                partition_name=partition_name
            )
            print(
                f"Inserted result: {result} into collection {self.config.root_memory_collection}.")

            if partition_name:
                print(f"Inserted into partition {partition_name}.")

            return result
        except Exception as e:
            print(f"Error in insert_data: {e}")
            traceback.print_exc()
            raise e

    def search_top_n_default(self, query_embeddings: List[List[float]], top_k: int = 5, partition_name: str = None) -> List[dict]:
        try:
            if not self.client.has_partition(
                collection_name=self.config.root_memory_collection,
                partition_name=partition_name
            ):
                return []

            search_params = {
                "metric_type": self.index_params["metric_type"],
                "params": {
                    "nprobe": self.index_params["params"]["nlist"] // 4
                }
            }

            output_fields = ["content", "metadata"]

            search_results = self.client.search(
                collection_name=self.config.root_memory_collection,
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
                    match = {
                        "id": hit["id"],
                        "distance": hit["distance"],
                        "content": hit["entity"].get("content"),
                        "metadata": hit["entity"].get("metadata")
                    }
                    matches.append(match)
                formatted_results.append(matches)

            return formatted_results
        except Exception as e:
            print(f"Error in search_top_n: {e}")
            traceback.print_exc()
            raise e

    def create_collection_if_not_exists(self, collection_name: str, schema: CollectionSchema):
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

    def insert_data(self, collection_name: str, entities: List[Dict[str, Any]], partition_name: str = None):
        """
        Insert data into the collection
        """
        try:
            if partition_name:
                self._create_partition(partition_name)

            result = self.client.insert(
                collection_name=collection_name, data=entities, partition_name=partition_name)
            print(f"Data inserted into collection '{collection_name}' with result: {result}.")
        except Exception as e:
            print(f"Error inserting data: {e}")

    def _create_partition(self, collection_name:str,  partition_name: str):
        try:
            if not self.client.has_partition(
                collection_name=collection_name,
                partition_name=partition_name
            ):
                self.client.create_partition(
                    collection_name=collection_name,
                    partition_name=partition_name
                )
                print(f"Partition {partition_name} created successfully.")
            else:
                pass
        except Exception as e:
            print(f"Error creating partition {partition_name}: {e}")
            traceback.print_exc()
            raise e

    def update_data(self, collection_name: str, entity_id: int, updated_values: Dict[str, Any]):
        """
        Update data in a collection by entity id
        """
        try:
            # Fetch current data first and update
            current_entity = self.client.get_entity_by_id(
                collection_name, entity_id)
            # Update data
            updated_entity = {**current_entity, **updated_values}
            self.client.update(collection_name, entity_id, updated_entity)
            print(f"Entity with ID {entity_id} updated.")
        except Exception as e:
            print(f"Error updating data: {e}")

    def delete_data(self, collection_name: str, entity_id: int):
        """
        Delete data from a collection by entity id
        """
        try:
            self.client.delete(collection_name, entity_ids=[entity_id])
            print(f"Entity with ID {entity_id} deleted.")
        except Exception as e:
            print(f"Error deleting data: {e}")

    def hybrid_search(self, collection_name: str, query_vector: List[float], top_k: int, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Perform hybrid search (vector + textual search) on the collection.
        """
        try:
            # You can combine vector search with keyword-based search using the 'bool' query
            results = self.client.search(
                collection_name=collection_name, query_vector=query_vector, top_k=top_k, params=search_params)
            return results
        except Exception as e:
            print(f"Error during hybrid search: {e}")
            return []

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
