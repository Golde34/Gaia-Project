import functools

from core.abilities.ability_routers import MESSAGE_TYPE_CONVERTER
from core.domain.enums.enum import SenderTypeEnum, ChatType
from core.domain.request.chat_hub_request import SendMessageRequest
from core.domain.request.query_request import QueryRequest
from core.service import sse_stream_service
from core.service.integration import auth_service
from core.service.integration.dialogue_service import dialogue_service
from core.service.integration.message_service import message_service
from core.usecase.chat import ChatUsecase as chat_usecase
from kernel.utils import build_header


class ChatInteractionUsecase:
    @classmethod
    async def initiate_chat(cls, user_id: int):
        sse_token = build_header.generate_sse_token(user_id=user_id)
        if sse_token is None:
            raise Exception("Failed to generate SSE token")
        return sse_token

    @classmethod
    async def get_chat_history_from_db(
        cls, 
        user_id: int, 
        dialogue_id: str, 
        chat_type: str, 
        size: int, 
        cursor: str):
        try:
            dialogue, _ = await dialogue_service.get_or_create_dialogue(
                user_id=user_id, dialogue_id=dialogue_id, msg_type=chat_type)
            if dialogue is None:
                raise Exception("Failed to get or create dialogue")
            messages, has_more = await message_service.get_messages_by_dialogue_id_with_cursor_pagination(
                dialogue.id, size, cursor)
            next_cursor = None
            if len(messages) > 0:
                next_cursor = messages[0].created_at
            return {
                "dialogue": dialogue,
                "chatMessages": messages,
                "nextCursor": next_cursor,
                "hasMore": has_more
            }
        except Exception as e:
            raise e

    @classmethod
    async def get_chat_dialogues(cls, user_id: int, size: int, cursor: str):
        dialogues, has_more = await dialogue_service.get_all_dialogues_by_user_id(user_id, size, cursor)
        if len(dialogues) > 0:
            next_cursor = dialogues[0].created_at
        return {
            "dialogues": dialogues,
            "nextCursor": next_cursor,
            "hasMore": has_more
        }

    @classmethod
    async def handle_send_message(cls, user_id: int, request: SendMessageRequest):
        handler = functools.partial(cls._create_message_flow, user_id, request)
        return await sse_stream_service.handle_sse_stream(
            user_id=user_id,
            func=handler,
            meta={'dialogue_id': request.dialogue_id},
        )

    @classmethod
    async def _create_message_flow(cls, user_id: int, request: SendMessageRequest):
        dialogue, is_change_title = await dialogue_service.get_or_create_dialogue(
            user_id=user_id, dialogue_id=request.dialogue_id, msg_type=request.msg_type)
        if dialogue is None:
            raise Exception("Failed to get or create dialogue")

        user_message_id = await message_service.create_message(
            dialogue=dialogue,
            user_id=user_id,
            message=request.message,
            message_type=request.msg_type,
            sender_type=SenderTypeEnum.USER.value,
            user_message_id=None
        )

        user_model = await auth_service.get_user_model(user_id)

        query_request: QueryRequest = QueryRequest(
            user_id=user_id,
            query=request.message,
            model=user_model,
            dialogue_id=str(dialogue.id),
            type=request.msg_type,
        )

        chat_type = MESSAGE_TYPE_CONVERTER.get(
            request.msg_type, ChatType.ABILITIES.value)
        bot_response = await chat_usecase.chat(
            query=query_request, 
            chat_type=chat_type, 
            user_message_id=user_message_id, 
            is_change_title=is_change_title)

        bot_message_id = await message_service.create_message(
            dialogue=dialogue,
            user_id=user_id,
            message=bot_response,
            message_type=request.msg_type,
            sender_type=SenderTypeEnum.BOT.value,
            user_message_id=str(user_message_id),
        )
        print("Bot response stored with message ID:", bot_message_id)
        return bot_response


chat_interaction_usecase = ChatInteractionUsecase()
