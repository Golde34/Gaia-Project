from core.domain.request.chat_hub_request import SendMessageRequest
from core.service.integration.dialogue_service import dialogue_service
from core.service.integration.message_service import message_service
from kernel.utils import build_header


class ChatInteractionUsecase:
    @classmethod
    async def initiate_chat(cls, user_id: int):
        sse_token = build_header.generate_sse_token(user_id=user_id)
        if sse_token is None:
            raise Exception("Failed to generate SSE token")
        return sse_token

    @classmethod
    async def get_chat_history_from_db(cls, user_id: int, dialogue_id: str, chat_type: str, size: int, cursor: str):
        try:
            dialogue = await dialogue_service.get_or_create_dialogue(user_id=user_id, dialogue_id=dialogue_id, msg_type=chat_type)
            if dialogue is None:
                raise Exception("Failed to get or create dialogue")
            messages, has_more = await message_service.get_messages_by_dialogue_id_with_cursor_pagination(dialogue.id, size, cursor)
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
    async def handle_send_message(cls, request: SendMessageRequest):
        # decode sse token to get user id
        # get or create dialogue
        # create user message in db
        # validate user model
        # chat (call chat usecase to get bot message)
        # store bot message in db
        pass

            
chat_interaction_usecase = ChatInteractionUsecase()
