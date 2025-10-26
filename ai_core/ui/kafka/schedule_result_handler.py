import json
from aiokafka import ConsumerRecord

from ui.sse.connection_registry import broadcast_to_user


async def schedule_result_handler(msg: ConsumerRecord):
    payload = json.loads(msg.value)
    print(f"Received payload for schedule_result_handler: {payload}")

    data = payload.get("data", {})
    user_id = str(data.get("userId") or "")
    if not user_id:
        print("schedule_result_handler: missing userId in message data")
        return

    response = data.get("response", {})
    event_payload = {
        "type": "register_calendar",
        "userId": user_id,
        "data": {
            "response": response,
            "userId": user_id,
        },
    }

    await broadcast_to_user(user_id, "register_calendar_result", event_payload)
