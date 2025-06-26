from dataclasses import dataclass
from kernel.config import db_config


config = db_config.VectorDBConfig()

@dataclass
class MilvusConfig():
    host: str = config.host
    port: str = config.port
    user: str = config.user
    password: str = config.password
    
    database: str = config.database
    root_memory_collection: str = config.root_memory_collection
    
    index_config: db_config.IndexConfig = config.index_config 