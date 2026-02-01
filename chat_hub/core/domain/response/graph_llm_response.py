from pydantic import BaseModel

class WBOSObject(BaseModel):
    W: str
    B: str
    O: str
    S: str


class SlmExtractionResponse(BaseModel):
    wbos: WBOSObject
    topic: str
    user_query: str
    response: str | None
    confidence_score: float
    tool: str
    routing_decision: str
