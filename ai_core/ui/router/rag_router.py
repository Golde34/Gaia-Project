from fastapi import APIRouter, HTTPException
import traceback

from core.domain.request import query_request
from ui.controller.rag_controller import insert_rag_data 


RagRouter = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)

@RagRouter.post("/upload-context")
async def upload_context(request: query_request.RAGRequest):
    try:
        print("Received RAG insert request:", request)
        return await insert_rag_data(request)
    except Exception as e:
        stack_trace = traceback.format_exc()
        print("ERROR:", stack_trace)
        raise HTTPException(status_code=500, detail=str(e))