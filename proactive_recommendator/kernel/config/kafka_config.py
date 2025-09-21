import os


class KafkaConfig:
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.group_id = os.getenv('KAFKA_GROUP_ID', 'proactive_recommendator_group')
        self.topics = os.getenv('KAFKA_TOPICS', 'test')
        self.name = os.getenv('KAFKA_NAME', 'proactive_recommendator_service')
        
def convert_topics_to_list(topics: str = None) -> list:
    if topics :
        return [topic.strip() for topic in topics.split(',')]
    return ['test']
