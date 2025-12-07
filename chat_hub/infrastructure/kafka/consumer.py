from aiokafka import AIOKafkaConsumer
from dotenv import load_dotenv

from core.domain.enums.kafka_enum import KafkaTopic
from kernel.config.kafka_config import KafkaConfig, convert_topics_to_list 
from ui.kafka.update_chat_history_handler import (
    update_long_term_memory_handler,
    update_recursive_summary_handler,
)
from ui.kafka.message_handler import register_calendar_schedule_handler
from ui.kafka.task_status_handler import update_parallel_task_status_handler


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
    KafkaTopic.UPDATE_LONG_TERM_MEMORY.value: update_long_term_memory_handler,
    KafkaTopic.REGISTER_CALENDAR_SCHEDULE.value: register_calendar_schedule_handler,
    KafkaTopic.ABILITY_TASK_RESULT.value: update_parallel_task_status_handler,
}
