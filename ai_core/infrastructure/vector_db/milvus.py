from pymilvus import MilvusClient, DataType
from typing import List
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
        self._create_collection()
        
        self.client.load_collection(collection_name=self.config.root_memory_collection)
        self._initialized = True

    def _connect(self) -> MilvusClient:
        try:
            print(f"Connecting to Milvus at {self.config.host}:{self.config.port} with user {self.config.user}")
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

    def _create_collection(self):
        try:
            if not self.client.has_collection(self.config.root_memory_collection):
                schema = MilvusClient.create_schema(auto_id=True, enable_dynamic_field=True)

                schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
                schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=self.dim)
                schema.add_field(field_name="content", datatype=DataType.VARCHAR, max_length=65535)
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

                self.client.create_index(
                    collection_name=self.config.root_memory_collection,
                    index_params=index_params
                )
                print(f"Collection {self.config.root_memory_collection} created successfully.")
            else:
                print(f"Collection {self.config.root_memory_collection} already exists.")
        except Exception as e:
            print(f"Error creating collection: {e}")
            traceback.print_exc()
            raise e 

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

    def insert_data(self, vectors: list, contents: list, metadata_list: list, partition_name: str = None):
        try:
            if not (len(vectors) == len(contents) == len(metadata_list)):
                raise ValueError("Vectors, contents, and metadata must have the same length.")

            data = [
                {
                    "vector":  vector,
                    "content": content,
                    "metadata": metadata 
                }
                for vector, content, metadata in zip(vectors, contents, metadata_list)
            ]

            if partition_name:
                self._create_partition(partition_name)
            
            result = self.client.insert(
                collection_name=self.config.root_memory_collection,
                data=data,
                partition_name=partition_name
            )
            print(f"Inserted result: {result} into collection {self.config.root_memory_collection}.")

            if partition_name:
                print(f"Inserted into partition {partition_name}.")

            return result
        except Exception as e:
            print(f"Error in insert_data: {e}")
            traceback.print_exc()
            raise e

    def search_top_n(self, query_embeddings: List[List[float]], top_k: int = 5, partition_name: str = None) -> List[dict]:
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

    def search_by_user_id(self, user_id: str, query_embeddings: List[float], top_n: int, suffix: str = "archived"):
        result = {}
        
        for actor in self.partition_actors:
            partition_name = f"{user_id}_{actor}_{suffix}"
            try:
                partition_data = self.search_top_n(
                    partition_name=partition_name,
                    query_embeddings=[query_embeddings],
                    top_k=top_n
                )[0]
                archived_mem = [t['content'] for t in partition_data]
                result[actor] = archived_mem
            except Exception as e:
                pass

        return result

    def get_all_user_content(self, user_id: str, suffix: str = "archieved") -> List[str]:
        all_content = []
        try:
            for actor in self.partition_actors:
                partition_name = f"{user_id}_{actor}_{suffix}"
                if not self.client.has_partition(self.config.root_memory_collection, partition_name=partition_name):
                    continue
                
                query_results = self.client.query(
                    collection_name=self.config.root_memory_collection,
                    partition_names=[partition_name],
                    output_fields=["content"],
                    limit=1000  # Adjust limit as needed
                )

                partition_content = [
                    result.get("content", "") for result in query_results
                ]
                all_content[actor] = partition_content
                
            return all_content
        except Exception as e:
            print(f"Error in get_all_user_content: {e}")
            traceback.print_exc()
            raise e
        
    def delete_by_ids(self, ids: List[int], partition_name: str):
        print(f"Deleting id: {ids}")
        if ids:
            try:
                if not self.client.has_partition(
                    collection_name=self.config.root_memory_collection,
                    partition_name=partition_name
                ):
                    raise ValueError(f"Partition {partition_name} does not exist in collection {self.config.root_memory_collection}.")

                self.client.delete(
                    collection_name=self.config.root_memory_collection,
                    partition_name=partition_name,
                    ids=ids
                )

                print(f"Deleted {len(ids)} records from partition {partition_name}.")
            except Exception as e:
                print(f"Error in delete_by_ids: {e}")
                traceback.print_exc()
                raise e

    def get_all_contexts(self, partition_name: str = "default_context") -> List[dict]:
        try:
            if not self.client.has_partition(self.config.root_memory_collection, partition_name=partition_name):
                return []

            query_results = self.client.query(
                collection_name=self.config.root_memory_collection,
                partition_names=[partition_name],
                output_fields=["content", "metadata"],
                limit=1000
            )

            return query_results
        except Exception as e:
            print(f"Error in get_all_contexts: {e}")
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