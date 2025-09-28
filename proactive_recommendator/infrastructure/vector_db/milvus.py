from pymilvus import CollectionSchema, MilvusClient, DataType
from typing import Any, Dict, List, Optional
import traceback
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

from infrastructure.vector_db.milvus_config import MilvusConfig
from proactive_recommendator.core.service.command_label_service import search_top_n


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

    def _create_partition(self, collection_name: str,  partition_name: str):
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

    def insert_default_data(self, vectors: list, contents: list, metadata_list: list, partition_name: str = None):
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

        return self.insert_data(collection_name=self.config.root_memory_collection, entities=data, partition_name=partition_name)

    def insert_data(self, collection_name: str, entities: List[Dict[str, Any]], partition_name: str = None):
        """
        Insert data into the collection
        """
        try:
            if partition_name:
                self._create_partition(partition_name)

            result = self.client.insert(
                collection_name=collection_name, data=entities, partition_name=partition_name)
            print(
                f"Data inserted into collection '{collection_name}' with result: {result}.")
        except Exception as e:
            print(f"Error inserting data: {e}")

    def search_top_n_default(self, query_embeddings: List[List[float]], top_k: int = 5, partition_name: str = None) -> List[dict]:
        return search_top_n(
            collection_name=self.config.root_memory_collection,
            query_embeddings=query_embeddings,
            output_fields=["content", "metadata"],
            top_k=top_k,
            partition_name=partition_name
        )

    def search_top_n(self, collection_name: str,
                     query_embeddings: List[List[float]],
                     output_fields: List[str],
                     top_k: int = 5,
                     partition_name: str = None) -> List[dict]:
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

    def hybrid_search(
        self,
        collection_name: str,
        query_vector: List[float],
        query_text: str,
        output_fields: List[str],
        top_k: int = 5,
        candidate_k: int = 50,
        anns_field: str = "vector",
        alpha: float = 0.6,
        partition_name: Optional[str] = None,
        search_params: Optional[dict] = None,
        *,
        # NEW: which fields to concatenate for TF-IDF text (default = output_fields)
        doc_fields: Optional[List[str]] = None,
        # NEW: which field to treat as the row identifier if available
        id_field: str = "id",
    ) -> List[List[dict]]:
        """
        Hybrid (app-side) retrieval: dense ANN (Milvus) + lexical TF-IDF + weighted fusion.
        - No hard-coded schema: rows and doc-text are built from user-provided field lists.
        """
        conn = self.client

        # 1) Prepare search params (align metric & nprobe defaults)
        if search_params is None:
            metric = (self.index_params.get(
                "metric_type", "IP") or "IP").upper()
            nlist = int(self.index_params.get(
                "params", {}).get("nlist", 1024) or 1024)
            search_params = {"metric_type": metric,
                             "params": {"nprobe": max(1, nlist // 4)}}
        else:
            metric = (search_params.get("metric_type", "IP") or "IP").upper()

        # 2) Dense ANN to get candidates
        res = conn.search(
            collection_name=collection_name,
            data=[query_vector],
            anns_field=anns_field,
            limit=candidate_k,
            output_fields=output_fields,
            search_params=search_params,
            partition_names=[partition_name] if partition_name else None,
        )
        if not res or not res[0]:
            return [[]]

        hits = res[0]

        # 3) Score helpers: convert returned score/distance to "higher is better"
        def _raw_score(hit):
            v = getattr(hit, "score", None)
            if v is None:
                v = getattr(hit, "distance", None)
            return float(v) if v is not None else 0.0

        def _distance_to_similarity(v: float, metric_: str) -> float:
            m = metric_.upper()
            if m in ("IP", "INNER_PRODUCT"):
                # Inner product: larger is better
                return v
            if m in ("L2", "EUCLIDEAN"):
                # L2: smaller is better -> invert
                return -v
            if m in ("COSINE",):
                # Milvus often returns distance ~ (1 - cosine_sim); smaller is better
                # Robust conversion:
                if 0.0 <= v <= 2.0:
                    return 1.0 - v
                return -v
            # Default: treat as distance -> invert
            return -v

        # 4) Build rows dynamically from output_fields (no hard-coded schema)
        def _extract_from_hit(h, fields: List[str]) -> Dict[str, Any]:
            ent = getattr(h, "entity", None)
            row: Dict[str, Any] = {}
            if ent is not None:
                for f in fields:
                    row[f] = getattr(ent, f, None)
                # also try to include id_field if present at hit-level
                if id_field not in row:
                    row[id_field] = getattr(
                        ent, id_field, getattr(h, id_field, None))
            else:
                # fall back to dict-like access
                for f in fields:
                    row[f] = h.get(f)
                if id_field not in row:
                    row[id_field] = h.get(id_field)
            return row

        rows, dense_sims = [], []
        for h in hits:
            row = _extract_from_hit(h, output_fields)
            raw = _raw_score(h)
            sim = _distance_to_similarity(raw, metric)
            # keep raw dense similarity before normalization
            row["dense_raw"] = sim
            rows.append(row)
            dense_sims.append(sim)

        dense_norm = self._normalize(dense_sims)  # [0,1], higher is better

        # 5) Text features (TF-IDF) with robust stringify and configurable fields
        def _stringify(x) -> str:
            if x is None:
                return ""
            if isinstance(x, (list, tuple, set)):
                return " ".join(str(t) for t in x)
            if isinstance(x, dict):
                return " ".join(f"{k} {v}" for k, v in x.items())
            return str(x)

        # which fields to concatenate for TF-IDF
        text_fields = doc_fields if doc_fields is not None else list(
            output_fields)

        def _build_doc_text(row: dict, fields: Optional[List[str]] = None) -> str:
            use_fields = fields if fields is not None else [
                k for k in row.keys()
                if k not in {"dense_raw", "dense_score_norm", "text_score_norm", "fused_score"}
            ]
            parts = [_stringify(row.get(f)) for f in use_fields]
            return " ".join([p for p in parts if p]).strip()

        doc_texts = [_build_doc_text(r, text_fields) for r in rows]

        # If there is no text at all for TF-IDF, fall back to dense only
        if not any(doc_texts):
            order = sorted(range(len(rows)),
                           key=lambda i: dense_norm[i], reverse=True)[:top_k]
            return [[{**rows[i], "fused_score": dense_norm[i],
                      "dense_score_norm": dense_norm[i], "text_score_norm": 0.0} for i in order]]

        # 6) Compute TF-IDF similarities
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import linear_kernel

        vectorizer = TfidfVectorizer(
            lowercase=True, ngram_range=(1, 2), max_features=100_000)
        tfidf = vectorizer.fit_transform([query_text] + doc_texts)
        q_vec = tfidf[0:1]
        d_mat = tfidf[1:]
        sim = linear_kernel(q_vec, d_mat).ravel().tolist()  # higher is better
        text_norm = self._normalize(sim)

        # 7) Weighted fusion
        fused = [alpha * d + (1 - alpha) * t for d,
                 t in zip(dense_norm, text_norm)]
        order = sorted(range(len(rows)),
                       key=lambda i: fused[i], reverse=True)[:top_k]

        fused_results = []
        for i in order:
            r = rows[i].copy()
            r["fused_score"] = fused[i]
            r["dense_score_norm"] = dense_norm[i]
            r["text_score_norm"] = text_norm[i]
            fused_results.append(r)

        return [fused_results]

    def _normalize(self, scores: List[float]) -> List[float]:
        """
        Min-max normalize to [0,1]. If all scores equal, return zeros.
        """
        if not scores:
            return scores
        mn, mx = min(scores), max(scores)
        if mx - mn < 1e-12:
            return [0.0 for _ in scores]
        return [(s - mn) / (mx - mn) for s in scores]

    def _build_doc_text(self, row: dict, fields: Optional[List[str]] = None) -> str:
        """
        Build a document string from selected fields (no hard-coded keys).
        If `fields` is None, use all keys except internal scoring keys.
        """
        def _stringify(x) -> str:
            if x is None:
                return ""
            if isinstance(x, (list, tuple, set)):
                return " ".join(str(t) for t in x)
            if isinstance(x, dict):
                return " ".join(f"{k} {v}" for k, v in x.items())
            return str(x)

        use_fields = fields if fields is not None else [
            k for k in row.keys()
            if k not in {"dense_raw", "dense_score_norm", "text_score_norm", "fused_score"}
        ]
        parts = [_stringify(row.get(f)) for f in use_fields]
        return " ".join([p for p in parts if p]).strip()

    def search_by_fields(
        self,
        collection_name: str,
        filter_query: str,
        output_fields: Optional[List[str]] = None,
        limit: int = 100
    ) -> List[dict]:
        """
        Search by specific fields with a filter query.
        """
        try:
            results = self.client.query(
                collection_name=collection_name,
                filter_query=filter_query,
                output_fields=output_fields,
                limit=limit
            )
            print(
                f"Search by fields in collection '{collection_name}' with filter '{filter_query}' returned {len(results)} results.")
            return results
        except Exception as e:
            print(f"Error searching by fields: {e}")
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
