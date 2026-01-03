from core.domain.enums.enum import SenderTypeEnum, DialogueEnum
from core.domain.request.query_request import QueryRequest
from core.service import sse_stream_service
from core.service.integration.message_service import message_service
from core.service.integration.dialogue_service import dialogue_service


async def push_and_save_bot_message(message: str, query: QueryRequest, type: str) -> None:
    dialogue = await dialogue_service.get_dialogue_by_id(query.user_id, query.dialogue_id)
    bot_message_id = await message_service.create_message(
        dialogue=dialogue,
        user_id=query.user_id,
        message=message,
        message_type=query.type,
        sender_type=SenderTypeEnum.BOT.value,
        user_message_id=query.user_message_id,
    )
    print("Bot message created with ID:", bot_message_id)
    await push_message(message, query, type) 
    print(f"Broadcasted bot message {bot_message_id} for dialogue ID: {query.dialogue_id}")

async def push_message(message: str, query: QueryRequest, type: str):
    if (type == DialogueEnum.GAIA_INTRODUCTION_TYPE.value or
        type == DialogueEnum.REGISTER_SCHEDULE_CALENDAR_TYPE.value):
        await sse_stream_service.handle_legacy_mode(
            response=message 
        )
    else:
        await sse_stream_service.handle_broadcast_mode(
            user_id=str(query.user_id),
            response=message,
            dialogue_id=query.dialogue_id
        ) 