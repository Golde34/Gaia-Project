import asyncio
import json

from aiokafka import AIOKafkaConsumer
from dotenv import load_dotenv

from kernel.config.kafka_config import KafkaConfig
from ui.kafka.update_chat_history_handler import update_recursive_summary_handler 


load_dotenv()
loop = asyncio.get_event_loop()
kafka_config = KafkaConfig()


def encode_json(msg):
    to_load = msg.value.decode("utf-8")
    return json.loads(to_load)


async def consume():
    consumer = AIOKafkaConsumer(
        kafka_config._convert_topics_to_list(kafka_config.topics),
        loop=loop,
        bootstrap_servers=kafka_config.bootstrap_servers,
    )

    try:
        await consumer.start()

    except Exception as e:
        print(e)
        return

    try:
        async for msg in consumer:
            # await kafka_actions[msg.topic](msg)
            print(f"Received message: {msg.topic} - {encode_json(msg)}")
            await kafka_actions[msg.topic](encode_json(msg))

    finally:
        await consumer.stop()


kafka_actions = {
    "update_recursive_summary": update_recursive_summary_handler, 
}

asyncio.create_task(consume())
