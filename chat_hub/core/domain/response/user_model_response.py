from pydantic import BaseModel

from kernel.utils.parse_json import to_camel


class UserModelResponse(BaseModel):
    id: int
    model_name: str
    model_key: str
    user_id: int

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True
    }

class SystemModelInfo(BaseModel):
    model_name: str
    model_key: str
