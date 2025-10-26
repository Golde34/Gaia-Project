import json
from aiokafka import ConsumerRecord

from core.service.chat_service import update_recursive_summary, update_long_term_memory


async def update_recursive_summary_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    print(f"Received payload for update_recursive_summary: {payload}") 
    return await update_recursive_summary(payload['user_id'], payload['dialogue_id']) 

async def update_long_term_memory_handler(msg: ConsumerRecord):
    ## convert message string value to json
    payload = json.loads(msg.value)
    print(f"Received payload for update_long_term_memory: {payload}")
    
    return await update_long_term_memory(payload['user_id'], payload['dialogue_id'])
