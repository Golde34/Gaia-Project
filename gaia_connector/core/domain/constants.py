from dotenv import load_dotenv
import os


load_dotenv()

class Constants:
    class KafkaTopic:
        CREATE_TASK_TOPIC = os.getenv("KAFKA_TOPICS.CREATE_TASK_TOPIC")
        OPEN_CAMERA_SPACE = os.getenv("KAFKA_TOPICS.OPEN_CAMERA_SPACE")
        CLOSE_CAMERA_SPACE = os.getenv("KAFKA_TOPICS.CLOSE_CAMERA_SPACE")
        UPLOAD_RAG_FILE = os.getenv("KAFKA_TOPICS.UPLOAD_RAG_FILE")
        
    class StringConstants:
        status = "status"
        response = "response" 
        message = "message"

    class KafkaCommand:
        GAIA_CREATE_TASK = "gaiaCreateTask"
        GAIA_INIT_UPLOAD_FILE = "gaiaInitUploadFile"
        GAIA_FAILED_UPLOAD_FILE = "gaiaFailedUploadFile"

    class FileExtensions:
        ALLOWED_EXTENSIONS = {'txt', 'pdf', 'json', 'csv', 'xlsx', 'xls', 'doc', 'docx'}
        LOCAL_RESOURCE = "resources/local_storage"
        LOCAL_DATALAKE = "../data_lake/rag_files"

    class Status: 
        INIT = "INIT"
        SUCCESS = "SUCCESS"
        ERROR = "ERROR"
        TIMEOUT = "TIMEOUT"
        FAILED = "FAILED"

    class BucketName:
        LOCAL = "local"
        S3 = "s3"
        HADOOP = "hadoop"