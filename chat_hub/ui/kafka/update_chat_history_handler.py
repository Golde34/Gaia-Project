import json
from aiokafka import ConsumerRecord

from core.domain.request.memory_request import MemoryRequest
from core.service.memory_service import update_recursive_summary, update_long_term_memory


async def update_recursive_summary_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    print(f"Received payload for update_recursive_summary: {payload}")
    # Extract data from Kafka message format if needed
    data = payload.get('data', payload) if isinstance(payload, dict) else payload
    memory_request: MemoryRequest = MemoryRequest(**data)
    return await update_recursive_summary(memory_request) 

async def update_long_term_memory_handler(msg: ConsumerRecord):
    ## convert message string value to json
    payload = json.loads(msg.value)
    print(f"Received payload for update_long_term_memory: {payload}")
    # Extract data from Kafka message format if needed
    data = payload.get('data', payload) if isinstance(payload, dict) else payload
    memory_request: MemoryRequest = MemoryRequest(**data)
    
    return await update_long_term_memory(memory_request)
