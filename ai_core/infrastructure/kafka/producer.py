from datetime import date, datetime
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

async def publish_message(topic: str, cmd: str, data):
    try:
        message = build_message(cmd, '00', 'Success', data)
        await send_kafka_message(topic, message)
    except Exception as e:
        print(f"Exception when publishing message to topic: {e}")
    return "Published message to topic: " + topic

def build_message(cmd, error_code, error_message, message):
    display_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    kafka_message = {
        "cmd": cmd,
        "errorCode": error_code,
        "errorMessage": error_message,
        "displayTime": display_time,
        "data": message
    }
    print("Kafka message: ", kafka_message)
    
    return kafka_message