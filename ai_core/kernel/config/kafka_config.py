import os


class KafkaConfig:
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.group_id = os.getenv('KAFKA_GROUP_ID', 'ai_core')
        self.topics = os.getenv('KAFKA_TOPICS', 'test')
        self.name = os.getenv('KAFKA_NAME', 'ai_core_consumer')
        
    def _convert_topics_to_list(self):
        if self.topics:
            return [topic.strip() for topic in self.topics.split(',')]
        return ['test']
