import asyncio
import json
import os
from typing import List
from random import shuffle

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()
loop = asyncio.get_event_loop()

spidey_names: List[str] = os.environ.get("SPIDEY_NAMES").split(",")
kafka_bootstrap_servers: str = os.environ.get("KAFKA_BOOTSTRAP_SERVERS")
spiderweb_topic: str = os.environ.get("SPIDERWEB_TOPIC")
my_name: str = os.environ.get("MY_NAME")

mapping_place = {
    3: "name is the Winner!!!",
    2: "name is the Second Place!!!",
    1: "name is the third Place!!!",
}


def spidey_random(spidey_list: List) -> List:
    shuffle(spidey_list)
    return spidey_list


async def play_turn(finalists: List):
    spidey_order = spidey_random(finalists)
    await send_one(topic=spiderweb_topic, msg=spidey_order)


def kafka_serializer(value):
    return json.dumps(value).encode()


def encode_json(msg):
    to_load = msg.value.decode("utf-8")
    return json.loads(to_load)


def check_spidey(finalists: List) -> bool:
    return my_name == finalists[0]


def check_spidey(finalists: List) -> bool:
    return my_name == finalists[0]

async def send_one(topic: str, msg: List):
    try:
        producer = AIOKafkaProducer(
            bootstrap_servers=kafka_bootstrap_servers
        )
        await producer.start()

        try:
            await producer.send_and_wait(topic, kafka_serializer(msg))
        finally:
            await producer.stop()

    except Exception as err:
        print(f"Some Kafka error: {err}")


async def spiderweb_turn(msg):
    finalists = encode_json(msg)
    is_my_turn = check_spidey(finalists)

    if is_my_turn:
        print(mapping_place[len(finalists)].replace('name', my_name))

        if len(finalists) > 1:
            finalists.pop(0)
            await play_turn(finalists)


kafka_actions = {
    "spiderweb": spiderweb_turn,
}


async def consume():
    consumer = AIOKafkaConsumer(
        spiderweb_topic,
        loop=loop,
        bootstrap_servers=kafka_bootstrap_servers,
    )

    try:
        await consumer.start()

    except Exception as e:
        print(e)
        return

    try:
        async for msg in consumer:
            await kafka_actions[msg.topic](msg)

    finally:
        await consumer.stop()


asyncio.create_task(consume())