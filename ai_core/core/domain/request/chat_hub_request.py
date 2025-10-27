from pydantic import BaseModel

from kernel.utils.parse_json import to_camel

class RecentHistoryRequest(BaseModel):
    user_id: str
    dialogue_id: str
    number_of_messages: int = 5

class SendMessageRequest(BaseModel):
    dialogue_id: str
    message: str
    msg_type: str
    sse_token: str

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True
    }