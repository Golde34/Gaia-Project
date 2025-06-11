from dataclasses import dataclass
from kernel.config import db_config


@dataclass
class MilvusConfig():
    host: str = db_config.VectorDBConfig.host
    port: str = db_config.VectorDBConfig.port
    user: str = db_config.VectorDBConfig.user
    password: str = db_config.VectorDBConfig.password
    
    database: str = db_config.VectorDBConfig.database
    root_memory_collection: str = db_config.VectorDBConfig.root_memory_collection
    
    index_config: db_config.IndexConfig = db_config.VectorDBConfig.index_config 