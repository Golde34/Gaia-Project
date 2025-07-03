from aiokafka import AIOKafkaConsumer
from dotenv import load_dotenv

from core.domain.enums.kafka_enum import KafkaTopic
from kernel.config.kafka_config import KafkaConfig, convert_topics_to_list 
from ui.kafka.update_chat_history_handler import update_recursive_summary_handler 


load_dotenv()
kafka_config = KafkaConfig()

async def consume():
    consumer = AIOKafkaConsumer(
        bootstrap_servers=kafka_config.bootstrap_servers,
        group_id=kafka_config.group_id,
    )
    consumer.subscribe(topics=convert_topics_to_list(kafka_config.topics))
    try:
        print(f"Starting Kafka consumer for topics: {kafka_config.topics}")
        await consumer.start()

    except Exception as e:
        print(e)
        return

    try:
        async for msg in consumer:
            print(f"Received message: {msg.topic} - {msg}")
            await kafka_actions[msg.topic](msg)

    finally:
        await consumer.stop()


kafka_actions = {
    KafkaTopic.UPDATE_RECURSIVE_SUMMARY.value: update_recursive_summary_handler, 
}
