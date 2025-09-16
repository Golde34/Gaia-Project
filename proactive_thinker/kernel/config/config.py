from dotenv import load_dotenv
import os

load_dotenv()


class Config:
    GRAPHDB_URI: str = os.getenv("GRAPHDB_URI")
    GRAPHDB_USER: str = os.getenv("GRAPHDB_USER")
    GRAPHDB_PASSWORD: str = os.getenv("GRAPHDB_PASSWORD") 

