from core.domain.enums.enum import SenderTypeEnum
from core.domain.request.query_request import QueryRequest
from core.service import sse_stream_service
from core.service.integration.message_service import message_service
from core.service.integration.dialogue_service import dialogue_service


async def push_and_save_bot_message(message: str, query: QueryRequest) -> None:
    dialogue, _ = await dialogue_service.get_dialogue_by_id(query.user_id, query.dialogue_id)
    bot_message_id = await message_service.create_message(
        dialogue=dialogue,
        user_id=query.user_id,
        message=message,
        message_type=query.type,
        sender_type=SenderTypeEnum.BOT.value,
        user_message_id=query.user_message_id,
    )
    print("Bot message created with ID:", bot_message_id)
    await sse_stream_service.handle_broadcast_mode(
            user_id=str(query.user_id),
            response=message,
            dialogue_id=query.dialogue_id
        )
    print(f"Broadcasted bot message {bot_message_id} for dialogue ID: {query.dialogue_id}")
