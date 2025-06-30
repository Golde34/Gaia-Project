import json

from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv
from typing import List

from kernel.config.kafka_config import KafkaConfig


load_dotenv()
producer_config = KafkaConfig()

async def send_kafka_message(topic: str, msg: List):
    try:
        producer = AIOKafkaProducer(
            bootstrap_servers=producer_config.bootstrap_servers,
        )
        await producer.start()

        try:
            await producer.send_and_wait(topic, kafka_serializer(msg))
        finally:
            await producer.stop()

    except Exception as err:
        print(f"Some Kafka error: {err}")

def kafka_serializer(value):
    return json.dumps(value).encode()