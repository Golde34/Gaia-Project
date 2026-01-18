import os


class KafkaConfig:
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9094')
        self.group_id = os.getenv('KAFKA_GROUP_ID', 'proactive-recommendator-group')
        self.topics = os.getenv('KAFKA_TOPICS', 'test')
        self.name = os.getenv('KAFKA_NAME', 'proactive-recommendator-service')
        
def convert_topics_to_list(topics: str = None) -> list:
    if topics :
        return [topic.strip() for topic in topics.split(',')]
    return ['test']
