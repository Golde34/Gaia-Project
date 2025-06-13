import os

       
class IndexParams:
    def __init__(self):
        self.nlist = int(os.getenv('VECTOR_DB_NLIST', 100))
        
class IndexConfig:
    def __init__(self):
        self.index_type = os.getenv('VECTOR_DB_INDEX_TYPE', 'IVF_FLAT')
        self.metric_type = os.getenv('VECTOR_DB_METRIC_TYPE', 'L2')
        self.index_params = IndexParams()
        
class VectorDBConfig:
    def __init__(self):
        self.host = os.getenv('VECTOR_DB_HOST', 'localhost')
        self.port = os.getenv('VECTOR_DB_PORT', '5432')
        self.user = os.getenv('VECTOR_DB_USER', 'user')
        self.password = os.getenv('VECTOR_DB_PASSWORD', 'password')
        self.database = os.getenv('VECTOR_DB_DATABASE', 'vector_db')
        self.root_memory_collection = os.getenv('VECTOR_DB_ROOT_MEMORY_COLLECTION', 'root_memory')
 
        self.index_config = IndexConfig()
